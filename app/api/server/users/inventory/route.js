// /api/server/users/inventory

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET() {
    const auth = await authorizeApi(["manager", "staff"]);

    if (auth.response) return auth.response;

    try {
        const [products] = await pool.query(`
            SELECT
                p.id,
                p.sku,
                p.name,
                p.category_id,
                c.name AS category_name,
                p.supplier_id,
                s.name AS supplier_name,
                p.stock,
                p.minimum_stock,
                p.unit,
                p.created_at,
                p.updated_at
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            ORDER BY p.name ASC
        `);

        return NextResponse.json({
            items: products.map((product) => ({
                ...product,
                stock: Number(product.stock),
                minimum_stock: Number(product.minimum_stock),
            })),
        });
    } catch (error) {
        console.error("Manager Inventory GET Error:", error);

        return NextResponse.json(
            { message: "Failed to load inventory." },
            { status: 500 }
        );
    }
}
