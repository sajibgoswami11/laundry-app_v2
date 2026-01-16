"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UsersIcon, BuildingStorefrontIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    pendingShops: 0
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    // Simulating stat fetching - in a real app these would be API calls
    const fetchStats = async () => {
      try {
        const [usersRes, shopsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/shops")
        ]);

        if (usersRes.ok && shopsRes.ok) {
          const users = await usersRes.json();
          const shops = await shopsRes.json();

          setStats({
            totalUsers: users.length,
            totalShops: shops.length,
            pendingShops: shops.filter((s: any) => !s.isApproved).length
          });
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    };

    fetchStats();
  }, [session, status, router]);

  if (status === "loading") return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Overview</h1>
        <p className="text-gray-500 font-medium text-lg mt-2">Monitor platform growth and manage system-wide activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <UsersIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
          <h3 className="text-4xl font-black text-gray-900">{stats.totalUsers}</h3>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <BuildingStorefrontIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Shops</p>
          <h3 className="text-4xl font-black text-gray-900">{stats.totalShops}</h3>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            <ChartBarIcon className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Approval</p>
          <h3 className="text-4xl font-black text-gray-900">{stats.pendingShops}</h3>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-4 tracking-tight">System Controls</h2>
          <p className="text-indigo-100 text-lg mb-8 font-medium">Quickly jump to platform management sections to review users or approve new shop applications.</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/dashboard/admin/users")}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all transform hover:scale-105"
            >
              Manage Users
            </button>
            <button
              onClick={() => router.push("/dashboard/admin/shops")}
              className="bg-indigo-500 text-white border border-indigo-400/30 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-400 transition-all transform hover:scale-105"
            >
              Review Shops
            </button>
          </div>
        </div>
        <UsersIcon className="absolute -right-10 -bottom-10 h-64 w-64 text-white opacity-5" />
      </div>
    </div>
  );
}