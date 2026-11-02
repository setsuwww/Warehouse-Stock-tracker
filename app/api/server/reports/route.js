// api/server/reports
//
import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET(request) {
    const auth = await authorizeApi(["admin", "manager"]);

    if (auth.response) return auth.response;

    try {
        const { searchParams } = new URL(request.url);

        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // Default: seluruh transaksi jika tanggal tidak dipilih.
        const hasDateFilter = from && to;

        let dateCondition = "";
        const dateParams = [];

        if (hasDateFilter) {
            dateCondition = "WHERE DATE(sm.created_at) BETWEEN ? AND ?";
            dateParams.push(from, to);
        }

        const [[inventory]] = await pool.query(`
            SELECT
                COUNT(*) AS total_products,
                COALESCE(SUM(stock), 0) AS total_stock,
                SUM(
                    CASE
                        WHEN minimum_stock > 0 AND stock <= minimum_stock
                        THEN 1 ELSE 0
                    END
                ) AS low_stock
            FROM products
        `);

        const [[movement]] = await pool.query(
            `
            SELECT
                COUNT(*) AS total_transactions,
                COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE 0 END), 0) AS total_in,
                COALESCE(SUM(CASE WHEN sm.type = 'OUT' THEN sm.quantity ELSE 0 END), 0) AS total_out
            FROM stock_movements sm
            ${dateCondition}
            `,
            dateParams
        );

        const [daily] = await pool.query(
            `
            SELECT
                DATE(sm.created_at) AS date,
                SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE 0 END) AS total_in,
                SUM(CASE WHEN sm.type = 'OUT' THEN sm.quantity ELSE 0 END) AS total_out
            FROM stock_movements sm
            ${dateCondition}
            GROUP BY DATE(sm.created_at)
            ORDER BY date ASC
            `,
            dateParams
        );

        const [topProducts] = await pool.query(
            `
            SELECT
                p.id,
                p.sku,
                p.name,
                COALESCE(SUM(sm.quantity), 0) AS total_movement
            FROM stock_movements sm
            INNER JOIN products p ON p.id = sm.product_id
            ${dateCondition}
            GROUP BY p.id, p.sku, p.name
            ORDER BY total_movement DESC
            LIMIT 5
            `,
            dateParams
        );

        return NextResponse.json({
            stats: {
                totalProducts: Number(inventory.total_products),
                totalStock: Number(inventory.total_stock),
                lowStock: Number(inventory.low_stock),
                totalTransactions: Number(movement.total_transactions),
                totalIn: Number(movement.total_in),
                totalOut: Number(movement.total_out),
            },
            daily,
            topProducts,
        });
    } catch (error) {
        console.error("Reports GET Error:", error);

        return NextResponse.json(
            { message: "Failed to load reports." },
            { status: 500 }
        );
    }
}
