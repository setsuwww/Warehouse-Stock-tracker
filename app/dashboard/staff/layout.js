export const instant = false;

import { requireRole } from "@/_lib/require-role";
import DashboardShell from "../_components/common/dashboard-shell";

export default async function StaffLayout({ children }) {
    await requireRole("staff");

    return (
        <DashboardShell role="staff">
            {children}
        </DashboardShell>
    );
}
