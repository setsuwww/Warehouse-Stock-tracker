
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, UserX, RefreshCw, X } from "lucide-react";

const initialForm = {
    email: "",
    password: "",
    role: "staff",
    is_active: true,
};

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modal, setModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    async function loadUsers() {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.set("search", search.trim());
            }

            const response = await fetch(`/api/server/users?${params.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to load users.");
            }

            setUsers(result.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = setTimeout(loadUsers, 300);
        return () => clearTimeout(timer);
    }, [search]);

    function openCreate() {
        setEditingUser(null);
        setForm(initialForm);
        setError("");
        setModal(true);
    }

    function openEdit(user) {
        setEditingUser(user);
        setForm({
            email: user.email,
            password: "",
            role: user.role,
            is_active: Boolean(user.is_active),
        });
        setError("");
        setModal(true);
    }

    function closeModal() {
        setModal(false);
        setEditingUser(null);
        setForm(initialForm);
        setError("");
    }

    function updateField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const isEditing = Boolean(editingUser);

            const endpoint = isEditing
                ? `/api/server/users/${editingUser.id}`
                : "/api/server/users";

            const method = isEditing ? "PUT" : "POST";

            const payload = {
                email: form.email,
                role: form.role,
            };

            if (form.password) {
                payload.password = form.password;
            }

            if (isEditing) {
                payload.is_active = form.is_active;
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to save user.");
            }

            closeModal();
            await loadUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deactivateUser(user) {
        const confirmed = window.confirm(
            `Deactivate ${user.email}? This account will no longer be able to log in.`
        );

        if (!confirmed) return;

        setError("");

        try {
            const response = await fetch(`/api/server/users/${user.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to deactivate user.");
            }

            await loadUsers();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage user accounts and access permissions.
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {error && !modal && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-4">
                    <div className="relative max-w-sm">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search email..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-14 text-sm text-gray-500">
                        <RefreshCw size={16} className="animate-spin" />
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-14 text-center text-sm text-gray-500">
                        No users found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">User</th>
                                    <th className="px-5 py-3 font-medium">Role</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Created At</th>
                                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">
                                                {user.email}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                ID: {user.id}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                                                    user.is_active
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {user.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString("id-ID")}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    title="Edit user"
                                                    className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                                >
                                                    <Pencil size={15} />
                                                </button>

                                                {Boolean(user.is_active) && (
                                                    <button
                                                        onClick={() => deactivateUser(user)}
                                                        title="Deactivate user"
                                                        className="rounded-md border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                                                    >
                                                        <UserX size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    {editingUser ? "Edit User" : "Create User"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Configure account information and access.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    {editingUser ? "New Password (optional)" : "Password"}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    minLength={8}
                                    value={form.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    placeholder={editingUser ? "Leave blank to keep current password" : "Minimum 8 characters"}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    value={form.role}
                                    onChange={(e) => updateField("role", e.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>

                            {editingUser && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Account Status
                                    </label>
                                    <select
                                        value={form.is_active ? "active" : "inactive"}
                                        onChange={(e) =>
                                            updateField("is_active", e.target.value === "active")
                                        }
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
