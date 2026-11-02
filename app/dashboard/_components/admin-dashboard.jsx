"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Package,
    Boxes,
    ArrowDownToLine,
    ArrowUpFromLine,
    AlertTriangle,
    Users,
    Plus,
    ArrowRight,
    RefreshCw,
    Activity,
} from "lucide-react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(value || 0);

const formatDate = (value) =>
    new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
    });

const formatDateTime = (value) =>
    new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });

const statusConfig = {
    in_stock: {
        label: "In Stock",
        color: "#16a34a",
    },
    low_stock: {
        label: "Low Stock",
        color: "#d97706",
    },
    out_of_stock: {
        label: "Out of Stock",
        color: "#dc2626",
    },
};

function StatCard({ title, value, description, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="rounded-md bg-gray-100 p-2">
                    <Icon size={18} className="text-gray-600" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
                {formatNumber(value)}
            </p>

            <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
    );
}

function SectionHeader({ title, description, href, linkLabel }) {
    return (
        <div className="mb-5 flex items-center justify-between gap-3">
            <div>
                <h2 className="font-semibold text-gray-900">{title}</h2>
                {description && (
                    <p className="mt-1 text-xs text-gray-500">{description}</p>
                )}
            </div>

            {href && (
                <Link
                    href={href}
                    className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                    {linkLabel || "View all"}
                    <ArrowRight size={14} />
                </Link>
            )}
        </div>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-xs font-medium text-gray-700">
                {label}
            </p>

            {payload.map((item) => (
                <div
                    key={item.dataKey}
                    className="flex items-center justify-between gap-5 text-xs"
                >
                    <span className="text-gray-500">{item.name}</span>
                    <span className="font-semibold text-gray-900">
                        {formatNumber(item.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function StockMovementChart({ data }) {
    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="stockInGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>

                        <linearGradient id="stockOutGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        stroke="#f0f0f0"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip content={<ChartTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="stockIn"
                        name="Stock In"
                        stroke="#16a34a"
                        strokeWidth={2}
                        fill="url(#stockInGradient)"
                    />

                    <Area
                        type="monotone"
                        dataKey="stockOut"
                        name="Stock Out"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fill="url(#stockOutGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function InventoryChart({ data }) {
    const chartData = [
        {
            name: "In Stock",
            value: data.find((item) => item.status === "in_stock")?.total || 0,
            color: "#16a34a",
        },
        {
            name: "Low Stock",
            value: data.find((item) => item.status === "low_stock")?.total || 0,
            color: "#d97706",
        },
        {
            name: "Out of Stock",
            value: data.find((item) => item.status === "out_of_stock")?.total || 0,
            color: "#dc2626",
        },
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div>
            <div className="relative h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={82}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {chartData.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value, name) => [
                                formatNumber(value),
                                name,
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-900">
                        {formatNumber(total)}
                    </span>
                    <span className="text-xs text-gray-500">Products</span>
                </div>
            </div>

            <div className="mt-2 space-y-3">
                {chartData.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-gray-600">{item.name}</span>
                        </div>

                        <span className="font-medium text-gray-900">
                            {formatNumber(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopProductsChart({ data }) {
    if (!data.length) {
        return (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
                No product movement data yet.
            </div>
        );
    }

    return (
        <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 15, left: 10, bottom: 0 }}
                >
                    <CartesianGrid
                        stroke="#f0f0f0"
                        strokeDasharray="3 3"
                        horizontal={false}
                    />

                    <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        formatter={(value) => [
                            formatNumber(value),
                            "Total Movement",
                        ]}
                    />

                    <Bar
                        dataKey="total_movement"
                        fill="#4b5563"
                        radius={[0, 4, 4, 0]}
                        barSize={22}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function FastAction({ href, label, description, icon: Icon }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-400"
        >
            <div className="rounded-md bg-gray-100 p-2.5 text-gray-700 transition group-hover:bg-gray-200">
                <Icon size={19} />
            </div>

            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{description}</p>
            </div>

            <ArrowRight
                size={15}
                className="ml-auto shrink-0 text-gray-400 transition group-hover:translate-x-1"
            />
        </Link>
    );
}

function RecentActivities({ data }) {
    if (!data.length) {
        return (
            <p className="py-8 text-center text-sm text-gray-400">
                No recent activities.
            </p>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {data.map((item) => {
                const isStockIn = item.type === "IN";

                return (
                    <div
                        key={item.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                        <div
                            className={`rounded-md p-2 ${
                                isStockIn
                                    ? "bg-green-50 text-green-700"
                                    : "bg-blue-50 text-blue-700"
                            }`}
                        >
                            {isStockIn ? (
                                <ArrowDownToLine size={17} />
                            ) : (
                                <ArrowUpFromLine size={17} />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {item.product_name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-500">
                                {item.user_email} · {item.reference_code}
                            </p>
                        </div>

                        <div className="shrink-0 text-right">
                            <p
                                className={`text-sm font-semibold ${
                                    isStockIn ? "text-green-700" : "text-blue-700"
                                }`}
                            >
                                {isStockIn ? "+" : "-"}
                                {formatNumber(item.quantity)}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                                {formatDateTime(item.created_at)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function LowStockAlerts({ data }) {
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package size={25} className="text-green-600" />
                <p className="mt-2 text-sm font-medium text-gray-800">
                    All stocks look good
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    No products need attention right now.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {data.map((item) => {
                const outOfStock = Number(item.stock) <= 0;

                return (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {item.name}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                {item.sku}
                            </p>
                        </div>

                        <div className="shrink-0 text-right">
                            <span
                                className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                                    outOfStock
                                        ? "bg-red-50 text-red-700"
                                        : "bg-amber-50 text-amber-700"
                                }`}
                            >
                                {outOfStock ? "Out of Stock" : "Low Stock"}
                            </span>

                            <p className="mt-1 text-xs text-gray-500">
                                {formatNumber(item.stock)} / {formatNumber(item.minimum_stock)} {item.unit}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboard() {
        try {
            setError("");

            const response = await fetch("/api/stats/admin");

            if (!response.ok) {
                throw new Error("Failed to load dashboard data.");
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="space-y-5">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
                        />
                    ))}
                </div>
                <div className="h-80 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-lg border border-red-200 bg-white p-6">
                <p className="text-sm font-medium text-red-700">
                    {error || "Dashboard data is unavailable."}
                </p>

                <button
                    onClick={loadDashboard}
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                    <RefreshCw size={14} />
                    Try again
                </button>
            </div>
        );
    }

    const { stats, movement, distribution, topProducts, recentActivities, lowStockProducts } = data;

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your warehouse operations.
                    </p>
                </div>

                <button
                    onClick={loadDashboard}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    description="Registered products"
                    icon={Package}
                />

                <StatCard
                    title="Total Stock"
                    value={stats.totalStock}
                    description="Current inventory quantity"
                    icon={Boxes}
                />

                <StatCard
                    title="Stock In Today"
                    value={stats.stockInToday}
                    description="Total quantity received today"
                    icon={ArrowDownToLine}
                />

                <StatCard
                    title="Stock Out Today"
                    value={stats.stockOutToday}
                    description="Total quantity issued today"
                    icon={ArrowUpFromLine}
                />

                <StatCard
                    title="Low Stock"
                    value={stats.lowStock}
                    description="Products below minimum stock"
                    icon={AlertTriangle}
                />

                <StatCard
                    title="Out of Stock"
                    value={stats.outOfStock}
                    description="Products with zero stock"
                    icon={Package}
                />

                <StatCard
                    title="Active Users"
                    value={stats.totalUsers}
                    description="Active system accounts"
                    icon={Users}
                />

                <StatCard
                    title="Total Stock Movement"
                    value={stats.stockInToday + stats.stockOutToday}
                    description="Units moved today"
                    icon={Activity}
                />
            </div>

            {/* Main charts */}
            <div className="grid gap-5 xl:grid-cols-3">
                <section className="rounded-lg border border-gray-200 bg-white p-5 xl:col-span-2">
                    <SectionHeader
                        title="Stock Movement"
                        description="Stock In and Stock Out over the last 7 days"
                    />

                    <div className="mb-4 flex items-center gap-4">
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="h-2 w-2 rounded-full bg-green-600" />
                            Stock In
                        </span>
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            Stock Out
                        </span>
                    </div>

                    <StockMovementChart data={movement} />
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <SectionHeader
                        title="Inventory Distribution"
                        description="Current product stock status"
                    />

                    <InventoryChart data={distribution} />
                </section>
            </div>

            {/* Fast actions */}
            <section>
                <SectionHeader
                    title="Quick Actions"
                    description="Frequently used warehouse operations"
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <FastAction
                        href="/dashboard/admin/inventory"
                        label="Add Product"
                        description="Manage warehouse products"
                        icon={Plus}
                    />

                    <FastAction
                        href="/dashboard/admin/stock-in"
                        label="Stock In"
                        description="Record incoming goods"
                        icon={ArrowDownToLine}
                    />

                    <FastAction
                        href="/dashboard/admin/stock-out"
                        label="Stock Out"
                        description="Record outgoing goods"
                        icon={ArrowUpFromLine}
                    />

                    <FastAction
                        href="/dashboard/admin/users"
                        label="Manage Users"
                        description="Manage system accounts"
                        icon={Users}
                    />
                </div>
            </section>

            {/* Bottom sections */}
            <div className="grid gap-5 xl:grid-cols-2">
                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <SectionHeader
                        title="Recent Activities"
                        description="Latest warehouse transactions"
                        href="/dashboard/admin/history"
                        linkLabel="View history"
                    />

                    <RecentActivities data={recentActivities} />
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <SectionHeader
                        title="Low Stock Alerts"
                        description="Products that need restocking"
                        href="/dashboard/admin/inventory"
                        linkLabel="View inventory"
                    />

                    <LowStockAlerts data={lowStockProducts} />
                </section>
            </div>

            {/* Top moving products */}
            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <SectionHeader
                    title="Top Moving Products"
                    description="Products with the highest total movement in the last 30 days"
                />

                <TopProductsChart data={topProducts} />
            </section>
        </div>
    );
}
