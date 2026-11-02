
"use client";

import Sidebar from "./sidebar";
import Header from "./header";

import {
    LayoutDashboard,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Users,
    FileText,
    Truck,
    History,
} from "lucide-react";

const navigation = {
    admin: [
        { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { label: "Inventory", href: "/dashboard/admin/inventory", icon: Package },
        { label: "Stock In", href: "/dashboard/admin/stock-in", icon: ArrowDownToLine },
        { label: "Stock Out", href: "/dashboard/admin/stock-out", icon: ArrowUpFromLine },
        { label: "Categories", href: "/dashboard/admin/categories", icon: Package },
        { label: "Suppliers", href: "/dashboard/admin/suppliers", icon: Truck },
        { label: "Stock History", href: "/dashboard/admin/history", icon: History },
        { label: "Reports", href: "/dashboard/admin/reports", icon: FileText },
        { label: "Users", href: "/dashboard/admin/users", icon: Users },
    ],

    staff: [
        { label: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
        { label: "Inventory", href: "/dashboard/staff/inventory", icon: Package },
        { label: "Stock In", href: "/dashboard/staff/stock-in", icon: ArrowDownToLine },
        { label: "Stock Out", href: "/dashboard/staff/stock-out", icon: ArrowUpFromLine },
        { label: "Stock History", href: "/dashboard/staff/history", icon: History },
    ],

    manager: [
        { label: "Dashboard", href: "/dashboard/manager", icon: LayoutDashboard },
        { label: "Inventory", href: "/dashboard/manager/inventory", icon: Package },
        { label: "Reports", href: "/dashboard/manager/reports", icon: FileText },
        { label: "Stock History", href: "/dashboard/manager/history", icon: History },
    ],
};

export default function DashboardShell({ role, children }) {
    const links = navigation[role] || [];

    return (
        <main className="flex min-h-screen bg-slate-50">
            <Sidebar role={role} links={links} />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header title="Dashboard Overview" />

                <section className="flex-1 p-7">
                    {children}
                </section>
            </div>
        </main>
    );
}
