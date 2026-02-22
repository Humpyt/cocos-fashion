import { User } from "../types";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:4000";
const ACCESS_TOKEN_KEY = "cocos_access_token";
const GUEST_ID_KEY = "cocos_guest_id";

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    variantId?: string | null;
    productName: string;
    productBrand: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
    imageUrl: string | null;
  }>;
}

export interface ApiCatalogProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description?: string | null;
  details?: unknown;
  currency: "UGX";
  priceMinor: number;
  originalPriceMinor?: number | null;
  rating: number;
  reviewsCount: number;
  badge?: string | null;
  isNew?: boolean;
  images?: Array<{ id: string; url: string; sortOrder: number }>;
  variants?: Array<{
    id: string;
    sku: string;
    size?: string | null;
    colorName?: string | null;
    colorHex?: string | null;
    stockQty: number;
  }>;
  categories?: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
}

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

export interface AdminOverview {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenueMinor: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  rewardTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  rewardPoints: number;
  nextTierPoints: number;
  ordersCount: number;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  address: {
    firstName: string;
    lastName: string;
    line1: string;
    city: string;
    phone: string;
  } | null;
  payment: {
    method: string;
    status: string;
    providerRef: string | null;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    productName: string;
    productBrand: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
    imageUrl: string | null;
    variantSku: string | null;
  }>;
}

interface ApiCart {
  id: string | null;
  status: string;
  subtotalMinor: number;
  totalItems: number;
  items: Array<{
    id: string;
    quantity: number;
    variant: { id: string; sku: string };
    product: {
      id: string;
      slug: string;
      name: string;
      brand: string;
      currency: string;
      priceMinor: number;
      originalPriceMinor?: number | null;
      imageUrl?: string | null;
    };
  }>;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

const buildHeaders = (options: RequestOptions): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  return headers;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: buildHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const json = await response.json();
      if (json.message) {
        message = json.message;
      }
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const tokenStore = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getOrCreateGuestId() {
    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing) {
      return existing;
    }
    const generated = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, generated);
    return generated;
  },
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

export const authApi = {
  async login(payload: { email: string; password: string }) {
    return request<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: payload,
    });
  },
  async register(payload: { email: string; password: string; firstName: string; lastName: string }) {
    return request<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body: payload,
    });
  },
  async refresh() {
    return request<AuthResponse>("/v1/auth/refresh", {
      method: "POST",
      body: {},
    });
  },
  async logout(token?: string | null) {
    return request<void>("/v1/auth/logout", {
      method: "POST",
      token: token ?? undefined,
      body: {},
    });
  },
  async me(token: string) {
    return request<User>("/v1/auth/me", { token });
  },
};

export const ordersApi = {
  async list(token: string) {
    return request<ApiOrder[]>("/v1/orders", { token });
  },
  async checkout(
    token: string,
    payload: {
      shippingAddress: {
        firstName: string;
        lastName: string;
        line1: string;
        city: string;
        phone: string;
      };
      paymentMethod: "MOBILE_MONEY_CARD" | "COD";
    },
  ) {
    return request<ApiOrder>("/v1/checkout/orders", {
      method: "POST",
      token,
      body: payload,
    });
  },
};

export const catalogApi = {
  async listProducts(params?: { category?: string; search?: string; sort?: string; page?: number; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.search) search.set("search", params.search);
    if (params?.sort) search.set("sort", params.sort);
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));

    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<{ items: ApiCatalogProduct[]; total: number; page: number; limit: number }>(`/v1/products${suffix}`);
  },
  async listCategories() {
    return request<ApiCategory[]>("/v1/categories");
  },
};

export const cartApi = {
  async get(token?: string | null, guestId?: string) {
    return request<ApiCart>("/v1/cart", {
      token: token ?? undefined,
      headers: guestId ? { "x-guest-id": guestId } : undefined,
    });
  },
  async addItem(input: { variantId: string; quantity: number; token?: string | null; guestId?: string }) {
    return request<ApiCart>("/v1/cart/items", {
      method: "POST",
      token: input.token ?? undefined,
      headers: input.guestId ? { "x-guest-id": input.guestId } : undefined,
      body: {
        variantId: input.variantId,
        quantity: input.quantity,
      },
    });
  },
  async merge(token: string, guestId: string) {
    return request<ApiCart>("/v1/cart/merge", {
      method: "POST",
      token,
      body: { guestId },
    });
  },
};

