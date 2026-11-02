// /api/stats/admin

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET() {
    const auth = await authorizeApi(["admin"]);
    if (auth.response) return auth.response;

    try {
        const [
            [summaryRows],
            [movementRows],
            [distributionRows],
            [topProducts],
            [recentActivities],
            [lowStockProducts],
        ] = await Promise.all([
            // Summary
            pool.query(`
                SELECT
                    COUNT(*) AS total_products,
                    COALESCE(SUM(stock), 0) AS total_stock,
                    SUM(
                        CASE
                            WHEN stock > 0 AND minimum_stock > 0
                                AND stock <= minimum_stock THEN 1
                            ELSE 0
                        END
                    ) AS low_stock,
                    SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END)
                        AS out_of_stock
                FROM products
            `),

            // Stock movement: last 7 days
            pool.query(`
                SELECT
                    DATE(created_at) AS movement_date,
                    SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END)
                        AS stock_in,
                    SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END)
                        AS stock_out
                FROM stock_movements
                WHERE created_at >= CURDATE() - INTERVAL 6 DAY
                  AND created_at < CURDATE() + INTERVAL 1 DAY
                GROUP BY DATE(created_at)
                ORDER BY movement_date ASC
            `),

            // Inventory distribution
            pool.query(`
                SELECT
                    CASE
                        WHEN stock <= 0 THEN 'out_of_stock'
                        WHEN minimum_stock > 0
                            AND stock <= minimum_stock THEN 'low_stock'
                        ELSE 'in_stock'
                    END AS status,
                    COUNT(*) AS total
                FROM products
                GROUP BY status
            `),

            // Top 5 moving products in the last 30 days
            pool.query(`
                SELECT
                    p.id,
                    p.name,
                    p.sku,
                    SUM(sm.quantity) AS total_movement
                FROM stock_movements sm
                INNER JOIN products p ON p.id = sm.product_id
                WHERE sm.created_at >= CURDATE() - INTERVAL 29 DAY
                  AND sm.created_at < CURDATE() + INTERVAL 1 DAY
                GROUP BY p.id, p.name, p.sku
                ORDER BY total_movement DESC
                LIMIT 5
            `),

            // Recent activities
            pool.query(`
                SELECT
                    sm.id,
                    sm.reference_code,
                    sm.type,
                    sm.quantity,
                    sm.notes,
                    sm.created_at,
                    p.name AS product_name,
                    p.sku,
                    u.email AS user_email
                FROM stock_movements sm
                INNER JOIN products p ON p.id = sm.product_id
                INNER JOIN users u ON u.id = sm.user_id
                ORDER BY sm.created_at DESC
                LIMIT 6
            `),

            // Low stock alerts
            pool.query(`
                SELECT
                    id,
                    name,
                    sku,
                    stock,
                    minimum_stock,
                    unit
                FROM products
                WHERE stock <= 0
                   OR (minimum_stock > 0 AND stock <= minimum_stock)
                ORDER BY
                    CASE WHEN stock <= 0 THEN 0 ELSE 1 END,
                    stock ASC
                LIMIT 6
            `),
        ]);

        const summary = summaryRows[0];

        // Stock In / Out today
        const [[todayMovement]] = await pool.query(`
            SELECT
                COALESCE(
                    SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0
                ) AS stock_in_today,
                COALESCE(
                    SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END), 0
                ) AS stock_out_today
            FROM stock_movements
            WHERE DATE(created_at) = CURDATE()
        `);

        const [userRows] = await pool.query(`
            SELECT COUNT(*) AS total_users
            FROM users
            WHERE is_active = 1
        `);

        return NextResponse.json({
            stats: {
                totalProducts: Number(summary.total_products || 0),
                totalStock: Number(summary.total_stock || 0),
                lowStock: Number(summary.low_stock || 0),
                outOfStock: Number(summary.out_of_stock || 0),
                stockInToday: Number(todayMovement.stock_in_today || 0),
                stockOutToday: Number(todayMovement.stock_out_today || 0),
                totalUsers: Number(userRows[0].total_users || 0),
            },

            movement: movementRows.map((row) => ({
                date: row.movement_date,
                stockIn: Number(row.stock_in || 0),
                stockOut: Number(row.stock_out || 0),
            })),

            distribution: distributionRows.map((row) => ({
                status: row.status,
                total: Number(row.total || 0),
            })),

            topProducts: topProducts.map((row) => ({
                ...row,
                total_movement: Number(row.total_movement || 0),
            })),

            recentActivities: recentActivities.map((row) => ({
                ...row,
                quantity: Number(row.quantity),
            })),

            lowStockProducts: lowStockProducts.map((row) => ({
                ...row,
                stock: Number(row.stock),
                minimum_stock: Number(row.minimum_stock),
            })),
        });
    } catch (error) {
        console.error("Admin stats error:", error);

        return NextResponse.json(
            { message: "Failed to load dashboard statistics." },
            { status: 500 }
        );
    }
}
