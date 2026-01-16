"use client";

import ShopsManagement from "@/components/admin/ShopsManagement";

export default function AdminShopsPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shops Management</h1>
                        <p className="text-gray-500 font-medium mt-1">Review, approve, and manage laundry service providers on the platform.</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-2xl text-sm font-bold border border-emerald-100">
                        Partner Network
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <ShopsManagement />
                </div>
            </div>
        </div>
    );
}
