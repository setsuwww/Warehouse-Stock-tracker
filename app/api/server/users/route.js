// /api/server/users

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

const validRoles = ["admin", "staff", "manager"];

export async function GET(request) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";

        const [users] = await pool.query(
            `
            SELECT
                id,
                email,
                role,
                is_active,
                created_at,
                updated_at
            FROM users
            WHERE email LIKE ?
            ORDER BY created_at DESC
            `,
            [`%${search}%`]
        );

        return NextResponse.json({ items: users });
    } catch (error) {
        console.error("Users GET Error:", error);

        return NextResponse.json(
            { message: "Failed to load users." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const body = await request.json();

        const email = body.email?.trim().toLowerCase();
        const password = body.password;
        const role = body.role;

        if (!email || !password || !role) {
            return NextResponse.json(
                { message: "Email, password, and role are required." },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { message: "Invalid user role." },
                { status: 400 }
            );
        }

        const [existing] = await pool.query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existing.length) {
            return NextResponse.json(
                { message: "Email is already registered." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await pool.query(
            `
            INSERT INTO users (email, password_hash, role, is_active)
            VALUES (?, ?, ?, 1)
            `,
            [email, passwordHash, role]
        );

        return NextResponse.json(
            {
                message: "User created successfully.",
                user: {
                    id: result.insertId,
                    email,
                    role,
                    is_active: 1,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Users POST Error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { message: "Email is already registered." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Failed to create user." },
            { status: 500 }
        );
    }
}
