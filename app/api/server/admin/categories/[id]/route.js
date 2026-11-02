// api/server/admin/categories/{id}

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function PUT(request, { params }) {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const { name, description } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json(
                { message: "Category name is required." },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            `UPDATE categories
             SET name = ?, description = ?
             WHERE id = ?`,
            [name.trim(), description?.trim() || null, id]
        );

        if (!result.affectedRows) {
            return NextResponse.json(
                { message: "Category not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Category updated." });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "Category name already exists." },
                { status: 409 }
            );
        }

        console.error(error);
        return NextResponse.json(
            { message: "Failed to update category." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const { id } = await params;

        const [result] = await pool.execute(
            "DELETE FROM categories WHERE id = ?",
            [id]
        );

        if (!result.affectedRows) {
            return NextResponse.json(
                { message: "Category not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Category deleted." });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to delete category." },
            { status: 500 }
        );
    }
}
