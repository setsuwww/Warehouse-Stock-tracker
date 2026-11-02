// api/server/admin/categories/

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET() {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const [items] = await pool.execute(`
            SELECT id, name, description, created_at
            FROM categories
            ORDER BY name ASC
        `);

        return NextResponse.json({ items });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to load categories." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const { name, description } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json(
                { message: "Category name is required." },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            "INSERT INTO categories (name, description) VALUES (?, ?)",
            [name.trim(), description?.trim() || null]
        );

        return NextResponse.json(
            { message: "Category created.", id: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "Category name already exists." },
                { status: 409 }
            );
        }

        console.error(error);
        return NextResponse.json(
            { message: "Failed to create category." },
            { status: 500 }
        );
    }
}
