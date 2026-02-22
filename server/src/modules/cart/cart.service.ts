import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { calculateOrderTotals } from "../../utils/order.js";
import { badRequest, notFound } from "../../utils/http.js";
import { mergeCartLineItems } from "./cart.utils.js";

interface CartOwner {
  userId?: string;
  guestId?: string;
}

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

const ensureOwner = (owner: CartOwner) => {
  if (!owner.userId && !owner.guestId) {
    badRequest("A signed-in user or guest_id is required");
  }
};

const buildOwnerWhere = (owner: CartOwner): Prisma.CartWhereInput => {
  if (owner.userId) {
    return { userId: owner.userId };
  }
  return { guestId: owner.guestId };
};

const serializeCart = (
  cart: Prisma.CartGetPayload<{
    include: typeof cartInclude;
  }>,
) => {
  const items = cart.items.map((item) => {
    const product = item.variant.product;
    const primaryImage = product.images.sort((a, b) => a.sortOrder - b.sortOrder)[0];
    return {
      id: item.id,
      quantity: item.quantity,
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        size: item.variant.size,
        colorName: item.variant.colorName,
        colorHex: item.variant.colorHex,
      },
      product: {
        id: product.id,
        slug: product.slug,
        brand: product.brand,
        name: product.name,
        currency: product.currency,
        priceMinor: product.priceMinor,
        originalPriceMinor: product.originalPriceMinor,
        imageUrl: primaryImage?.url ?? null,
      },
      lineTotalMinor: product.priceMinor * item.quantity,
    };
  });

  const totals = calculateOrderTotals(
    items.map((item) => ({
      priceMinor: item.product.priceMinor,
      quantity: item.quantity,
    })),
    0,
    0,
  );

  return {
    id: cart.id,
    status: cart.status,
    items,
    subtotalMinor: totals.subtotalMinor,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

export const getOrCreateActiveCart = async (owner: CartOwner) => {
  ensureOwner(owner);

  const where = buildOwnerWhere(owner);
  let cart = await prisma.cart.findFirst({
    where: {
      ...where,
      status: "ACTIVE",
    },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: owner.userId,
        guestId: owner.guestId,
        status: "ACTIVE",
      },
      include: cartInclude,
    });
  }

  return cart;
};

export const getCart = async (owner: CartOwner) => {
  ensureOwner(owner);
  const cart = await getOrCreateActiveCart(owner);
  return serializeCart(cart);
};

export const addCartItem = async (
  owner: CartOwner,
  input: {
    variantId: string;
    quantity: number;
  },
) => {
  ensureOwner(owner);

  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
  });
  if (!variant) {
    notFound("Product variant not found");
  }

  const cart = await getOrCreateActiveCart(owner);
  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: input.variantId,
      },
    },
    update: {
      quantity: {
        increment: input.quantity,
      },
    },
    create: {
      cartId: cart.id,
      variantId: input.variantId,
      quantity: input.quantity,
    },
  });

  const reloaded = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });
  if (!reloaded) {
    notFound("Cart not found");
  }
  return serializeCart(reloaded!);
};

export const updateCartItemQuantity = async (
  owner: CartOwner,
  itemId: string,
  quantity: number,
) => {
  ensureOwner(owner);
  const cart = await getOrCreateActiveCart(owner);

  const existing = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });
  if (!existing) {
    notFound("Cart item not found");
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  const reloaded = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });
  if (!reloaded) {
    notFound("Cart not found");
  }
  return serializeCart(reloaded!);
};

export const deleteCartItem = async (owner: CartOwner, itemId: string) => {
  ensureOwner(owner);
  const cart = await getOrCreateActiveCart(owner);

  const existing = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });
  if (!existing) {
    notFound("Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  const reloaded = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });
  if (!reloaded) {
    notFound("Cart not found");
  }
  return serializeCart(reloaded!);
};

export const mergeGuestCartIntoUser = async (userId: string, guestId: string) => {
  const [guestCart, userCart] = await Promise.all([
    prisma.cart.findFirst({
      where: {
        guestId,
        status: "ACTIVE",
      },
      include: { items: true },
    }),
    getOrCreateActiveCart({ userId }),
  ]);

  if (!guestCart) {
    const current = await getOrCreateActiveCart({ userId });
    return serializeCart(current!);
  }

  const merged = mergeCartLineItems(
    userCart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    guestCart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
  );

  await prisma.$transaction(async (tx) => {
    for (const item of merged) {
      await tx.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: item.variantId,
          },
        },
        update: {
          quantity: item.quantity,
        },
        create: {
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: guestCart.id,
      },
    });

    await tx.cart.update({
      where: { id: guestCart.id },
      data: {
        status: "ABANDONED",
      },
    });
  });

  const reloaded = await prisma.cart.findUnique({
    where: { id: userCart.id },
    include: cartInclude,
  });
  if (!reloaded) {
    notFound("Cart not found");
  }
  return serializeCart(reloaded!);
};
