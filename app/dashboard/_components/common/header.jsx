
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header({ title = "Dashboard" }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Logout gagal.");
            }

            router.replace("/login");
            router.refresh();

        } catch (error) {
            console.error("Logout error:", error);
            setLoading(false);
        }
    };

    return (
        <header className="flex h-[65px] items-center justify-between border-b border-slate-200 bg-white px-7">

            <div>
                <h2 className="text-base font-semibold text-slate-900">
                    {title}
                </h2>
            </div>

            <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                aria-label="Logout"
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
                <LogOut size={17} />
            </button>

        </header>
    );
}
