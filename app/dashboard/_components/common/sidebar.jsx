
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Warehouse } from "lucide-react";

export default function Sidebar({ role, links = [] }) {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white">

            {/* Brand */}
            <div className="flex h-[65px] items-center gap-3 border-b border-slate-200 px-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
                    <Warehouse size={19} />
                </div>

                <div>
                    <h1 className="text-sm font-semibold text-slate-900">
                        Warehouse
                    </h1>
                    <p className="text-xs text-slate-500">
                        Management System
                    </p>
                </div>
            </div>

            {/* Role Title */}
            <div className="px-5 pb-3 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {role} Workspace
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                                isActive
                                    ? "bg-blue-50 font-medium text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            {Icon && (
                                <Icon size={18} strokeWidth={1.8} />
                            )}

                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-400">
                    © 2026 Warehouse System
                </p>
            </div>

        </aside>
    );
}
