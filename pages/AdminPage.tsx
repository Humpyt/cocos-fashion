import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, AdminCategory, AdminOrder, AdminOverview, AdminUser, ApiCatalogProduct, tokenStore } from '../lib/api';
import { User } from '../types';

type TabId = 'overview' | 'analytics' | 'products' | 'categories' | 'orders' | 'users';

interface Props {
  user: User;
  onSignOut: () => void;
}

const ORDER_STATUSES: Array<AdminOrder['status']> = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const formatUGX = (value: number) => `UGX ${value.toLocaleString()}`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const AdminPage: React.FC<Props> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [products, setProducts] = useState<ApiCatalogProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rewardDrafts, setRewardDrafts] = useState<Record<string, { rewardPoints: number; nextTierPoints: number; rewardTier: AdminUser['rewardTier'] }>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    brand: '',
    name: '',
    slug: '',
    description: '',
    priceMinor: 0,
    originalPriceMinor: 0,
    rating: 0,
    reviewsCount: 0,
    badge: '',
    isNew: false,
    active: true,
    imageUrl: '',
    categoryIds: [] as string[],
    sku: '',
    size: '',
    colorName: '',
    colorHex: '',
    stockQty: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    slug: '',
  });

  const token = tokenStore.getAccessToken();

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const loadAdminData = async () => {
    if (!token) {
      setErrorMessage('Missing session token. Please sign in again.');
      return;
    }

    setLoading(true);
    resetMessages();
    try {
      const [overviewData, productsData, categoriesData, ordersData, usersData] = await Promise.all([
        adminApi.getOverview(token),
        adminApi.listProducts(token, { page: 1, limit: 100 }),
        adminApi.listCategories(token),
        adminApi.listOrders(token),
        adminApi.listUsers(token),
      ]);

      setOverview(overviewData);
      setProducts(productsData.items);
      setCategories(categoriesData);
      setOrders(ordersData);
      setUsers(usersData);
      setRewardDrafts(
        Object.fromEntries(
          usersData.map((item) => [
            item.id,
            {
              rewardPoints: item.rewardPoints,
              nextTierPoints: item.nextTierPoints,
              rewardTier: item.rewardTier,
            },
          ]),
        ),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) {
      return products;
    }
    const q = productSearch.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.slug.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const analytics = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const start30 = now - 30 * dayMs;
    const start60 = now - 60 * dayMs;

    const statusCounts = Object.fromEntries(
      ORDER_STATUSES.map((status) => [status, orders.filter((order) => order.status === status).length]),
    ) as Record<AdminOrder['status'], number>;

    const nonCancelledOrders = orders.filter((order) => order.status !== 'CANCELLED');
    const nonCancelledRevenueMinor = nonCancelledOrders.reduce((sum, order) => sum + order.totalMinor, 0);

    const revenueLast30 = nonCancelledOrders
      .filter((order) => new Date(order.createdAt).getTime() >= start30)
      .reduce((sum, order) => sum + order.totalMinor, 0);
    const revenuePrev30 = nonCancelledOrders
      .filter((order) => {
        const createdAt = new Date(order.createdAt).getTime();
        return createdAt >= start60 && createdAt < start30;
      })
      .reduce((sum, order) => sum + order.totalMinor, 0);
    const revenueGrowthPercent = revenuePrev30 > 0
      ? ((revenueLast30 - revenuePrev30) / revenuePrev30) * 100
      : (revenueLast30 > 0 ? 100 : 0);

    const totalOrders = orders.length;
    const deliveredCount = statusCounts.DELIVERED;
    const fulfilledCount = statusCounts.DELIVERED + statusCounts.SHIPPED;
    const cancelledCount = statusCounts.CANCELLED;
    const averageOrderValueMinor = totalOrders > 0 ? nonCancelledRevenueMinor / totalOrders : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;
    const fulfillmentRate = totalOrders > 0 ? (fulfilledCount / totalOrders) * 100 : 0;

    const activeCustomerIds = new Set(orders.map((order) => order.user?.id).filter((id): id is string => Boolean(id)));
    const activeCustomerIds30 = new Set(
      orders
        .filter((order) => new Date(order.createdAt).getTime() >= start30)
        .map((order) => order.user?.id)
        .filter((id): id is string => Boolean(id)),
    );
    const usersWithOrders = users.filter((adminUser) => adminUser.ordersCount > 0).length;
    const returningCustomers = users.filter((adminUser) => adminUser.ordersCount > 1).length;
    const returningRate = usersWithOrders > 0 ? (returningCustomers / usersWithOrders) * 100 : 0;
    const newUsers30 = users.filter((adminUser) => new Date(adminUser.createdAt).getTime() >= start30).length;

    const daySeriesMap = new Map<string, { label: string; revenueMinor: number; orders: number }>();
    for (let offset = 13; offset >= 0; offset -= 1) {
      const date = new Date(now - offset * dayMs);
      const key = toDateKey(date);
      daySeriesMap.set(key, {
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenueMinor: 0,
        orders: 0,
      });
    }

    for (const order of nonCancelledOrders) {
      const date = new Date(order.createdAt);
      const key = toDateKey(date);
      const day = daySeriesMap.get(key);
      if (!day) {
        continue;
      }
      day.revenueMinor += order.totalMinor;
      day.orders += 1;
    }

    const dailySeries = [...daySeriesMap.entries()].map(([key, value]) => ({ key, ...value }));
    const maxDailyRevenueMinor = Math.max(...dailySeries.map((day) => day.revenueMinor), 1);
    const maxDailyOrders = Math.max(...dailySeries.map((day) => day.orders), 1);
    const orderSparklinePoints = dailySeries
      .map((day, index) => {
        const x = dailySeries.length === 1 ? 0 : (index / (dailySeries.length - 1)) * 100;
        const y = 100 - (day.orders / maxDailyOrders) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    const topBrandMap = new Map<string, { revenueMinor: number; units: number; orders: Set<string> }>();
    for (const order of nonCancelledOrders) {
      for (const item of order.items) {
        const key = item.productBrand || 'Unknown';
        const existing = topBrandMap.get(key) ?? { revenueMinor: 0, units: 0, orders: new Set<string>() };
        existing.revenueMinor += item.lineTotalMinor;
        existing.units += item.quantity;
        existing.orders.add(order.id);
        topBrandMap.set(key, existing);
      }
    }
    const topBrands = [...topBrandMap.entries()]
      .map(([brand, data]) => ({
        brand,
        revenueMinor: data.revenueMinor,
        units: data.units,
        orders: data.orders.size,
      }))
      .sort((a, b) => b.revenueMinor - a.revenueMinor)
      .slice(0, 6);

    const paymentMethodMap = new Map<string, number>();
    for (const order of orders) {
      const method = order.payment?.method ?? 'UNSPECIFIED';
      paymentMethodMap.set(method, (paymentMethodMap.get(method) ?? 0) + 1);
    }
    const paymentMix = [...paymentMethodMap.entries()]
      .map(([method, count]) => ({
        method,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const cityMap = new Map<string, number>();
    for (const order of orders) {
      const city = order.address?.city?.trim();
      if (!city) {
        continue;
      }
      cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
    }
    const topCities = [...cityMap.entries()]
      .map(([city, count]) => ({
        city,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const variants = products.flatMap((product) => product.variants ?? []);
    const totalVariants = variants.length;
    const outOfStockVariants = variants.filter((variant) => variant.stockQty <= 0).length;
    const lowStockVariants = variants.filter((variant) => variant.stockQty > 0 && variant.stockQty <= 5).length;
    const healthyVariants = variants.filter((variant) => variant.stockQty > 5).length;

    return {
      totalRevenueMinor: overview?.totalRevenueMinor ?? nonCancelledRevenueMinor,
      totalOrders: overview?.totalOrders ?? totalOrders,
      averageOrderValueMinor,
      deliveredCount,
      cancellationRate,
      fulfillmentRate,
      revenueLast30,
      revenuePrev30,
      revenueGrowthPercent,
      activeCustomers: activeCustomerIds.size,
      activeCustomers30: activeCustomerIds30.size,
      newUsers30,
      returningRate,
      dailySeries,
      maxDailyRevenueMinor,
      orderSparklinePoints,
      statusCounts,
      topBrands,
      paymentMix,
      topCities,
      totalVariants,
      outOfStockVariants,
      lowStockVariants,
      healthyVariants,
      topCategories: [...categories]
        .sort((a, b) => b.productsCount - a.productsCount)
        .slice(0, 6),
    };
  }, [orders, users, products, categories, overview]);

  const clearProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      brand: '',
      name: '',
      slug: '',
      description: '',
      priceMinor: 0,
      originalPriceMinor: 0,
      rating: 0,
      reviewsCount: 0,
      badge: '',
      isNew: false,
      active: true,
      imageUrl: '',
      categoryIds: [],
      sku: '',
      size: '',
      colorName: '',
      colorHex: '',
      stockQty: 0,
    });
  };

  const startEditProduct = (product: ApiCatalogProduct) => {
    setEditingProductId(product.id);
    setProductForm({
      brand: product.brand,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      priceMinor: product.priceMinor,
      originalPriceMinor: product.originalPriceMinor || 0,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      badge: product.badge || '',
      isNew: Boolean(product.isNew),
      active: true,
      imageUrl: product.images?.[0]?.url || '',
      categoryIds: product.categories?.map((category) => category.id) || [],
      sku: product.variants?.[0]?.sku || '',
      size: product.variants?.[0]?.size || '',
      colorName: product.variants?.[0]?.colorName || '',
      colorHex: product.variants?.[0]?.colorHex || '',
      stockQty: product.variants?.[0]?.stockQty || 0,
    });
  };

  const submitProductForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    resetMessages();
    if (!productForm.brand || !productForm.name || !productForm.imageUrl || !productForm.categoryIds.length) {
      setErrorMessage('Brand, name, image URL, and at least one category are required.');
      return;
    }

    try {
      const payload = {
        slug: productForm.slug || undefined,
        brand: productForm.brand,
        name: productForm.name,
        description: productForm.description || null,
        priceMinor: Number(productForm.priceMinor),
        originalPriceMinor: productForm.originalPriceMinor ? Number(productForm.originalPriceMinor) : null,
        rating: Number(productForm.rating),
        reviewsCount: Number(productForm.reviewsCount),
        badge: productForm.badge || null,
        isNew: productForm.isNew,
        active: productForm.active,
        imageUrl: productForm.imageUrl,
        categoryIds: productForm.categoryIds,
        variant: {
          sku: productForm.sku || undefined,
          size: productForm.size || null,
          colorName: productForm.colorName || null,
          colorHex: productForm.colorHex || null,
          stockQty: Number(productForm.stockQty),
        },
      };

      if (editingProductId) {
        await adminApi.updateProduct(token, editingProductId, payload);
        setSuccessMessage('Product updated successfully.');
      } else {
        await adminApi.createProduct(token, payload);
        setSuccessMessage('Product created successfully.');
      }

      clearProductForm();
      const refreshed = await adminApi.listProducts(token, { page: 1, limit: 100 });
      setProducts(refreshed.items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!token) return;
    resetMessages();
    try {
      await adminApi.deleteProduct(token, productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setSuccessMessage('Product deactivated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const submitCategoryForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    resetMessages();
    if (!categoryForm.name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    try {
      if (categoryForm.id) {
        await adminApi.updateCategory(token, categoryForm.id, {
          name: categoryForm.name,
          slug: categoryForm.slug || undefined,
        });
        setSuccessMessage('Category updated.');
      } else {
        await adminApi.createCategory(token, {
          name: categoryForm.name,
          slug: categoryForm.slug || undefined,
        });
        setSuccessMessage('Category created.');
      }

      setCategoryForm({ id: '', name: '', slug: '' });
      const refreshed = await adminApi.listCategories(token);
      setCategories(refreshed);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!token) return;
    resetMessages();
    try {
      await adminApi.deleteCategory(token, categoryId);
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      setSuccessMessage('Category deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: AdminOrder['status']) => {
    if (!token) return;
    resetMessages();
    try {
      const updated = await adminApi.updateOrderStatus(token, orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
      setSuccessMessage(`Order ${updated.orderNumber} updated to ${status}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const handleUserRoleChange = async (userId: string, role: AdminUser['role']) => {
    if (!token) return;
    resetMessages();
    try {
      await adminApi.updateUserRole(token, userId, role);
      setUsers((prev) => prev.map((item) => (item.id === userId ? { ...item, role } : item)));
      setSuccessMessage('User role updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const handleUserRewardsSave = async (userId: string) => {
    if (!token) return;
    const draft = rewardDrafts[userId];
    if (!draft) return;

    resetMessages();
    try {
      const updated = await adminApi.updateUserRewards(token, userId, {
        rewardTier: draft.rewardTier,
        rewardPoints: draft.rewardPoints,
        nextTierPoints: draft.nextTierPoints,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId
            ? {
                ...item,
                rewardTier: updated.rewardTier as AdminUser['rewardTier'],
                rewardPoints: updated.rewardPoints,
                nextTierPoints: updated.nextTierPoints,
              }
            : item,
        ),
      );

      setSuccessMessage('User rewards updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update user rewards');
    }
  };

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'orders', label: 'Orders' },
    { id: 'users', label: 'Users' },
  ];

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="bg-white border border-gray-200 p-8">
          <h1 className="text-2xl font-black uppercase mb-3">Admin Access Required</h1>
          <p className="text-sm text-gray-600">Your account does not have admin permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Admin Control Center</h1>
            <p className="text-sm text-gray-500">Manage catalog, orders, users, and platform settings.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadAdminData()}
              className="px-5 py-2.5 border border-gray-300 text-xs font-bold uppercase tracking-widest bg-white hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={onSignOut}
              className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest border ${
                activeTab === tab.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-black hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm font-bold mb-4">Loading admin data...</p>}
        {errorMessage && <p className="text-sm font-bold text-red-600 mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-sm font-bold text-green-700 mb-4">{successMessage}</p>}

        {activeTab === 'overview' && overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase text-gray-500">Total Revenue</p>
              <p className="text-2xl font-black mt-2">{formatUGX(overview.totalRevenueMinor)}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase text-gray-500">Total Orders</p>
              <p className="text-2xl font-black mt-2">{overview.totalOrders}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase text-gray-500">Pending Orders</p>
              <p className="text-2xl font-black mt-2">{overview.pendingOrders}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase text-gray-500">Total Products</p>
              <p className="text-2xl font-black mt-2">{overview.totalProducts}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase text-gray-500">Low Stock Variants</p>
              <p className="text-2xl font-black mt-2">{overview.lowStockProducts}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-xs font-bold uppercase text-gray-500">Registered Users</p>
              <p className="text-2xl font-black mt-2">{overview.totalUsers}</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <section className="relative overflow-hidden border border-gray-200 bg-gradient-to-r from-black via-gray-900 to-black text-white p-6 md:p-8">
              <div className="absolute -right-24 -top-20 w-72 h-72 rounded-full bg-cocos-orange/25 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 mb-2">Performance Intelligence</p>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Executive Analytics</h2>
                  <p className="text-sm text-white/75 mt-2">Revenue, demand, customer, and inventory signals in one operational view.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                  <div className="bg-white/10 border border-white/20 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/60">Last 30d Revenue</p>
                    <p className="text-lg font-black mt-1">{formatUGX(analytics.revenueLast30)}</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/60">Vs Prior 30d</p>
                    <p className={`text-lg font-black mt-1 ${analytics.revenueGrowthPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {formatSignedPercent(analytics.revenueGrowthPercent)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Net Revenue</p>
                <p className="text-2xl font-black mt-2">{formatUGX(analytics.totalRevenueMinor)}</p>
                <p className="text-xs text-gray-500 mt-1">Non-cancelled orders</p>
              </div>
              <div className="bg-white border border-gray-200 p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-black mt-2">{formatUGX(Math.round(analytics.averageOrderValueMinor))}</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.totalOrders} total orders</p>
              </div>
              <div className="bg-white border border-gray-200 p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Fulfillment Rate</p>
                <p className="text-2xl font-black mt-2">{formatPercent(analytics.fulfillmentRate)}</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.deliveredCount} delivered orders</p>
              </div>
              <div className="bg-white border border-gray-200 p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Cancellation Risk</p>
                <p className="text-2xl font-black mt-2">{formatPercent(analytics.cancellationRate)}</p>
                <p className="text-xs text-gray-500 mt-1">Monitor payment and SLA quality</p>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">14-Day Revenue Trend</h3>
                    <p className="text-xs text-gray-500">Daily recognized revenue from non-cancelled orders</p>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Rolling Window</p>
                </div>
                <div className="h-56 flex items-end gap-2">
                  {analytics.dailySeries.map((day) => {
                    const heightPct = Math.max((day.revenueMinor / analytics.maxDailyRevenueMinor) * 100, day.revenueMinor > 0 ? 8 : 2);
                    return (
                      <div key={day.key} className="flex-1 flex flex-col items-center justify-end gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-cocos-orange to-orange-300 rounded-t-sm"
                          style={{ height: `${heightPct}%` }}
                          title={`${day.label}: ${formatUGX(day.revenueMinor)}`}
                        />
                        <span className="text-[10px] font-bold text-gray-400">{day.label.split(' ')[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5">
                <h3 className="text-base font-black uppercase tracking-tight">Order Pulse</h3>
                <p className="text-xs text-gray-500 mb-4">Daily order volume pattern (14 days)</p>
                <div className="bg-gray-50 border border-gray-200 p-4">
                  <svg viewBox="0 0 100 100" className="w-full h-36">
                    <polyline
                      points={analytics.orderSparklinePoints}
                      fill="none"
                      stroke="#FF7D00"
                      strokeWidth="2.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                <div className="mt-4 space-y-2">
                  {ORDER_STATUSES.map((status) => {
                    const count = analytics.statusCounts[status];
                    const width = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-[11px] font-bold uppercase">
                          <span>{status}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 mt-1">
                          <div className="h-2 bg-black" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white border border-gray-200 p-5 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black uppercase tracking-tight">Top Brand Performance</h3>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400">Revenue Ranked</p>
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="p-2">Brand</th>
                      <th className="p-2">Revenue</th>
                      <th className="p-2">Units</th>
                      <th className="p-2">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topBrands.map((item) => (
                      <tr key={item.brand} className="border-b border-gray-100">
                        <td className="p-2 font-bold">{item.brand}</td>
                        <td className="p-2">{formatUGX(item.revenueMinor)}</td>
                        <td className="p-2">{item.units}</td>
                        <td className="p-2">{item.orders}</td>
                      </tr>
                    ))}
                    {!analytics.topBrands.length && (
                      <tr>
                        <td className="p-3 text-gray-500" colSpan={4}>No order item data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 p-5">
                  <h3 className="text-base font-black uppercase tracking-tight mb-3">Payment Mix</h3>
                  <div className="space-y-3">
                    {analytics.paymentMix.map((item) => (
                      <div key={item.method}>
                        <div className="flex justify-between text-[11px] font-bold uppercase">
                          <span>{item.method.replaceAll('_', ' ')}</span>
                          <span>{formatPercent(item.percentage)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 mt-1">
                          <div className="h-2 bg-cocos-orange" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                    {!analytics.paymentMix.length && <p className="text-xs text-gray-500">No payment data available.</p>}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-5">
                  <h3 className="text-base font-black uppercase tracking-tight mb-3">Top Cities</h3>
                  <div className="space-y-2">
                    {analytics.topCities.map((item) => (
                      <div key={item.city} className="flex items-center justify-between text-sm">
                        <span className="font-bold">{item.city}</span>
                        <span>{item.count} orders</span>
                      </div>
                    ))}
                    {!analytics.topCities.length && <p className="text-xs text-gray-500">Shipping city data not available yet.</p>}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 p-5">
                <h3 className="text-base font-black uppercase tracking-tight mb-4">Customer Intelligence</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Active Customers</p>
                    <p className="text-xl font-black mt-1">{analytics.activeCustomers}</p>
                  </div>
                  <div className="border border-gray-200 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Active in 30d</p>
                    <p className="text-xl font-black mt-1">{analytics.activeCustomers30}</p>
                  </div>
                  <div className="border border-gray-200 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">New Users 30d</p>
                    <p className="text-xl font-black mt-1">{analytics.newUsers30}</p>
                  </div>
                  <div className="border border-gray-200 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Returning Rate</p>
                    <p className="text-xl font-black mt-1">{formatPercent(analytics.returningRate)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-5">
                <h3 className="text-base font-black uppercase tracking-tight mb-4">Inventory Risk Radar</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="border border-red-200 bg-red-50 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-red-700">Out of Stock</p>
                    <p className="text-xl font-black mt-1">{analytics.outOfStockVariants}</p>
                  </div>
                  <div className="border border-orange-200 bg-orange-50 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-orange-700">Low Stock</p>
                    <p className="text-xl font-black mt-1">{analytics.lowStockVariants}</p>
                  </div>
                  <div className="border border-green-200 bg-green-50 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-green-700">Healthy</p>
                    <p className="text-xl font-black mt-1">{analytics.healthyVariants}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500">Top catalog categories</p>
                  {analytics.topCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm">
                      <span className="font-bold">{category.name}</span>
                      <span>{category.productsCount} products</span>
                    </div>
                  ))}
                  {!analytics.topCategories.length && <p className="text-xs text-gray-500">No category analytics yet.</p>}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-5">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search products by name, brand, or slug..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-grow border border-gray-300 px-3 py-2.5 text-sm"
                />
                <button
                  onClick={clearProductForm}
                  className="px-4 py-2.5 border border-gray-300 text-xs font-bold uppercase tracking-widest"
                >
                  New Product
                </button>
              </div>
            </div>

            <form onSubmit={submitProductForm} className="bg-white border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <input placeholder="Slug (optional)" value={productForm.slug} onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <input type="number" placeholder="Price Minor (UGX)" value={productForm.priceMinor} onChange={(e) => setProductForm((prev) => ({ ...prev, priceMinor: Number(e.target.value) }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <input type="number" placeholder="Original Price Minor" value={productForm.originalPriceMinor} onChange={(e) => setProductForm((prev) => ({ ...prev, originalPriceMinor: Number(e.target.value) }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <input type="number" placeholder="Stock Qty" value={productForm.stockQty} onChange={(e) => setProductForm((prev) => ({ ...prev, stockQty: Number(e.target.value) }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <input placeholder="Image URL" value={productForm.imageUrl} onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))} className="border border-gray-300 px-3 py-2.5 text-sm md:col-span-2" />
              <input placeholder="SKU (optional)" value={productForm.sku} onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))} className="border border-gray-300 px-3 py-2.5 text-sm" />
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} className="border border-gray-300 px-3 py-2.5 text-sm md:col-span-3 min-h-[80px]" />

              <div className="md:col-span-3">
                <p className="text-xs font-bold uppercase mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const checked = productForm.categoryIds.includes(category.id);
                    return (
                      <label key={category.id} className="text-xs font-bold border border-gray-300 px-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              categoryIds: e.target.checked
                                ? [...prev.categoryIds, category.id]
                                : prev.categoryIds.filter((item) => item !== category.id),
                            }))
                          }
                          className="mr-2"
                        />
                        {category.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-3 flex items-center gap-3">
                <button type="submit" className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest">
                  {editingProductId ? 'Update Product' : 'Create Product'}
                </button>
                {editingProductId && (
                  <button type="button" onClick={clearProductForm} className="px-5 py-2.5 border border-gray-300 text-xs font-bold uppercase tracking-widest">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white border border-gray-200 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Categories</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100">
                      <td className="p-3">
                        <p className="font-bold">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand} - {product.slug}</p>
                      </td>
                      <td className="p-3">{formatUGX(product.priceMinor)}</td>
                      <td className="p-3">{product.variants?.[0]?.stockQty ?? 0}</td>
                      <td className="p-3">{product.categories?.map((cat) => cat.name).join(', ') || '-'}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEditProduct(product)} className="px-3 py-1.5 border border-gray-300 text-xs font-bold uppercase">Edit</button>
                          <button onClick={() => void handleDeleteProduct(product.id)} className="px-3 py-1.5 border border-red-300 text-red-700 text-xs font-bold uppercase">Deactivate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={submitCategoryForm} className="bg-white border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                className="border border-gray-300 px-3 py-2.5 text-sm"
              />
              <input
                placeholder="Category Slug (optional)"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="border border-gray-300 px-3 py-2.5 text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest">
                  {categoryForm.id ? 'Update' : 'Create'}
                </button>
                {categoryForm.id && (
                  <button type="button" onClick={() => setCategoryForm({ id: '', name: '', slug: '' })} className="px-5 py-2.5 border border-gray-300 text-xs font-bold uppercase tracking-widest">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white border border-gray-200 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Products</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100">
                      <td className="p-3 font-bold">{category.name}</td>
                      <td className="p-3">{category.slug}</td>
                      <td className="p-3">{category.productsCount}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => setCategoryForm({ id: category.id, name: category.name, slug: category.slug })} className="px-3 py-1.5 border border-gray-300 text-xs font-bold uppercase">Edit</button>
                          <button onClick={() => void handleDeleteCategory(category.id)} className="px-3 py-1.5 border border-red-300 text-red-700 text-xs font-bold uppercase">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="p-3">
                      <p className="font-bold">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="p-3">{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}</td>
                    <td className="p-3 font-bold">{formatUGX(order.totalMinor)}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => void handleOrderStatusChange(order.id, e.target.value as AdminOrder['status'])}
                        className="border border-gray-300 px-3 py-2 text-xs font-bold"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">{new Date(order.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Rewards</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((adminUser) => (
                  <tr key={adminUser.id} className="border-b border-gray-100">
                    <td className="p-3">
                      <p className="font-bold">{adminUser.firstName} {adminUser.lastName}</p>
                      <p className="text-xs text-gray-500">{adminUser.email}</p>
                    </td>
                    <td className="p-3">
                      <select
                        value={adminUser.role}
                        onChange={(e) => void handleUserRoleChange(adminUser.id, e.target.value as AdminUser['role'])}
                        className="border border-gray-300 px-3 py-2 text-xs font-bold"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                        <select
                          value={rewardDrafts[adminUser.id]?.rewardTier ?? adminUser.rewardTier}
                          onChange={(e) =>
                            setRewardDrafts((prev) => ({
                              ...prev,
                              [adminUser.id]: {
                                rewardPoints: prev[adminUser.id]?.rewardPoints ?? adminUser.rewardPoints,
                                nextTierPoints: prev[adminUser.id]?.nextTierPoints ?? adminUser.nextTierPoints,
                                rewardTier: e.target.value as AdminUser['rewardTier'],
                              },
                            }))
                          }
                          className="border border-gray-300 px-2 py-1 text-[11px] font-bold"
                        >
                          <option value="BRONZE">BRONZE</option>
                          <option value="SILVER">SILVER</option>
                          <option value="GOLD">GOLD</option>
                          <option value="PLATINUM">PLATINUM</option>
                        </select>
                        <input
                          type="number"
                          value={rewardDrafts[adminUser.id]?.rewardPoints ?? adminUser.rewardPoints}
                          onChange={(e) =>
                            setRewardDrafts((prev) => ({
                              ...prev,
                              [adminUser.id]: {
                                rewardPoints: Number(e.target.value),
                                nextTierPoints: prev[adminUser.id]?.nextTierPoints ?? adminUser.nextTierPoints,
                                rewardTier: prev[adminUser.id]?.rewardTier ?? adminUser.rewardTier,
                              },
                            }))
                          }
                          className="border border-gray-300 px-2 py-1 text-[11px]"
                          placeholder="Points"
                        />
                        <input
                          type="number"
                          value={rewardDrafts[adminUser.id]?.nextTierPoints ?? adminUser.nextTierPoints}
                          onChange={(e) =>
                            setRewardDrafts((prev) => ({
                              ...prev,
                              [adminUser.id]: {
                                rewardPoints: prev[adminUser.id]?.rewardPoints ?? adminUser.rewardPoints,
                                nextTierPoints: Number(e.target.value),
                                rewardTier: prev[adminUser.id]?.rewardTier ?? adminUser.rewardTier,
                              },
                            }))
                          }
                          className="border border-gray-300 px-2 py-1 text-[11px]"
                          placeholder="Next tier points"
                        />
                        <button
                          onClick={() => void handleUserRewardsSave(adminUser.id)}
                          className="px-2 py-1 border border-gray-300 text-[10px] font-bold uppercase"
                        >
                          Save Rewards
                        </button>
                      </div>
                    </td>
                    <td className="p-3">{adminUser.ordersCount}</td>
                    <td className="p-3">{new Date(adminUser.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
