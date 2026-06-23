import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";

// Reads the session cookie, so this section is always rendered per-request.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Auth gate: only signed-in users reach the dashboard.
  // Role-level checks (checkUserPermission) belong on individual pages/actions.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0c] text-[#f5f3ef]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-[16px] font-semibold tracking-tight"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#e8b04b] text-black text-xs font-bold">
              W
            </span>
            Warden
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#8a8780]">{user?.name}</span>
            <span className="rounded-full border border-[#e8b04b]/30 bg-[#e8b04b]/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-[#e8b04b]">
              {user?.role}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
        {children}
      </main>
    </div>
  );
}
