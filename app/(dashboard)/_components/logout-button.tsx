"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/app/lib/api/auth";

/**
 * Clears the session and returns to the login screen.
 *
 * `logout()` clears the httpOnly cookie server-side; `router.refresh()` then
 * forces the server layout to re-evaluate auth (it will redirect to /login on
 * its own, but we push there directly so it's instant).
 */
export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } finally {
        // Even if the request fails, send the user to login; the cookie is
        // short-lived and the dashboard re-checks auth on every request.
        router.replace("/login");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-[#8a8780] transition-colors hover:border-white/35 hover:text-[#f5f3ef] disabled:opacity-60"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
