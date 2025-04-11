"use client";

import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";

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

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleUpdateTime = async (id: string, pickupTime: string, deliveryTime: string) => {
    try {
      const formattedPickupTime = new Date(pickupTime).toISOString();
      const formattedDeliveryTime = new Date(deliveryTime).toISOString();

      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupTime: formattedPickupTime,
          deliveryTime: formattedDeliveryTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order times');
      }

      const updatedOrder = await response.json();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, ...updatedOrder } : order
        )
      );
      
      alert('Times updated successfully!');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <DashboardNav />
      <div className="bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold p-4 border-b">Orders Management</h1>
        
        {orders.length === 0 ? (
          <p className="p-4">You have no orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">SHOP</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">STATUS</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">PICKUP TIME</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">DELIVERY TIME</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">TOTAL</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">UPDATED</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="text-sm">{order.shop.name}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="datetime-local"
                        value={formatDateForInput(order.pickupTime)}
                        onChange={(e) =>
                          setOrders((prevOrders) =>
                            prevOrders.map((o) =>
                              o.id === order.id
                                ? { ...o, pickupTime: e.target.value }
                                : o
                            )
                          )
                        }
                        className="border rounded px-2 py-1 text-sm w-40"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="datetime-local"
                        value={formatDateForInput(order.deliveryTime)}
                        onChange={(e) =>
                          setOrders((prevOrders) =>
                            prevOrders.map((o) =>
                              o.id === order.id
                                ? { ...o, deliveryTime: e.target.value }
                                : o
                            )
                          )
                        }
                        className="border rounded px-2 py-1 text-sm w-40"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-sm text-gray-600">
                        {formatDate(order.updatedAt)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() =>
                          handleUpdateTime(order.id, order.pickupTime, order.deliveryTime)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
