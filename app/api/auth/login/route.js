
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/_lib/db";
import { createToken } from "@/_lib/auth";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email dan password wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `SELECT id, email, password_hash, role, is_active
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email.trim().toLowerCase()]
        );

        const user = result[0][0];

        if (!user || !user.is_active) {
            return NextResponse.json(
                { message: "Email atau password tidak valid." },
                { status: 401 }
            );
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return NextResponse.json(
                { message: "Email atau password tidak valid." },
                { status: 401 }
            );
        }

        const token = await createToken(user);

        const response = NextResponse.json({
            message: "Login berhasil.",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });

        response.cookies.set("warehouse_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
