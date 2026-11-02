
"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    X,
    Package,
} from "lucide-react";

const emptyForm = {
    sku: "",
    name: "",
    category_id: "",
    supplier_id: "",
    minimum_stock: 5,
    unit: "pcs",
};

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadProducts() {
        try {
            setLoading(true);

            const response = await fetch("/api/server/admin/inventory");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setProducts(result.products);
            setCategories(result.categories);
            setSuppliers(result.suppliers);
        } catch (error) {
            setError(error.message || "Failed to load inventory.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const keyword = search.toLowerCase();

            const matchesSearch =
                product.name.toLowerCase().includes(keyword) ||
                product.sku.toLowerCase().includes(keyword);

            const matchesCategory =
                filterCategory === "all" ||
                String(product.category_id) === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, filterCategory]);

    function openCreate() {
        setForm(emptyForm);
        setSelected(null);
        setError("");
        setModal("create");
    }

    function openEdit(product) {
        setSelected(product);

        setForm({
            sku: product.sku,
            name: product.name,
            category_id: product.category_id || "",
            supplier_id: product.supplier_id || "",
            minimum_stock: product.minimum_stock,
            unit: product.unit,
        });

        setError("");
        setModal("edit");
    }

    function closeModal() {
        setModal(null);
        setSelected(null);
        setError("");
    }

    function updateForm(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            const isEdit = modal === "edit";

            const response = await fetch(
                isEdit
                    ? `/api/server/admin/inventory/${selected.id}`
                    : "/api/server/admin/inventory",
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            closeModal();
            await loadProducts();
        } catch (error) {
            setError(error.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        setSaving(true);
        setError("");

        try {
            const response = await fetch(
                `/api/server/admin/inventory/${selected.id}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            closeModal();
            await loadProducts();
        } catch (error) {
            setError(error.message || "Failed to archive product.");
        } finally {
            setSaving(false);
        }
    }

    function stockStatus(product) {
        if (product.stock <= 0) {
            return {
                label: "Out of Stock",
                className: "bg-red-50 text-red-700",
            };
        }

        if (product.stock <= product.minimum_stock) {
            return {
                label: "Low Stock",
                className: "bg-amber-50 text-amber-700",
            };
        }

        return {
            label: "In Stock",
            className: "bg-green-50 text-green-700",
        };
    }

    const isFormModal = modal === "create" || modal === "edit";

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Inventory
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your warehouse products and stock information.
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <Plus size={17} />
                    Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Total Products"
                    value={products.length}
                    icon={<Package size={19} />}
                />

                <SummaryCard
                    label="Low Stock"
                    value={products.filter(
                        (p) => p.stock > 0 && p.stock <= p.minimum_stock
                    ).length}
                />

                <SummaryCard
                    label="Out of Stock"
                    value={products.filter((p) => p.stock <= 0).length}
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
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by product name or SKU..."
                            className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">All Categories</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Loading inventory...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium">Category</th>
                                    <th className="px-5 py-3 font-medium">Stock</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => {
                                    const status = stockStatus(product);

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {product.sku}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {product.category_name || "-"}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                {product.stock} {product.unit}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <ActionButton
                                                        label="View details"
                                                        onClick={() => {
                                                            setSelected(product);
                                                            setModal("detail");
                                                            setError("");
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </ActionButton>

                                                    <ActionButton
                                                        label="Edit product"
                                                        onClick={() => openEdit(product)}
                                                    >
                                                        <Pencil size={16} />
                                                    </ActionButton>

                                                    <ActionButton
                                                        label="Delete product"
                                                        onClick={() => {
                                                            setSelected(product);
                                                            setModal("delete");
                                                            setError("");
                                                        }}
                                                        danger
                                                    >
                                                        <Trash2 size={16} />
                                                    </ActionButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>

            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !saving) {
                            closeModal();
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    {modal === "create" && "Add New Product"}
                                    {modal === "edit" && "Edit Product"}
                                    {modal === "detail" && "Product Details"}
                                    {modal === "delete" && "Delete Product"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {modal === "create" && "Enter the new product information."}
                                    {modal === "edit" && "Update product information."}
                                    {modal === "detail" && "View complete product information."}
                                    {modal === "delete" && "Archive this product from inventory."}
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {isFormModal ? (
                            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                                <FormField label="SKU">
                                    <input
                                        name="sku"
                                        value={form.sku}
                                        onChange={updateForm}
                                        required
                                        placeholder="PRD-001"
                                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </FormField>

                                <FormField label="Product Name">
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={updateForm}
                                        required
                                        placeholder="Product name"
                                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField label="Category">
                                        <select
                                            name="category_id"
                                            value={form.category_id}
                                            onChange={updateForm}
                                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">No Category</option>
                                            {categories.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="Supplier">
                                        <select
                                            name="supplier_id"
                                            value={form.supplier_id}
                                            onChange={updateForm}
                                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">No Supplier</option>
                                            {suppliers.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField label="Minimum Stock">
                                        <input
                                            type="number"
                                            min="0"
                                            name="minimum_stock"
                                            value={form.minimum_stock}
                                            onChange={updateForm}
                                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </FormField>

                                    <FormField label="Unit">
                                        <input
                                            name="unit"
                                            value={form.unit}
                                            onChange={updateForm}
                                            required
                                            placeholder="pcs, box, kg..."
                                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </FormField>
                                </div>

                                {modal === "create" && (
                                    <p className="text-xs text-slate-500">
                                        New products start with 0 stock. Use Stock In to record incoming goods.
                                    </p>
                                )}

                                {error && (
                                    <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : modal === "edit" ? "Save Changes" : "Create Product"}
                                    </button>
                                </div>
                            </form>
                        ) : modal === "detail" ? (
                            <div className="space-y-4 p-5">
                                {[
                                    ["SKU", selected?.sku],
                                    ["Product Name", selected?.name],
                                    ["Category", selected?.category_name || "-"],
                                    ["Supplier", selected?.supplier_name || "-"],
                                    ["Current Stock", `${selected?.stock} ${selected?.unit}`],
                                    ["Minimum Stock", `${selected?.minimum_stock} ${selected?.unit}`],
                                    ["Unit", selected?.unit],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="text-right font-medium text-slate-800">{value}</span>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 p-5">
                                <p className="text-sm text-slate-600">
                                    Are you sure you want to archive{" "}
                                    <strong>{selected?.name}</strong>?
                                    It will no longer appear in active inventory.
                                </p>

                                {error && (
                                    <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {saving ? "Deleting..." : "Archive Product"}
                                    </button>
                                </div>
                            </div>
                        )}
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
                {value}
            </p>
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
                {label}
            </span>
            {children}
        </label>
    );
}

function ActionButton({ label, children, onClick, danger = false }) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={`rounded-md p-2 transition ${
                danger
                    ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            }`}
        >
            {children}
        </button>
    );
}