export const wishlistApi = {
  async list(token: string) {
    return request<Array<{ productId: string }>>("/v1/wishlist", { token });
  },
  async add(token: string, productId: string) {
    return request<Array<{ productId: string }>>(`/v1/wishlist/${productId}`, {
      method: "POST",
      token,
      body: {},
    });
  },
  async remove(token: string, productId: string) {
    return request<Array<{ productId: string }>>(`/v1/wishlist/${productId}`, {
      method: "DELETE",
      token,
    });
  },
  async merge(token: string, productIds: string[]) {
    return request<Array<{ productId: string }>>("/v1/wishlist/merge", {
      method: "POST",
      token,
      body: { productIds },
    });
  },
};

export const adminApi = {
  async getOverview(token: string) {
    return request<AdminOverview>("/v1/admin/overview", { token });
  },
  async listUsers(token: string) {
    return request<AdminUser[]>("/v1/admin/users", { token });
  },
  async updateUserRole(token: string, userId: string, role: "CUSTOMER" | "ADMIN") {
    return request<{ id: string; role: "CUSTOMER" | "ADMIN" }>(`/v1/admin/users/${userId}/role`, {
      method: "PATCH",
      token,
      body: { role },
    });
  },
  async updateUserRewards(
    token: string,
    userId: string,
    payload: { rewardTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"; rewardPoints?: number; nextTierPoints?: number },
  ) {
    return request<{ id: string; rewardTier: string; rewardPoints: number; nextTierPoints: number }>(
      `/v1/admin/users/${userId}/rewards`,
      {
        method: "PATCH",
        token,
        body: payload,
      },
    );
  },
  async listCategories(token: string) {
    return request<AdminCategory[]>("/v1/admin/categories", { token });
  },
  async createCategory(token: string, payload: { name: string; slug?: string }) {
    return request<AdminCategory>("/v1/admin/categories", {
      method: "POST",
      token,
      body: payload,
    });
  },
  async updateCategory(token: string, categoryId: string, payload: { name?: string; slug?: string }) {
    return request<AdminCategory>(`/v1/admin/categories/${categoryId}`, {
      method: "PATCH",
      token,
      body: payload,
    });
  },
  async deleteCategory(token: string, categoryId: string) {
    return request<void>(`/v1/admin/categories/${categoryId}`, {
      method: "DELETE",
      token,
    });
  },
  async listProducts(
    token: string,
    params?: { search?: string; categoryId?: string; active?: boolean; page?: number; limit?: number },
  ) {
    const search = new URLSearchParams();
    if (params?.search) search.set("search", params.search);
    if (params?.categoryId) search.set("categoryId", params.categoryId);
    if (params?.active !== undefined) search.set("active", String(params.active));
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const suffix = search.toString() ? `?${search.toString()}` : "";

    return request<{ total: number; page: number; limit: number; items: ApiCatalogProduct[] }>(
      `/v1/admin/products${suffix}`,
      { token },
    );
  },
  async createProduct(
    token: string,
    payload: {
      slug?: string;
      brand: string;
      name: string;
      description?: string | null;
      details?: string[] | null;
      priceMinor: number;
      originalPriceMinor?: number | null;
      rating?: number;
      reviewsCount?: number;
      badge?: string | null;
      isNew?: boolean;
      active?: boolean;
      imageUrl: string;
      categoryIds: string[];
      variant: {
        sku?: string;
        size?: string | null;
        colorName?: string | null;
        colorHex?: string | null;
        stockQty: number;
      };
    },
  ) {
    return request<ApiCatalogProduct>("/v1/admin/products", {
      method: "POST",
      token,
      body: payload,
    });
  },
  async updateProduct(token: string, productId: string, payload: Record<string, unknown>) {
    return request<ApiCatalogProduct>(`/v1/admin/products/${productId}`, {
      method: "PATCH",
      token,
      body: payload,
    });
  },
  async deleteProduct(token: string, productId: string) {
    return request<void>(`/v1/admin/products/${productId}`, {
      method: "DELETE",
      token,
    });
  },
  async listOrders(token: string) {
    return request<AdminOrder[]>("/v1/admin/orders", { token });
  },
  async updateOrderStatus(
    token: string,
    orderId: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  ) {
    return request<AdminOrder>(`/v1/admin/orders/${orderId}/status`, {
      method: "PATCH",
      token,
      body: { status },
    });
  },
};
