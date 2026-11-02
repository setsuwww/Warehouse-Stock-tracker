
"use client";

import { useEffect, useState } from "react";
import { Search, Eye, X, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function StockHistoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");

    async function loadHistory() {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (type !== "all") params.set("type", type);
            if (search.trim()) params.set("search", search.trim());

            const response = await fetch(
                `/api/server/stock-history?${params.toString()}`
            );

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            setItems(result.items);
        } catch (error) {
            setError(error.message || "Failed to load stock history.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHistory();
    }, [type, search]);

    const formatDate = (date) => {
        return new Date(date).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const totalIn = items
        .filter((item) => item.type === "IN")
        .reduce((sum, item) => sum + Number(item.quantity), 0);

    const totalOut = items
        .filter((item) => item.type === "OUT")
        .reduce((sum, item) => sum + Number(item.quantity), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">
                    Stock History
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Monitor all incoming and outgoing stock transactions.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Total Transactions"
                    value={items.length}
                />

                <SummaryCard
                    label="Total Stock In"
                    value={totalIn}
                    icon={<ArrowDownToLine size={18} />}
                />

                <SummaryCard
                    label="Total Stock Out"
                    value={totalOut}
                    icon={<ArrowUpFromLine size={18} />}
                />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search reference, product, SKU, user..."
                            className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">All Transactions</option>
                        <option value="IN">Stock In</option>
                        <option value="OUT">Stock Out</option>
                    </select>
                </div>

                {error ? (
                    <div className="p-10 text-center text-sm text-red-600">
                        {error}
                        <button
                            onClick={loadHistory}
                            className="ml-2 font-medium underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Loading stock history...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Reference</th>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium">Type</th>
                                    <th className="px-5 py-3 font-medium">Quantity</th>
                                    <th className="px-5 py-3 font-medium">Performed By</th>
                                    <th className="px-5 py-3 font-medium">Date</th>
                                    <th className="px-5 py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => {
                                    const isIn = item.type === "IN";

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                {item.reference_code}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {item.product_name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {item.sku}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    isIn
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-orange-50 text-orange-700"
                                                }`}>
                                                    {isIn
                                                        ? <ArrowDownToLine size={13} />
                                                        : <ArrowUpFromLine size={13} />}
                                                    {isIn ? "Stock In" : "Stock Out"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                {isIn ? "+" : "-"}
                                                {item.quantity} {item.unit}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {item.user_email || "-"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                {formatDate(item.created_at)}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => setSelected(item)}
                                                    title="View details"
                                                    aria-label="View transaction details"
                                                    className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                    Showing {items.length} latest transactions (maximum 500).
                </div>
            </div>

            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelected(null);
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Transaction Details
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {selected.reference_code}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            {[
                                ["Reference Code", selected.reference_code],
                                ["Product", selected.product_name],
                                ["SKU", selected.sku],
                                ["Transaction Type", selected.type === "IN" ? "Stock In" : "Stock Out"],
                                ["Quantity", `${selected.quantity} ${selected.unit}`],
                                ["Performed By", selected.user_email || "-"],
                                ["Date", formatDate(selected.created_at)],
                                ["Notes", selected.notes || "-"],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm"
                                >
                                    <span className="text-slate-500">{label}</span>
                                    <span className="max-w-[60%] break-words text-right font-medium text-slate-800">
                                        {value}
                                    </span>
                                </div>
                            ))}

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ label, value, icon }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{label}</p>
                <span className="text-slate-400">{icon}</span>
            </div>

            <p className="mt-3 text-2xl font-semibold text-slate-900">
                {value.toLocaleString("id-ID")}
            </p>
        </div>
    );
}
