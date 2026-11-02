export const instant = false;

import { requireRole } from "@/_lib/require-role";
import DashboardShell from "../_components/common/dashboard-shell";

export default async function AdminLayout({ children }) {
    await requireRole("admin");

    return (
        <DashboardShell role="admin">
            {children}
        </DashboardShell>
    );
}
