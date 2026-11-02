// api/server/admin/inventory/{id}

import { NextResponse } from "next/server";

import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function PUT(request, { params }) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const productId = Number(id);

        if (!Number.isInteger(productId) || productId < 1) {
            return NextResponse.json(
                { message: "Invalid product ID." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const {
            sku,
            name,
            category_id,
            supplier_id,
            minimum_stock,
            unit,
        } = body;

        if (!sku?.trim() || !name?.trim() || !unit?.trim()) {
            return NextResponse.json(
                { message: "SKU, name, and unit are required." },
                { status: 400 }
            );
        }

        const minStock = Number(minimum_stock);

        if (!Number.isInteger(minStock) || minStock < 0) {
            return NextResponse.json(
                { message: "Minimum stock must be a non-negative integer." },
                { status: 400 }
            );
        }

        const [existing] = await pool.execute(
            "SELECT id FROM products WHERE id = ? AND is_active = 1",
            [productId]
        );

        if (!existing.length) {
            return NextResponse.json(
                { message: "Product not found." },
                { status: 404 }
            );
        }

        await pool.execute(
            `UPDATE products
             SET sku = ?,
                 name = ?,
                 category_id = ?,
                 supplier_id = ?,
                 minimum_stock = ?,
                 unit = ?
             WHERE id = ? AND is_active = 1`,
            [
                sku.trim(),
                name.trim(),
                category_id || null,
                supplier_id || null,
                minStock,
                unit.trim(),
                productId,
            ]
        );

        return NextResponse.json({
            message: "Product updated successfully.",
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "SKU already exists." },
                { status: 409 }
            );
        }

        console.error("PUT product:", error);

        return NextResponse.json(
            { message: "Failed to update product." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const productId = Number(id);

        if (!Number.isInteger(productId) || productId < 1) {
            return NextResponse.json(
                { message: "Invalid product ID." },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            `UPDATE products
             SET is_active = 0
             WHERE id = ? AND is_active = 1`,
            [productId]
        );

        if (!result.affectedRows) {
            return NextResponse.json(
                { message: "Product not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Product archived successfully.",
        });
    } catch (error) {
        console.error("DELETE product:", error);

        return NextResponse.json(
            { message: "Failed to archive product." },
            { status: 500 }
        );
    }
}
