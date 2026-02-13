import React, { useState } from 'react';
import { User, Order } from '../types';
import { getImageByIndex } from '../imageStore';
import {
  Package,
  Settings,
  CreditCard,
  MapPin,
  LogOut,
  Star,
  ChevronRight,
  Clock,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Product } from '../types';

interface Props {
  user: User;
  onSignOut: () => void;
  onNavigate: (page: string) => void;
  onQuickView?: (product: Product) => void;
}

const DashboardPage: React.FC<Props> = ({ user, onSignOut, onNavigate, onQuickView }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'profile'>('overview');

  const mockOrders: Order[] = [
    {
      id: 'ORD-2025-001',
      date: 'Feb 12, 2025',
      total: 'UGX 445,000',
      status: 'Delivered',
      items: [
        { name: 'Wool Blend Coat', imageUrl: getImageByIndex(140) }
      ]
    },
    {
      id: 'ORD-2025-002',
      date: 'Feb 14, 2025',
      total: 'UGX 165,000',
      status: 'Shipped',
      items: [
        { name: 'Graphic Tee', imageUrl: getImageByIndex(141) }
      ]
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: Star },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'wallet', label: 'Wallet & Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Your Orders</h2>
            {mockOrders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-gray-400">Order ID: {order.id}</p>
                      <p className="text-xs font-bold text-gray-500">Placed on {order.date}</p>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group relative">
                        <div className="relative w-12 h-16 overflow-hidden">
                          <img src={item.imageUrl} className="w-full h-full object-cover border border-gray-100 group-hover:scale-105 transition-transform" alt={item.name} />
                          <button
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Convert order item to Product type for Quick View
                              onQuickView?.({
                                id: `order-${item.name}`,
                                name: item.name,
                                imageUrl: item.imageUrl,
                                price: order.total, // fallback
                                brand: 'Coco Fashion',
                                rating: 5,
                                reviews: 100
                              } as Product);
                            }}
                          >
                            <Eye size={14} className="text-white" />
                          </button>
                        </div>
                        <p className="text-sm font-bold">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 min-w-[150px]">
                  <p className="text-lg font-black">{order.total}</p>
                  <button className="text-[11px] font-black uppercase tracking-widest text-cocos-orange hover:underline">Track Order</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rewards Card */}
            <div className="bg-cocos-orange text-white p-8 col-span-1 lg:col-span-2 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">★ {user.starRewardsTier} Tier</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/80">Membership active since 2024</p>
                  </div>
                  <div className="bg-white text-black p-4 text-center min-w-[120px]">
                    <p className="text-[10px] font-black uppercase mb-1">Star Money</p>
                    <p className="text-2xl font-black">UGX 35,000</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-bold uppercase tracking-widest">{user.points} / {user.nextTierPoints} points</p>
                    <p className="text-[10px] font-bold uppercase text-white/60">Next Tier: Gold</p>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                      style={{ width: `${(user.points / user.nextTierPoints) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] mt-4 font-medium italic">You're only 250 points away from Gold status! Shop now to reach it faster.</p>
                </div>
              </div>
              <Star size={200} className="absolute -bottom-20 -right-20 text-white opacity-10 pointer-events-none" />
            </div>

            {/* Recent Order Summary */}
            <div className="bg-white border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-tighter">Recent Order</h3>
                <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-cocos-orange">View All</button>
              </div>
              <div className="flex items-center gap-6">
                <img src={mockOrders[0].items[0].imageUrl} className="w-20 h-28 object-cover border border-gray-100" alt="Order" />
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Status: {mockOrders[0].status}</p>
                  <p className="text-sm font-black mb-1">{mockOrders[0].items[0].name}</p>
                  <p className="text-xs text-gray-500 mb-4">Arrived on {mockOrders[0].date}</p>
                  <button className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">Buy Again</button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Saved Items', icon: Clock, count: '12' },
                { label: 'Store Credit', icon: CreditCard, count: 'UGX 0' },
                { label: 'Address Book', icon: MapPin, count: '2' },
                { label: 'Security', icon: ShieldCheck, count: 'Active' },
              ].map(link => (
                <div key={link.label} className="bg-white border border-gray-200 p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:border-black transition-colors group">
                  <link.icon size={24} className="text-gray-400 mb-2 group-hover:text-cocos-orange" />
                  <p className="text-[10px] font-black uppercase tracking-tighter mb-1">{link.label}</p>
                  <p className="text-sm font-bold">{link.count}</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <p className="text-[11px] font-bold uppercase text-gray-400 mb-1">Welcome back,</p>
              <h2 className="text-2xl font-black uppercase tracking-tighter truncate">{user.firstName}</h2>
            </div>
            <nav className="flex flex-col">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-4 px-8 py-4 text-xs font-bold uppercase tracking-widest border-l-4 transition-all ${activeTab === item.id
                    ? 'bg-gray-50 border-cocos-orange text-black'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={onSignOut}
                className="flex items-center gap-4 px-8 py-8 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-cocos-orange transition-all mt-4 border-t border-gray-50"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
