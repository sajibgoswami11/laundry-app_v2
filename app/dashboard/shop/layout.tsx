"use client";

import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import ShopSidebar from "@/components/ShopSidebar";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="z-20 shadow-md ring-1 ring-black/5">
                <DashboardNav onMenuClick={() => setIsSidebarOpen(true)} />
            </div>
            <div className="flex-1 flex overflow-hidden">
                <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 overflow-y-auto bg-white/50 relative">
                    {/* Subtle gradient overlay for the content area to separate it further from sidebar */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-gray-50/50 to-white/30" />
                    <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
