// /api/server/users/{id}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/_lib/db";
import { authorizeApi } from "@/_lib/api-auth";

const validRoles = ["admin", "staff", "manager"];

export async function PUT(request, { params }) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId) || userId < 1) {
            return NextResponse.json(
                { message: "Invalid user ID." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const email = body.email?.trim().toLowerCase();
        const role = body.role;
        const password = body.password;
        const isActive = body.is_active;

        if (!email || !role || !validRoles.includes(role)) {
            return NextResponse.json(
                { message: "Valid email and role are required." },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format." },
                { status: 400 }
            );
        }

        if (password && password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        const [users] = await pool.query(
            "SELECT id FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        if (!users.length) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 }
            );
        }

        const isSelf = Number(auth.user.id) === userId;

        if (isSelf && role !== "admin") {
            return NextResponse.json(
                { message: "You cannot change your own admin role." },
                { status: 403 }
            );
        }

        if (isSelf && isActive === false) {
            return NextResponse.json(
                { message: "You cannot deactivate your own account." },
                { status: 403 }
            );
        }

        const [duplicate] = await pool.query(
            "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
            [email, userId]
        );

        if (duplicate.length) {
            return NextResponse.json(
                { message: "Email is already used by another account." },
                { status: 409 }
            );
        }

        const activeValue =
            typeof isActive === "boolean" ? Number(isActive) : null;

        if (password) {
            const passwordHash = await bcrypt.hash(password, 12);

            await pool.query(
                `
                UPDATE users
                SET email = ?, role = ?, password_hash = ?,
                    is_active = COALESCE(?, is_active)
                WHERE id = ?
                `,
                [email, role, passwordHash, activeValue, userId]
            );
        } else {
            await pool.query(
                `
                UPDATE users
                SET email = ?, role = ?,
                    is_active = COALESCE(?, is_active)
                WHERE id = ?
                `,
                [email, role, activeValue, userId]
            );
        }

        return NextResponse.json({
            message: "User updated successfully.",
        });
    } catch (error) {
        console.error("Users PUT Error:", error);

        return NextResponse.json(
            { message: "Failed to update user." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const auth = await authorizeApi(["admin"]);

    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId) || userId < 1) {
            return NextResponse.json(
                { message: "Invalid user ID." },
                { status: 400 }
            );
        }

        if (Number(auth.user.id) === userId) {
            return NextResponse.json(
                { message: "You cannot deactivate your own account." },
                { status: 403 }
            );
        }

        const [result] = await pool.query(
            "UPDATE users SET is_active = 0 WHERE id = ? AND is_active = 1",
            [userId]
        );

        if (!result.affectedRows) {
            return NextResponse.json(
                { message: "User not found or already inactive." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "User deactivated successfully.",
        });
    } catch (error) {
        console.error("Users DELETE Error:", error);

        return NextResponse.json(
            { message: "Failed to deactivate user." },
            { status: 500 }
        );
    }
}
