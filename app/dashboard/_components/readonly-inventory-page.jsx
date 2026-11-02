
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Boxes,
    AlertTriangle,
    PackageX,
    RefreshCw,
    Eye,
    X,
} from "lucide-react";

function getStockStatus(product) {
    if (product.stock <= 0) return "Out of Stock";

    if (
        product.minimum_stock > 0 &&
        product.stock <= product.minimum_stock
    ) {
        return "Low Stock";
    }

    return "In Stock";
}

function StatusBadge({ status }) {
    const styles = {
        "In Stock": "bg-emerald-50 text-emerald-700",
        "Low Stock": "bg-amber-50 text-amber-700",
        "Out of Stock": "bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${styles[status]}`}
        >
            {status}
        </span>
    );
}

function SummaryCard({ title, value, icon: Icon }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <Icon size={19} className="text-gray-400" />
            </div>

            <p className="mt-3 text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat("id-ID").format(value)}
            </p>
        </div>
    );
}

export default function ReadOnlyInventoryPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadInventory() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/server/users/inventory");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load inventory."
                );
            }

            setProducts(result.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInventory();
    }, []);

    const categories = useMemo(() => {
        return [
            ...new Set(
                products
                    .map((product) => product.category_name)
                    .filter(Boolean)
            ),
        ].sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const keyword = search.toLowerCase();

            const matchesSearch =
                product.name.toLowerCase().includes(keyword) ||
                product.sku.toLowerCase().includes(keyword);

            const matchesCategory =
                category === "all" ||
                product.category_name === category;

            const matchesStatus =
                status === "all" ||
                getStockStatus(product) === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, search, category, status]);

    const summary = useMemo(() => ({
        total: products.length,
        low: products.filter(
            (product) => getStockStatus(product) === "Low Stock"
        ).length,
        empty: products.filter(
            (product) => getStockStatus(product) === "Out of Stock"
        ).length,
    }), [products]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">
                    Inventory
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Monitor product availability and stock conditions.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    title="Total Products"
                    value={summary.total}
                    icon={Boxes}
                />
                <SummaryCard
                    title="Low Stock"
                    value={summary.low}
                    icon={AlertTriangle}
                />
                <SummaryCard
                    title="Out of Stock"
                    value={summary.empty}
                    icon={PackageX}
                />
            </div>

            {error && (
                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}

                    <button
                        onClick={loadInventory}
                        className="font-medium underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
                    <div className="relative min-w-[220px] flex-1">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search product or SKU..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
                        />
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500"
                    >
                        <option value="all">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>

                    <button
                        onClick={loadInventory}
                        disabled={loading}
                        title="Refresh inventory"
                        className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
                        <RefreshCw size={17} className="animate-spin" />
                        Loading inventory...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-16 text-center">
                        <Boxes
                            size={28}
                            className="mx-auto mb-3 text-gray-300"
                        />
                        <p className="text-sm font-medium text-gray-700">
                            No products found
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium">Category</th>
                                    <th className="px-5 py-3 font-medium">Supplier</th>
                                    <th className="px-5 py-3 font-medium">Stock</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">
                                                {product.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {product.sku}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {product.category_name || "Uncategorized"}
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {product.supplier_name || "No supplier"}
                                        </td>

                                        <td className="px-5 py-4 font-medium text-gray-900">
                                            {product.stock} {product.unit}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={getStockStatus(product)}
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                            >
                                                <Eye size={14} />
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && (
                    <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
                        Showing {filteredProducts.length} of {products.length} products
                    </div>
                )}
            </section>

            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Product Details
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Inventory information
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div>
                                <p className="text-xs text-gray-500">Product Name</p>
                                <p className="mt-1 font-semibold text-gray-900">
                                    {selectedProduct.name}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">SKU</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.sku}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.category_name || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Supplier</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.supplier_name || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Unit</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.unit || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Current Stock</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {selectedProduct.stock} {selectedProduct.unit}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Minimum Stock</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProduct.minimum_stock} {selectedProduct.unit}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <p className="text-sm text-gray-500">Stock Condition</p>
                                <StatusBadge
                                    status={getStockStatus(selectedProduct)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-200 px-5 py-4">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
