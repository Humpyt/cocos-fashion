import { randomUUID } from "node:crypto";
import request from "supertest";
import { prisma } from "../../src/lib/prisma.js";
import { app } from "../../src/app.js";

const maybeDescribe = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;

maybeDescribe("API integration", () => {
  const agent = request.agent(app);
  const email = `itest-${Date.now()}@example.com`;
  const password = "Password123!";

  let accessToken = "";
  let productId = "";
  let variantId = "";

  beforeAll(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    const category = await prisma.category.create({
      data: {
        slug: "integration",
        name: "Integration",
      },
    });

    const product = await prisma.product.create({
      data: {
        slug: "integration-product",
        brand: "Integration Brand",
        name: "Integration Product",
        currency: "UGX",
        priceMinor: 120000,
        reviewsCount: 12,
        rating: 4.5,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: "https://example.com/p.jpg",
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "INTEGRATION-SKU-1",
        stockQty: 20,
      },
    });

    await prisma.productCategory.create({
      data: {
        productId: product.id,
        categoryId: category.id,
      },
    });

    productId = product.id;
    variantId = variant.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers and logs in", async () => {
    const response = await agent.post("/v1/auth/register").send({
      email,
      password,
      firstName: "Integration",
      lastName: "User",
    });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeTypeOf("string");
    accessToken = response.body.accessToken;
  });

  it("returns current user and refreshes token", async () => {
    const me = await agent
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);

    const refreshed = await agent.post("/v1/auth/refresh").send({});
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeTypeOf("string");
    accessToken = refreshed.body.accessToken;
  });

  it("merges guest cart into authenticated cart", async () => {
    const guestId = randomUUID();

    const guestAdd = await agent
      .post("/v1/cart/items")
      .set("x-guest-id", guestId)
      .send({ variantId, quantity: 2 });
    expect(guestAdd.status).toBe(200);
    expect(guestAdd.body.items).toHaveLength(1);

    const merge = await agent
      .post("/v1/cart/merge")
      .set("x-guest-id", guestId)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});
    expect(merge.status).toBe(200);
    expect(merge.body.totalItems).toBe(2);
  });

  it("adds wishlist item and creates checkout order", async () => {
    const wishlist = await agent
      .post(`/v1/wishlist/${productId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});
    expect(wishlist.status).toBe(200);
    expect(wishlist.body).toHaveLength(1);

    const checkout = await agent
      .post("/v1/checkout/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        paymentMethod: "COD",
        shippingAddress: {
          firstName: "Integration",
          lastName: "User",
          line1: "Bukoto, Kampala",
          city: "Kampala",
          phone: "+256700000000",
        },
      });

    expect(checkout.status).toBe(201);
    expect(checkout.body.orderNumber).toBeTypeOf("string");

    const orders = await agent
      .get("/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(orders.status).toBe(200);
    expect(orders.body.length).toBeGreaterThan(0);
  });
});
