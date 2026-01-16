"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BuildingStorefrontIcon, MapPinIcon, PhoneIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string | null;
  services: Service[];
  owner: {
    name: string;
    phone: string;
  };
}

export default function ShopsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
      return;
    }

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

    fetchShops();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Find a Laundry Shop</h1>
        <p className="text-gray-500 font-medium mt-2">Discover the best laundry services in your neighborhood.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[2rem] relative mb-10 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BuildingStorefrontIcon className="h-7 w-7 text-indigo-600" />
                </div>
                {shop.services.length > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">
                    {shop.services.length} Services
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{shop.name}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPinIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span className="text-sm font-medium leading-relaxed">{shop.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <PhoneIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <span className="text-sm font-bold">{shop.phone}</span>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-6 mt-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Top Services</h3>
                <div className="space-y-3">
                  {shop.services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="text-sm text-gray-600 flex justify-between items-center bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-100/50"
                    >
                      <span className="font-bold">{service.name}</span>
                      <span className="text-indigo-600 font-black">${service.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {shop.services.length > 3 && (
                    <p className="text-[10px] text-center text-gray-400 font-black uppercase tracking-widest mt-2">
                      + {shop.services.length - 3} more services
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(`/dashboard/customer/shops/${shop.id}`)}
              className="w-full bg-gray-50 hover:bg-indigo-600 hover:text-white py-5 px-8 flex items-center justify-center gap-2 font-black text-sm transition-all duration-300 border-t border-gray-100 rounded-b-[2.5rem]"
            >
              Order Services <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}