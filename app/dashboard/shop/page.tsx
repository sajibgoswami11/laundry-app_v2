"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import ShopSidebar from "@/components/ShopSidebar";
import {
  InboxIcon as PackageIcon,
  ClipboardDocumentListIcon as ClipboardListIcon,
  CurrencyDollarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalServices: number;
  estimatedRevenue: number;
}

export default function ShopDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalServices: 0,
    estimatedRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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

    const fetchStats = async () => {
      try {
        const [ordersRes, servicesRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/shops/services")
        ]);

        const orders = await ordersRes.json();
        const services = await servicesRes.json();

        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === "PENDING").length,
          totalServices: services.length,
          estimatedRevenue: orders.reduce((acc: number, o: any) => acc + o.total, 0)
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [session, status, router]);

  if (!mounted || status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shop Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={PackageIcon}
          color="indigo"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={ClockIcon}
          color="amber"
        />
        <StatCard
          title="Active Services"
          value={stats.totalServices}
          icon={ClipboardListIcon}
          color="emerald"
        />
        <StatCard
          title="Est. Revenue"
          value={`$${stats.estimatedRevenue.toFixed(2)}`}
          icon={CurrencyDollarIcon}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Welcome back, {session?.user.name}!</h2>
          <p className="text-gray-600 leading-relaxed">
            Use the sidebar to manage your laundry services and track incoming orders.
            You can update order statuses, adjust pickup/delivery times, and expand your service list.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push("/dashboard/shop/orders")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push("/dashboard/shop/services")}
              className="bg-white text-indigo-600 border border-indigo-100 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all"
            >
              Manage Services
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
          <div className="flex items-center gap-4 text-emerald-600 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">Performance Insight</span>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">${stats.estimatedRevenue.toFixed(2)} in pipeline</h3>
          <p className="text-gray-500 text-sm">Total value of all orders processed so far. Great job!</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md hover:scale-[1.02]">
      <div className={`p-3.5 rounded-2xl ${colorMap[color] || colorMap.indigo}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}