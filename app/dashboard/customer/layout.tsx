"use client";

import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import CustomerSidebar from "@/components/CustomerSidebar";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            <DashboardNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex">
                <CustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
