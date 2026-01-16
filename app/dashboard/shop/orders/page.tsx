"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
    id: string;
    total: number;
    status: string;
    pickupTime: string;
    deliveryTime: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    items: {
        quantity: number;
        price: number;
        service: {
            name: string;
        };
    }[];
}

export default function ShopOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user.role !== "SHOP_OWNER") {
            router.push("/login");
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders");
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading orders");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [session, status, router]);

    const handleStatusUpdate = async (orderId: string, updates: Partial<Order>) => {
        setUpdatingOrderId(orderId);
        setSaveSuccessId(null);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error("Failed to update order");
            }

            const updatedOrder = await response.json();
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, ...updatedOrder } : order
                )
            );
            setSaveSuccessId(orderId);
            setTimeout(() => setSaveSuccessId(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating order");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    if (!mounted || status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Orders Management</h1>
                        <p className="text-gray-500 mt-1">Track status and schedule of incoming laundry orders</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {updatingOrderId && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 animate-pulse bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                <div className="w-2 h-2 bg-amber-600 rounded-full animate-ping"></div>
                                Saving...
                            </span>
                        )}
                        {saveSuccessId && !updatingOrderId && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 animate-in fade-in duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Saved
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium text-lg">No incoming orders yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table Layout */}
                            <div className="hidden xl:block overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.id} className={`hover:bg-gray-50 transition-colors group ${saveSuccessId === order.id ? 'bg-green-50/30' : ''}`}>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className="font-mono text-sm font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{order.user?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-400">{order.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-indigo-600">
                                                    ${order.total.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <input
                                                        type="datetime-local"
                                                        defaultValue={new Date(order.pickupTime).toISOString().slice(0, 16)}
                                                        onBlur={(e) => handleStatusUpdate(order.id, { pickupTime: e.target.value })}
                                                        disabled={updatingOrderId === order.id}
                                                        className="text-xs bg-gray-50 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full disabled:opacity-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <input
                                                        type="datetime-local"
                                                        defaultValue={new Date(order.deliveryTime).toISOString().slice(0, 16)}
                                                        onBlur={(e) => handleStatusUpdate(order.id, { deliveryTime: e.target.value })}
                                                        disabled={updatingOrderId === order.id}
                                                        className="text-xs bg-gray-50 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full disabled:opacity-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <select
                                                        value={order.status}
                                                        disabled={updatingOrderId === order.id}
                                                        onChange={(e) => handleStatusUpdate(order.id, { status: e.target.value })}
                                                        className={`text-xs font-bold rounded-lg border-0 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-indigo-600 w-full disabled:opacity-50 ${order.status === "DELIVERED" ? "text-green-700 bg-green-50" :
                                                            order.status === "CANCELLED" ? "text-red-700 bg-red-50" :
                                                                "text-gray-900 bg-gray-100"
                                                            }`}
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="ACCEPTED">Accepted</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="READY">Ready</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet Card Layout */}
                            <div className="xl:hidden space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${saveSuccessId === order.id ? 'border-green-500 ring-1 ring-green-100 bg-green-50/10' : 'border-gray-100'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-gray-400">#{order.id.slice(0, 8)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                                                        order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                                                            "bg-indigo-100 text-indigo-700"
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-gray-900 mt-1">{order.user?.name || 'Unknown'}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-indigo-600">${order.total.toFixed(2)}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase">Total</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pickup Schedule</label>
                                                <input
                                                    type="datetime-local"
                                                    defaultValue={new Date(order.pickupTime).toISOString().slice(0, 16)}
                                                    onBlur={(e) => handleStatusUpdate(order.id, { pickupTime: e.target.value })}
                                                    disabled={updatingOrderId === order.id}
                                                    className="block w-full p-3 bg-gray-50 border-gray-100 rounded-xl text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Delivery Schedule</label>
                                                <input
                                                    type="datetime-local"
                                                    defaultValue={new Date(order.deliveryTime).toISOString().slice(0, 16)}
                                                    onBlur={(e) => handleStatusUpdate(order.id, { deliveryTime: e.target.value })}
                                                    disabled={updatingOrderId === order.id}
                                                    className="block w-full p-3 bg-gray-50 border-gray-100 rounded-xl text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-1 pt-2 md:col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Update Status</label>
                                                <select
                                                    value={order.status}
                                                    disabled={updatingOrderId === order.id}
                                                    onChange={(e) => handleStatusUpdate(order.id, { status: e.target.value })}
                                                    className="block w-full p-3 bg-gray-900 text-white border-0 rounded-xl text-sm font-bold focus:ring-offset-2 focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="ACCEPTED">Accepted</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="READY">Ready</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
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
