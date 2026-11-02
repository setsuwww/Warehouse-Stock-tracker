// api/server/admin/inventory

import { NextResponse } from "next/server";

import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET() {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const [products] = await pool.execute(`
            SELECT
                p.id,
                p.sku,
                p.name,
                p.category_id,
                p.supplier_id,
                p.stock,
                p.minimum_stock,
                p.unit,
                c.name AS category_name,
                s.name AS supplier_name,
                p.created_at,
                p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.is_active = 1
            ORDER BY p.created_at DESC
        `);

        const [categories] = await pool.execute(`
            SELECT id, name FROM categories ORDER BY name ASC
        `);

        const [suppliers] = await pool.execute(`
            SELECT id, name FROM suppliers ORDER BY name ASC
        `);

        return NextResponse.json({
            products,
            categories,
            suppliers,
        });
    } catch (error) {
        console.error("GET products:", error);

        return NextResponse.json(
            { message: "Failed to load products." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
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

        const minStock = Number(minimum_stock ?? 0);

        if (!Number.isInteger(minStock) || minStock < 0) {
            return NextResponse.json(
                { message: "Minimum stock must be a non-negative integer." },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            `INSERT INTO products
                (sku, name, category_id, supplier_id, stock, minimum_stock, unit)
             VALUES (?, ?, ?, ?, 0, ?, ?)`,
            [
                sku.trim(),
                name.trim(),
                category_id || null,
                supplier_id || null,
                minStock,
                unit.trim(),
            ]
        );

        return NextResponse.json(
            {
                message: "Product created successfully.",
                id: result.insertId,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "SKU already exists." },
                { status: 409 }
            );
        }

        console.error("POST products:", error);

        return NextResponse.json(
            { message: "Failed to create product." },
            { status: 500 }
        );
    }
}
