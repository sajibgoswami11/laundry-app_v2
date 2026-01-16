"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError("Error loading users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user
        )
      );
    } catch (error) {
      setError("Error updating user role. Please try again.");
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
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Joined</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{user.name}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{user.email}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">{user.phone || "—"}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-4 py-1 rounded-xl text-xs font-bold border shadow-sm ${user.role === "ADMIN"
                      ? "bg-purple-50 text-purple-700 border-purple-100"
                      : user.role === "SHOP_OWNER"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="block w-full pl-4 pr-10 py-2 text-sm font-bold border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SHOP_OWNER">Shop Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card Layout */}
      <div className="xl:hidden space-y-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">{user.name}</h3>
                <p className="text-sm font-medium text-gray-500">{user.email}</p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-1 rounded-xl text-[10px] font-bold border shadow-sm ${user.role === "ADMIN"
                  ? "bg-purple-50 text-purple-700 border-purple-100"
                  : user.role === "SHOP_OWNER"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}
              >
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone</p>
                <p className="text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-50">{user.phone || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Joined</p>
                <p className="text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-50">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Change Role</p>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="block w-full p-4 bg-gray-900 text-white border-0 rounded-2xl text-sm font-bold focus:ring-offset-2 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SHOP_OWNER">Shop Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
