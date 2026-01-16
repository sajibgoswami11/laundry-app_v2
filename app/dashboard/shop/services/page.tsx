"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
}

interface NewService {
    name: string;
    description: string;
    price: number;
}

export default function ShopServicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddService, setShowAddService] = useState(false);
    const [newService, setNewService] = useState<NewService>({
        name: "",
        description: "",
        price: 0,
    });

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

        const fetchServices = async () => {
            try {
                const response = await fetch("/api/shops/services");
                if (!response.ok) {
                    throw new Error("Failed to fetch services");
                }
                const data = await response.json();
                setServices(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading services");
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, [session, status, router]);

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/shops/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newService),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add service");
            }

            const service = await response.json();
            setServices((prev) => [...prev, service]);
            setShowAddService(false);
            setNewService({ name: "", description: "", price: 0 });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error adding service");
        }
    };

    if (!mounted || status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Services Management</h1>
                        <p className="text-gray-500 mt-1">Add, edit or remove laundry services offered by your shop</p>
                    </div>
                    <button
                        onClick={() => setShowAddService(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add New Service
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {showAddService && (
                        <form onSubmit={handleAddService} className="mb-10 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Premium Dry Clean"
                                        className="block w-full rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="What's included?"
                                        className="block w-full rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="block w-full rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddService(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all border border-indigo-500"
                                >
                                    Create Service
                                </button>
                            </div>
                        </form>
                    )}

                    {services.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="p-4 bg-white rounded-full inline-block mb-4 shadow-sm">
                                <ClipboardListIcon className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No services yet</h3>
                            <p className="text-gray-500 mt-1">Start by adding your first laundry service above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all hover:border-indigo-200 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-lg tracking-tight">{service.name}</h3>
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-black font-mono shadow-sm border border-indigo-100">
                                                ${service.price.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                                            {service.description}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Placeholder for Edit/Delete buttons if needed later */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ClipboardListIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    );
}
