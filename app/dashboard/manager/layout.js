export const instant = false;

import { requireRole } from "@/_lib/require-role";
import DashboardShell from "../_components/common/dashboard-shell";

export default async function ManagerLayout({ children }) {
    await requireRole("manager");

    return (
        <DashboardShell role="manager">
            {children}
        </DashboardShell>
    );
}
