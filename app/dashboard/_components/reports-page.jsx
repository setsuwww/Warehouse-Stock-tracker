
"use client";

import { useEffect, useState } from "react";
import {
    Boxes,
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    ClipboardList,
    RefreshCw,
} from "lucide-react";

const numberFormat = (value) =>
    new Intl.NumberFormat("id-ID").format(Number(value || 0));

const dateFormat = (value) =>
    new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

function SummaryCard({ title, value, icon: Icon, description }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <Icon size={19} className="text-gray-400" />
            </div>

            <p className="mt-3 text-2xl font-semibold text-gray-900">
                {numberFormat(value)}
            </p>

            <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
    );
}

export default function ReportsPage() {
    const [data, setData] = useState(null);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadReports() {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (from && to) {
                params.set("from", from);
                params.set("to", to);
            }

            const response = await fetch(`/api/server/reports?${params.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to load reports.");
            }

            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReports();
    }, []);

    function handleFilter(event) {
        event.preventDefault();

        if (from && to && from > to) {
            setError("Tanggal awal tidak boleh melewati tanggal akhir.");
            return;
        }

        loadReports();
    }

    const stats = data?.stats;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Overview of inventory and stock movement activities.
                </p>
            </div>

            <form
                onSubmit={handleFilter}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        From
                    </label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                        To
                    </label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    Apply Filter
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setFrom("");
                        setTo("");
                        setTimeout(loadReports, 0);
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Reset
                </button>
            </form>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 py-12 text-sm text-gray-500">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading reports...
                </div>
            ) : data ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SummaryCard
                            title="Total Products"
                            value={stats.totalProducts}
                            icon={Boxes}
                            description="Registered products"
                        />
                        <SummaryCard
                            title="Total Stock"
                            value={stats.totalStock}
                            icon={ClipboardList}
                            description="Available stock units"
                        />
                        <SummaryCard
                            title="Low Stock"
                            value={stats.lowStock}
                            icon={AlertTriangle}
                            description="Products at or below minimum stock"
                        />
                        <SummaryCard
                            title="Total Transactions"
                            value={stats.totalTransactions}
                            icon={RefreshCw}
                            description="Transactions in selected period"
                        />
                        <SummaryCard
                            title="Stock In"
                            value={stats.totalIn}
                            icon={ArrowDownToLine}
                            description="Total incoming quantity"
                        />
                        <SummaryCard
                            title="Stock Out"
                            value={stats.totalOut}
                            icon={ArrowUpFromLine}
                            description="Total outgoing quantity"
                        />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-900">
                                    Daily Stock Movement
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Incoming and outgoing quantities by date.
                                </p>
                            </div>

                            {data.daily.length ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500">
                                            <tr>
                                                <th className="px-5 py-3 font-medium">Date</th>
                                                <th className="px-5 py-3 font-medium">Stock In</th>
                                                <th className="px-5 py-3 font-medium">Stock Out</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.daily.map((item) => (
                                                <tr key={String(item.date)}>
                                                    <td className="px-5 py-3 text-gray-700">
                                                        {dateFormat(item.date)}
                                                    </td>
                                                    <td className="px-5 py-3 font-medium text-emerald-700">
                                                        +{numberFormat(item.total_in)}
                                                    </td>
                                                    <td className="px-5 py-3 font-medium text-red-600">
                                                        -{numberFormat(item.total_out)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="px-5 py-10 text-center text-sm text-gray-500">
                                    No stock movement found.
                                </p>
                            )}
                        </section>

                        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-900">
                                    Top Moving Products
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Products with the highest movement quantity.
                                </p>
                            </div>

                            {data.topProducts.length ? (
                                <div className="divide-y divide-gray-100">
                                    {data.topProducts.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between gap-4 px-5 py-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {product.sku}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 text-sm font-semibold text-gray-900">
                                                {numberFormat(product.total_movement)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="px-5 py-10 text-center text-sm text-gray-500">
                                    No product movement found.
                                </p>
                            )}
                        </section>
                    </div>
                </>
            ) : null}
        </div>
    );
}
