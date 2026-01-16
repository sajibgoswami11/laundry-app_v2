"use client";

import { useEffect, useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string | null;
  isApproved: boolean;
  owner: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ShopsManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    ownerId: "",
  });

  useEffect(() => {
    fetchShops();
    fetchAvailableOwners();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch("/api/shops");
      if (!response.ok) {
        throw new Error("Failed to fetch shops");
      }
      const data = await response.json();
      setShops(data);
    } catch (error) {
      setError("Error loading shops. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableOwners = async () => {
    try {
      const response = await fetch("/api/admin/available-owners");
      if (response.ok) {
        const data = await response.json();
        setAvailableOwners(data);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const handleShopApproval = async (shopId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shop approval status");
      }

      const updatedShop = await response.json();
      setShops((prev) =>
        prev.map((shop) =>
          shop.id === shopId ? { ...shop, isApproved: updatedShop.isApproved } : shop
        )
      );
    } catch (error) {
      setError("Error updating shop approval status. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create shop");
      }

      const newShop = await response.json();
      setShops((prev) => [newShop, ...prev]);
      setShowAddModal(false);
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        description: "",
        ownerId: "",
      });
      fetchAvailableOwners(); // Refresh available owners list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating shop");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shops Overview</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage and approve laundry shops on the platform.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Shop
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl relative mb-8 shadow-sm">
          {error}
        </div>
      )}

      {/* Desktop Table Layout */}
      <div className="hidden xl:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Shop Name</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Owner</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Address</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{shop.name}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">{shop.owner.name}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                  <div className="text-gray-900">{shop.phone}</div>
                  <div className="text-gray-400 text-xs mt-1">{shop.email}</div>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-gray-500 max-w-xs truncate">
                  {shop.address}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-4 py-1 rounded-xl text-xs font-bold border shadow-sm ${shop.isApproved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                  >
                    {shop.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleShopApproval(shop.id, !shop.isApproved)}
                    className={`px-6 py-2 rounded-xl text-sm font-black transition-all transform active:scale-95 shadow-sm ${shop.isApproved
                      ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white"
                      : "bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700"
                      }`}
                  >
                    {shop.isApproved ? "Revoke" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card Layout */}
      <div className="xl:hidden space-y-6">
        {shops.map((shop) => (
          <div key={shop.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">{shop.name}</h3>
                <p className="text-sm font-medium text-gray-500">by {shop.owner.name}</p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-1 rounded-xl text-[10px] font-bold border shadow-sm ${shop.isApproved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
              >
                {shop.isApproved ? "Approved" : "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Contact</p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-50">
                  <p className="text-sm font-bold text-gray-700">{shop.phone}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{shop.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Address</p>
                <p className="text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-50 line-clamp-2 min-h-[3rem]">
                  {shop.address}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <button
                onClick={() => handleShopApproval(shop.id, !shop.isApproved)}
                className={`w-full py-4 rounded-2xl text-sm font-black transition-all transform active:scale-95 shadow-sm border ${shop.isApproved
                  ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                  : "bg-gray-900 text-white border-gray-800 hover:bg-black"
                  }`}
              >
                {shop.isApproved ? "Revoke Approval" : "Approve Shop"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Shop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Register New Shop</h3>
                <p className="text-gray-500 text-sm font-medium mt-1">Assign a shop owner and set up shop details.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assign Shop Owner</label>
                  <select
                    required
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="">Select an owner...</option>
                    {availableOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunny Day Laundry"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Email</label>
                  <input
                    type="email"
                    required
                    placeholder="shop@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Address</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main St, City"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tell customers about your shop..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-8 py-4 border border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Shop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
