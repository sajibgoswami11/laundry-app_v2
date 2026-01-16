"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    UsersIcon,
    BuildingStorefrontIcon,
    Squares2X2Icon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const menuItems = [
    { icon: Squares2X2Icon, label: "Overview", href: "/dashboard/admin" },
    { icon: UsersIcon, label: "Users Management", href: "/dashboard/admin/users" },
    { icon: BuildingStorefrontIcon, label: "Shops Management", href: "/dashboard/admin/shops" },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out transform
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:relative md:translate-x-0 md:z-auto md:shadow-none md:min-h-[calc(100vh-4rem)] md:block
            `}>
                <div className="flex items-center justify-between p-6 border-b border-slate-200 md:hidden">
                    <span className="text-lg font-black text-indigo-600">Admin Menu</span>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-indigo-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${isActive
                                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100 transform scale-[1.02]"
                                        : "text-slate-500 hover:bg-white/50 hover:text-indigo-600 hover:translate-x-1"
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-indigo-50" : "bg-transparent group-hover:bg-indigo-50"}`}>
                                        <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                                    </div>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
