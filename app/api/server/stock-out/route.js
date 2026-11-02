// api/server/stock-out/


import { NextResponse } from "next/server";

import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET() {
    const auth = await authorizeApi(["admin", "staff"]);

    if (auth.response) return auth.response;

    try {
        const [products] = await pool.execute(`
            SELECT id, sku, name, stock, unit
            FROM products
            WHERE is_active = 1
            ORDER BY name ASC
        `);

        return NextResponse.json({ products });
    } catch (error) {
        console.error("GET stock-out:", error);

        return NextResponse.json(
            { message: "Failed to load products." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const auth = await authorizeApi(["admin", "staff"]);

    if (auth.response) return auth.response;

    const connection = await pool.getConnection();

    try {
        const body = await request.json();

        const productId = Number(body.product_id);
        const quantity = Number(body.quantity);
        const notes = body.notes?.trim() || null;

        if (
            !Number.isInteger(productId) ||
            productId < 1 ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return NextResponse.json(
                { message: "Invalid product or quantity." },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        const [products] = await connection.execute(
            `SELECT id, stock
             FROM products
             WHERE id = ? AND is_active = 1
             FOR UPDATE`,
            [productId]
        );

        if (!products.length) {
            await connection.rollback();

            return NextResponse.json(
                { message: "Product not found." },
                { status: 404 }
            );
        }

        const currentStock = Number(products[0].stock);

        if (quantity > currentStock) {
            await connection.rollback();

            return NextResponse.json(
                {
                    message: `Insufficient stock. Available stock: ${currentStock}.`,
                },
                { status: 400 }
            );
        }

        const referenceCode =
            `OUT-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

        await connection.execute(
            `UPDATE products
             SET stock = stock - ?
             WHERE id = ?`,
            [quantity, productId]
        );

        await connection.execute(
            `INSERT INTO stock_movements
                (reference_code, product_id, user_id, type, quantity, notes)
             VALUES (?, ?, ?, 'OUT', ?, ?)`,
            [
                referenceCode,
                productId,
                auth.user.id,
                quantity,
                notes,
            ]
        );

        await connection.commit();

        return NextResponse.json(
            {
                message: "Stock Out recorded successfully.",
                reference_code: referenceCode,
                previous_stock: currentStock,
                new_stock: currentStock - quantity,
            },
            { status: 201 }
        );
    } catch (error) {
        await connection.rollback();

        console.error("POST stock-out:", error);

        return NextResponse.json(
            { message: "Failed to record Stock Out." },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
