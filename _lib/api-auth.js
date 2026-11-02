
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import pool from "@/_lib/db";
import { verifyToken } from "@/_lib/auth";

export async function authorizeApi(allowedRoles = []) {
    const cookieStore = await cookies();
    const token = cookieStore.get("warehouse_session")?.value;

    if (!token) {
        return {
            response: NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            ),
        };
    }

    const payload = await verifyToken(token);

    if (!payload?.id) {
        return {
            response: NextResponse.json(
                { message: "Invalid session." },
                { status: 401 }
            ),
        };
    }

    const [rows] = await pool.execute(
        `SELECT id, email, role, is_active
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [payload.id]
    );

    const user = rows[0];

    if (!user || !user.is_active) {
        return {
            response: NextResponse.json(
                { message: "Account is inactive." },
                { status: 401 }
            ),
        };
    }

    if (!allowedRoles.includes(user.role)) {
        return {
            response: NextResponse.json(
                { message: "Forbidden." },
                { status: 403 }
            ),
        };
    }

    return { user };
}
