"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  ChevronRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
      return;
    }

    const fetchUserStats = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const orders = await response.json();
          setStats({
            activeOrders: orders.filter((o: any) => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
            completedOrders: orders.filter((o: any) => o.status === "DELIVERED").length,
            totalSpent: orders.reduce((acc: number, o: any) => acc + o.total, 0)
          });
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchUserStats();
  }, [session, status, router]);

  if (status === "loading" || !session) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Welcome back, <span className="text-indigo-600">{session.user.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg">What can we clean for you today?</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
          <SparklesIcon className="h-6 w-6 text-indigo-600" />
          <span className="text-indigo-700 font-bold">Premium Gold Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShoppingBagIcon className="h-7 w-7 text-indigo-600" />
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Active Orders</p>
          <h3 className="text-4xl font-black text-gray-900 mb-4">{stats.activeOrders}</h3>
          <button
            onClick={() => router.push("/dashboard/customer/orders")}
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all"
          >
            Track status <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BuildingStorefrontIcon className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Spent</p>
          <h3 className="text-4xl font-black text-gray-900 mb-4">${stats.totalSpent.toFixed(2)}</h3>
          <button
            onClick={() => router.push("/dashboard/user/shops")}
            className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all"
          >
            Find new shops <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ClockIcon className="h-7 w-7 text-amber-600" />
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Orders</p>
          <h3 className="text-4xl font-black text-gray-900 mb-4">{stats.activeOrders + stats.completedOrders}</h3>
          <button
            onClick={() => router.push("/dashboard/user/orders?tab=history")}
            className="flex items-center gap-2 text-amber-600 font-bold text-sm hover:gap-3 transition-all"
          >
            View history <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl font-black mb-6 tracking-tight">Need a fresh start?</h2>
          <p className="text-indigo-100/80 text-xl mb-10 font-medium leading-relaxed">Book a session with one of our top-rated shops and experience high-quality laundry care.</p>
          <button
            onClick={() => router.push("/dashboard/user/shops")}
            className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl shadow-black/20"
          >
            Browse Shops
          </button>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <SparklesIcon className="absolute -right-20 -top-20 h-96 w-96 text-white opacity-5" />
          <ShoppingBagIcon className="absolute right-20 bottom-10 h-64 w-64 text-white opacity-[0.03]" />
        </div>
      </div>
    </div>
  );
}