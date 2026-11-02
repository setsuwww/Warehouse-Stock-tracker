
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";

const configs = {
    categories: {
        title: "Categories",
        description: "Organize and manage your product categories.",
        endpoint: "/api/server/admin/categories",
        fields: [
            { name: "name", label: "Category Name", required: true },
            { name: "description", label: "Description", type: "textarea" },
        ],
        columns: [
            { key: "name", label: "Category Name" },
            { key: "description", label: "Description" },
        ],
    },
    suppliers: {
        title: "Suppliers",
        description: "Manage your warehouse suppliers.",
        endpoint: "/api/server/admin/suppliers",
        fields: [
            { name: "name", label: "Supplier Name", required: true },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone" },
            { name: "address", label: "Address", type: "textarea" },
        ],
        columns: [
            { key: "name", label: "Supplier Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
        ],
    },
};

export default function MasterDataPage({ type }) {
    const config = configs[type];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadData() {
        try {
            setLoading(true);

            const response = await fetch(config.endpoint);
            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            setItems(result.items);
        } catch (error) {
            setError(error.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [type]);

    const filteredItems = items.filter((item) =>
        config.fields.some((field) =>
            String(item[field.name] || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
    );

    function openCreate() {
        const initialForm = {};

        config.fields.forEach((field) => {
            initialForm[field.name] = "";
        });

        setForm(initialForm);
        setSelected(null);
        setError("");
        setModal("create");
    }

    function openEdit(item) {
        const initialForm = {};

        config.fields.forEach((field) => {
            initialForm[field.name] = item[field.name] || "";
        });

        setForm(initialForm);
        setSelected(item);
        setError("");
        setModal("edit");
    }

    function openDetail(item) {
        setSelected(item);
        setError("");
        setModal("detail");
    }

    function openDelete(item) {
        setSelected(item);
        setError("");
        setModal("delete");
    }

    function closeModal() {
        setModal(null);
        setSelected(null);
        setError("");
    }

    function updateForm(event) {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
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
                    ? `${config.endpoint}/${selected.id}`
                    : config.endpoint,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            closeModal();
            await loadData();
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
                `${config.endpoint}/${selected.id}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            closeModal();
            await loadData();
        } catch (error) {
            setError(error.message || "Failed to delete data.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        {config.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {config.description}
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus size={17} />
                    Add {type === "categories" ? "Category" : "Supplier"}
                </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-4">
                    <div className="relative max-w-md">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={`Search ${config.title.toLowerCase()}...`}
                            className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Loading {config.title.toLowerCase()}...
                    </div>
                ) : error && !modal ? (
                    <div className="p-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    {config.columns.map((column) => (
                                        <th key={column.key} className="px-5 py-3 font-medium">
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-5 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        {config.columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="px-5 py-4 text-slate-600"
                                            >
                                                {item[column.key] || "-"}
                                            </td>
                                        ))}

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <ActionButton
                                                    label="View details"
                                                    onClick={() => openDetail(item)}
                                                >
                                                    <Eye size={16} />
                                                </ActionButton>

                                                <ActionButton
                                                    label="Edit"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <Pencil size={16} />
                                                </ActionButton>

                                                <ActionButton
                                                    label="Delete"
                                                    danger
                                                    onClick={() => openDelete(item)}
                                                >
                                                    <Trash2 size={16} />
                                                </ActionButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={config.columns.length + 1}
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            No data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                    Showing {filteredItems.length} of {items.length} records
                </div>
            </div>

            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            closeModal();
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    {modal === "create" && `Add ${type === "categories" ? "Category" : "Supplier"}`}
                                    {modal === "edit" && `Edit ${config.title}`}
                                    {modal === "detail" && `${config.title} Details`}
                                    {modal === "delete" && `Delete ${type === "categories" ? "Category" : "Supplier"}`}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Manage {type === "categories" ? "category" : "supplier"} information.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {modal === "detail" ? (
                            <div className="space-y-4 p-5">
                                {config.fields.map((field) => (
                                    <div
                                        key={field.name}
                                        className="border-b border-slate-100 pb-3"
                                    >
                                        <p className="text-xs text-slate-500">
                                            {field.label}
                                        </p>
                                        <p className="mt-1 break-words text-sm font-medium text-slate-800">
                                            {selected?.[field.name] || "-"}
                                        </p>
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : modal === "delete" ? (
                            <div className="space-y-5 p-5">
                                <p className="text-sm text-slate-600">
                                    Are you sure you want to delete{" "}
                                    <strong>{selected?.name}</strong>?
                                </p>

                                {error && <ErrorMessage>{error}</ErrorMessage>}

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-md border border-slate-200 px-4 py-2 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                    >
                                        {saving ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                                {config.fields.map((field) => (
                                    <label key={field.name} className="block space-y-1.5">
                                        <span className="text-sm font-medium text-slate-700">
                                            {field.label}
                                        </span>

                                        {field.type === "textarea" ? (
                                            <textarea
                                                name={field.name}
                                                value={form[field.name] || ""}
                                                onChange={updateForm}
                                                rows={3}
                                                className="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            />
                                        ) : (
                                            <input
                                                type={field.type || "text"}
                                                name={field.name}
                                                value={form[field.name] || ""}
                                                onChange={updateForm}
                                                required={field.required}
                                                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            />
                                        )}
                                    </label>
                                ))}

                                {error && <ErrorMessage>{error}</ErrorMessage>}

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-md border border-slate-200 px-4 py-2 text-sm"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : modal === "edit"
                                                ? "Save Changes"
                                                : "Create"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionButton({ label, children, onClick, danger = false }) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={`rounded-md p-2 ${
                danger
                    ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            }`}
        >
            {children}
        </button>
    );
}

function ErrorMessage({ children }) {
    return (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {children}
        </p>
    );
}
