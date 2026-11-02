
"use client";

import { useEffect, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Package,
    CheckCircle2,
} from "lucide-react";

export default function StockMovementForm({ type }) {
    const isStockIn = type === "IN";

    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        async function loadProducts() {
            try {
                const response = await fetch(
                    isStockIn ? "/api/server/stock-in" : "/api/server/stock-out"
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message);
                }

                setProducts(result.products);
            } catch (error) {
                setError(error.message || "Failed to load products.");
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, [isStockIn]);

    const selectedProduct = products.find(
        (product) => String(product.id) === productId
    );

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess(null);

        const amount = Number(quantity);

        if (!productId || !Number.isInteger(amount) || amount < 1) {
            setError("Please select a product and enter a valid quantity.");
            return;
        }

        if (isStockIn === false && amount > Number(selectedProduct?.stock || 0)) {
            setError("Quantity exceeds available stock.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                isStockIn ? "/api/server/stock-in" : "/api/server/stock-out",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        quantity: amount,
                        notes,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setSuccess(result);
            setQuantity("");
            setNotes("");

            setProducts((previous) =>
                previous.map((product) =>
                    product.id === Number(productId)
                        ? { ...product, stock: result.new_stock }
                        : product
                )
            );
        } catch (error) {
            setError(error.message || "Transaction failed.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">
                    {isStockIn ? "Stock In" : "Stock Out"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {isStockIn
                        ? "Record incoming products into your warehouse."
                        : "Record outgoing products from your warehouse."}
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-3 border-b border-slate-200 p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${
                        isStockIn
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                    }`}>
                        {isStockIn
                            ? <ArrowDownToLine size={20} />
                            : <ArrowUpFromLine size={20} />}
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            {isStockIn ? "Incoming Stock" : "Outgoing Stock"}
                        </h2>

                        <p className="text-xs text-slate-500">
                            Complete the transaction details below.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Select Product
                        </label>

                        <select
                            value={productId}
                            onChange={(event) => {
                                setProductId(event.target.value);
                                setSuccess(null);
                                setError("");
                            }}
                            required
                            disabled={loading}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                        >
                            <option value="">
                                {loading ? "Loading products..." : "Choose a product"}
                            </option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={!isStockIn && Number(product.stock) <= 0}
                                >
                                    {product.name} ({product.sku}) — {product.stock} {product.unit}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedProduct && (
                        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <Package size={20} className="text-slate-400" />

                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedProduct.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        SKU: {selectedProduct.sku}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-500">
                                    Current Stock
                                </p>
                                <p className="text-lg font-semibold text-slate-900">
                                    {selectedProduct.stock} {selectedProduct.unit}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="1"
                            max={!isStockIn ? selectedProduct?.stock : undefined}
                            value={quantity}
                            onChange={(event) => {
                                setQuantity(event.target.value);
                                setSuccess(null);
                            }}
                            required
                            placeholder="Enter quantity"
                            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />

                        {selectedProduct && (
                            <p className="mt-1.5 text-xs text-slate-500">
                                {isStockIn
                                    ? "This quantity will be added to current stock."
                                    : `Maximum available: ${selectedProduct.stock} ${selectedProduct.unit}`}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Notes <span className="font-normal text-slate-400">(Optional)</span>
                        </label>

                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder={
                                isStockIn
                                    ? "Example: Purchase from supplier..."
                                    : "Example: Product shipped to customer..."
                            }
                            className="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-md border border-green-100 bg-green-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                <CheckCircle2 size={17} />
                                Transaction successful
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-green-700">
                                <p>Reference: {success.reference_code}</p>
                                <p>
                                    Stock: {success.previous_stock} → {success.new_stock}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end border-t border-slate-100 pt-4">
                        <button
                            type="submit"
                            disabled={saving || loading || products.length === 0}
                            className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                isStockIn
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-orange-600 hover:bg-orange-700"
                            }`}
                        >
                            {saving
                                ? "Processing..."
                                : isStockIn
                                    ? "Confirm Stock In"
                                    : "Confirm Stock Out"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
