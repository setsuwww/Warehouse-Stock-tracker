
import { NextResponse } from "next/server";
import pool from "@/_lib/db";
import { verifyToken } from "@/_lib/auth";

export async function GET(request) {
    try {
        const token = request.cookies.get("warehouse_session")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);

        if (!payload?.id) {
            return NextResponse.json(
                { message: "Session tidak valid." },
                { status: 401 }
            );
        }

        // Periksa kembali status akun dan role dari database.
        const result = await pool.query(
            `SELECT id, email, role, is_active
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [payload.id]
        );

        const user = result[0][0];

        if (!user || !user.is_active) {
            const response = NextResponse.json(
                { message: "Account is inactive or unavailable." },
                { status: 401 }
            );

            response.cookies.set("warehouse_session", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });

            return response;
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Session error:", error);

        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
