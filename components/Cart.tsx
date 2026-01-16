"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userAgent } from "next/server";

interface CartProps {
  shopId: string;
  onClose: () => void;
}

export default function Cart({ shopId, onClose }: CartProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const router = useRouter();

  const handleCheckout = async () => {
    if (!pickupTime || !deliveryTime) {
      alert("Please select pickup and delivery times");
      return;
    }

    try {
      const orderJson = {
        shopId,
        items: items.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price,
        })),
        pickupTime,
        deliveryTime,
      };
      console.log("Order to be sent:", shopId); // Debugging log


      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderJson),
      });

      if (!response.ok) {
        const errorBody = await response.text(); // Log the response body for debugging
        console.error("Server error response:", errorBody);
        throw new Error("Failed to create order");
      }

      clearCart();
      onClose();
      router.push("/dashboard/customer/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <p className="text-sm text-gray-500 mt-1">{items.length} items selected</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
              <p className="text-gray-500 mt-1">Add some services to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.serviceId}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.serviceName}</h3>
                      <p className="text-indigo-600 font-medium mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.serviceId, Math.max(0, item.quantity - 1))
                        }
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.serviceId, item.quantity + 1)
                        }
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Time
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Time
                    </label>
                    <input
                      type="datetime-local"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm py-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:transform active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/30"
            >
              Confirm Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}