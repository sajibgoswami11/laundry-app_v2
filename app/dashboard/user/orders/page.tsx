"use client";

import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";

interface Order {
  id: string;
  shop: { name: string };
  total: number;
  status: string;
  pickupTime: string;
  deliveryTime: string;
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
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupTime, deliveryTime }),
      });
      if (!response.ok) {
        throw new Error("Failed to update order times");
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, pickupTime, deliveryTime } : order
        )
      );
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
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300 rounded-lg shadow-lg">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Order ID</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Shop</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Status</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Pickup Time</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Delivery Time</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Total</th>
                <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="border border-gray-300 px-6 py-3">{order.id}</td>
                  <td className="border border-gray-300 px-6 py-3">{order.shop.name}</td>
                  <td className="border border-gray-300 px-6 py-3">{order.status}</td>
                  <td className="border border-gray-300 px-6 py-3">
                    <input
                      type="datetime-local"
                      value={new Date(order.pickupTime).toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setOrders((prevOrders) =>
                          prevOrders.map((o) =>
                            o.id === order.id
                              ? { ...o, pickupTime: e.target.value }
                              : o
                          )
                        )
                      }
                      className="border rounded px-3 py-2 w-full"
                    />
                  </td>
                  <td className="border border-gray-300 px-6 py-3">
                    <input
                      type="datetime-local"
                      value={new Date(order.deliveryTime).toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setOrders((prevOrders) =>
                          prevOrders.map((o) =>
                            o.id === order.id
                              ? { ...o, deliveryTime: e.target.value }
                              : o
                          )
                        )
                      }
                      className="border rounded px-3 py-2 w-full"
                    />
                  </td>
                  <td className="border border-gray-300 px-6 py-3">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-6 py-3">
                    <button
                      onClick={() =>
                        handleUpdateTime(order.id, order.pickupTime, order.deliveryTime)
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
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
  );
}
