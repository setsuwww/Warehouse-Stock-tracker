// api/server/stock-history

import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

export async function GET(request) {
    const auth = await authorizeApi(["admin", "staff", "manager"]);

    if (auth.response) return auth.response;

    try {
        const { searchParams } = new URL(request.url);

        const type = searchParams.get("type");
        const search = searchParams.get("search")?.trim() || "";

        const conditions = [];
        const values = [];

        if (type === "IN" || type === "OUT") {
            conditions.push("sm.type = ?");
            values.push(type);
        }

        if (search) {
            conditions.push(`(
                sm.reference_code LIKE ?
                OR p.name LIKE ?
                OR p.sku LIKE ?
                OR u.email LIKE ?
            )`);

            const keyword = `%${search}%`;

            values.push(keyword, keyword, keyword, keyword);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [items] = await pool.execute(
            `SELECT
                sm.id,
                sm.reference_code,
                sm.type,
                sm.quantity,
                sm.notes,
                sm.created_at,
                p.name AS product_name,
                p.sku,
                p.unit,
                u.email AS user_email
            FROM stock_movements sm
            INNER JOIN products p ON sm.product_id = p.id
            LEFT JOIN users u ON sm.user_id = u.id
            ${whereClause}
            ORDER BY sm.created_at DESC, sm.id DESC
            LIMIT 500`,
            values
        );

        return NextResponse.json({ items });
    } catch (error) {
        console.error("GET stock history:", error);

        return NextResponse.json(
            { message: "Failed to load stock history." },
            { status: 500 }
        );
    }
}
