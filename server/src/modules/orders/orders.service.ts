import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../utils/http.js";
import { calculateOrderTotals } from "../../utils/order.js";

const normalizePaymentMethod = (value: "MOBILE_MONEY_CARD" | "COD" | "card" | "cod") =>
  value === "COD" || value === "cod" ? "COD" : "MOBILE_MONEY_CARD";

const createOrderNumber = (): string => {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${suffix}`;
};

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    payment: true;
    address: true;
    items: {
      include: {
        product: {
          include: {
            images: true;
          };
        };
      };
    };
  };
}>;

const serializeOrder = (order: OrderWithRelations) => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    subtotalMinor: order.subtotalMinor,
    taxMinor: order.taxMinor,
    shippingMinor: order.shippingMinor,
    totalMinor: order.totalMinor,
    createdAt: order.createdAt,
    payment: order.payment
      ? {
          method: order.payment.method,
          status: order.payment.status,
          providerRef: order.payment.providerRef,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      productBrand: item.productBrand,
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      lineTotalMinor: item.lineTotalMinor,
      imageUrl: item.product.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? null,
    })),
    address: order.address
      ? {
          firstName: order.address.firstName,
          lastName: order.address.lastName,
          line1: order.address.line1,
          city: order.address.city,
          phone: order.address.phone,
        }
      : null,
  };
};

export const createOrderFromActiveCart = async (
  userId: string,
  input: {
    shippingAddress: {
      firstName: string;
      lastName: string;
      line1: string;
      city: string;
      phone: string;
    };
    paymentMethod: "MOBILE_MONEY_CARD" | "COD" | "card" | "cod";
  },
) => {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    notFound("No active cart with items found");
  }
  const activeCart = cart!;

  const totals = calculateOrderTotals(
    activeCart.items.map((item) => ({
      priceMinor: item.variant.product.priceMinor,
      quantity: item.quantity,
    })),
    0.05,
    0,
  );

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId,
        firstName: input.shippingAddress.firstName.trim(),
        lastName: input.shippingAddress.lastName.trim(),
        line1: input.shippingAddress.line1.trim(),
        city: input.shippingAddress.city.trim(),
        phone: input.shippingAddress.phone.trim(),
      },
    });

    const created = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId,
        cartId: activeCart.id,
        addressId: address.id,
        status: "PENDING",
        currency: "UGX",
        subtotalMinor: totals.subtotalMinor,
        taxMinor: totals.taxMinor,
        shippingMinor: totals.shippingMinor,
        totalMinor: totals.totalMinor,
        items: {
          create: activeCart.items.map((item) => ({
            productId: item.variant.productId,
            variantId: item.variantId,
            productName: item.variant.product.name,
            productBrand: item.variant.product.brand,
            unitPriceMinor: item.variant.product.priceMinor,
            quantity: item.quantity,
            lineTotalMinor: item.variant.product.priceMinor * item.quantity,
          })),
        },
        payment: {
          create: {
            method: normalizePaymentMethod(input.paymentMethod),
            status: "PENDING",
          },
        },
      },
      include: {
        payment: true,
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    await tx.cart.update({
      where: { id: activeCart.id },
      data: { status: "CONVERTED" },
    });

    await tx.cart.create({
      data: {
        userId,
        status: "ACTIVE",
      },
    });

    return created;
  });

  return serializeOrder(order);
};

export const listOrdersByUser = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      payment: true,
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
};

const getOrderByOrderNumberInternal = (userId: string, orderNumber: string) => {
  return prisma.order.findFirst({
    where: {
      userId,
      orderNumber,
    },
    include: {
      payment: true,
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });
};

export const getOrderByOrderNumber = async (userId: string, orderNumber: string) => {
  const order = await getOrderByOrderNumberInternal(userId, orderNumber);
  if (!order) {
    notFound("Order not found");
  }
  return serializeOrder(order!);
};
