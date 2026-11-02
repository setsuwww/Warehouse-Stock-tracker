// api/server/admin/suppliers

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET() {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const [items] = await pool.execute(`
            SELECT id, name, email, phone, address, created_at
            FROM suppliers
            ORDER BY name ASC
        `);

        return NextResponse.json({ items });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to load suppliers." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const { name, email, phone, address } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json(
                { message: "Supplier name is required." },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            `INSERT INTO suppliers (name, email, phone, address)
             VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                email?.trim() || null,
                phone?.trim() || null,
                address?.trim() || null,
            ]
        );

        return NextResponse.json(
            { message: "Supplier created.", id: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "Supplier email already exists." },
                { status: 409 }
            );
        }

        console.error(error);
        return NextResponse.json(
            { message: "Failed to create supplier." },
            { status: 500 }
        );
    }
}
