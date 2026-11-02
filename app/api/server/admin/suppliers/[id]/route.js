// api/server/admin/suppliers/{id}

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function PUT(request, { params }) {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const { name, email, phone, address } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json(
                { message: "Supplier name is required." },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            `UPDATE suppliers
             SET name = ?, email = ?, phone = ?, address = ?
             WHERE id = ?`,
            [
                name.trim(),
                email?.trim() || null,
                phone?.trim() || null,
                address?.trim() || null,
                id,
            ]
        );

        if (!result.affectedRows) {
            return NextResponse.json(
                { message: "Supplier not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Supplier updated." });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "Supplier email already exists." },
                { status: 409 }
            );
        }

        console.error(error);
        return NextResponse.json(
            { message: "Failed to update supplier." },
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
            "DELETE FROM suppliers WHERE id = ?",
            [id]
        );

        if (!result.affectedRows) {
            return NextResponse.json(
                { message: "Supplier not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Supplier deleted." });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to delete supplier." },
            { status: 500 }
        );
    }
}
