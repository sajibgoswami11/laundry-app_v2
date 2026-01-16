"use client";

import { useEffect, useState } from "react";

function formatDateForInput(dateString: string) {
  return new Date(dateString).toISOString().slice(0, 16);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Order {
  id: string;
  shop: { name: string };
  total: number;
  status: string;
  pickupTime: string;
  deliveryTime: string;
  updatedAt: string;
  items: {
    service: { name: string };
    quantity: number;
    price: number;
  }[];
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateTime = async (id: string, updates: Partial<Order>) => {
    try {
      // Optimistic update
      setOrders((prevOrders: Order[]) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, ...updates } : order
        )
      );

      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      const updatedOrder = await response.json();

      // Confirm update with server data
      setOrders((prevOrders: Order[]) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, ...updatedOrder } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl relative">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
            <p className="text-gray-500 font-medium mt-1">Manage and track your laundry orders</p>
          </div>
          <div className="bg-white text-indigo-700 px-6 py-2 rounded-2xl text-sm font-bold border border-indigo-100 shadow-sm">
            {orders.length} Active Orders
          </div>
        </div>

        <div className="p-8">
          {orders.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto">Visit shops to place your first order and start your journey with us.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table Layout */}
              <div className="hidden xl:block overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Shop</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pickup Time</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Delivery Time</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{order.shop.name}</div>
                          <div className="text-[10px] font-black text-gray-400 mt-1">ID: {order.id.slice(0, 8).toUpperCase()}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${order.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            order.status === 'PROCESSING' || order.status === 'IN_PROGRESS' || order.status === 'ACCEPTED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'READY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-gray-50 text-gray-700 border-gray-100'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-2.5 ${order.status === 'PENDING' ? 'bg-blue-500' :
                              order.status === 'PROCESSING' || order.status === 'IN_PROGRESS' || order.status === 'ACCEPTED' ? 'bg-amber-500' :
                                order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'READY' ? 'bg-emerald-500' :
                                  'bg-gray-500 shadow-inner'
                              }`}></span>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <input
                            type="datetime-local"
                            defaultValue={formatDateForInput(order.pickupTime)}
                            onBlur={(e) => handleUpdateTime(order.id, { pickupTime: new Date(e.target.value).toISOString() })}
                            className="text-xs bg-gray-50 border-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full"
                          />
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <input
                            type="datetime-local"
                            defaultValue={formatDateForInput(order.deliveryTime)}
                            onBlur={(e) => handleUpdateTime(order.id, { deliveryTime: new Date(e.target.value).toISOString() })}
                            className="text-xs bg-gray-50 border-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full"
                          />
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-base font-black text-gray-900">${order.total.toFixed(2)}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-500">
                          {formatDate(order.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card Layout */}
              <div className="xl:hidden space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[10px] font-black text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border ${order.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            order.status === 'PROCESSING' || order.status === 'IN_PROGRESS' || order.status === 'ACCEPTED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              order.status === 'COMPLETED' || order.status === 'DELIVERED' || order.status === 'READY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-gray-50 text-gray-700 border-gray-100'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900">{order.shop.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600">${order.total.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Total</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Pickup Schedule</label>
                        <input
                          type="datetime-local"
                          defaultValue={formatDateForInput(order.pickupTime)}
                          onBlur={(e) => handleUpdateTime(order.id, { pickupTime: new Date(e.target.value).toISOString() })}
                          className="block w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Delivery Schedule</label>
                        <input
                          type="datetime-local"
                          defaultValue={formatDateForInput(order.deliveryTime)}
                          onBlur={(e) => handleUpdateTime(order.id, { deliveryTime: new Date(e.target.value).toISOString() })}
                          className="block w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400">
                        <span>Updated: {formatDate(order.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
