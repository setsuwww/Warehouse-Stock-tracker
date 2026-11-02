
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import pool from "@/_lib/db";
import { verifyToken } from "@/_lib/auth";

export async function requireRole(requiredRole) {
    const cookieStore = await cookies();
    const token = cookieStore.get("warehouse_session")?.value;

    if (!token) {
        redirect("/login");
    }

    const payload = await verifyToken(token);

    if (!payload?.id) {
        redirect("/login");
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
        redirect("/login");
    }

    if (user.role !== requiredRole) {
        redirect(`/dashboard/${user.role}`);
    }

    return user;
}
