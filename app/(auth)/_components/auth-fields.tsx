"use client";

/**
 * Shared building blocks for the login and register forms.
 *
 * These are presentation-only client components that match the dark Warden
 * theme used across the auth screens. Each form owns its own state and submit
 * logic; this module just keeps the markup consistent between the two.
 */

import type { ComponentProps, ReactNode } from "react";

/** A labelled text input. Forwards every native `<input>` prop. */
export function Field({
  label,
  id,
  ...props
}: { label: string; id: string } & ComponentProps<"input">) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#cfccc4]">
        {label}
      </span>
      <input
        id={id}
        className="w-full rounded-lg border border-white/10 bg-[#0f0e0c] px-3.5 py-2.5 text-sm text-[#f5f3ef] outline-none transition-colors placeholder:text-[#6f6c66] focus:border-[#e8b04b]/60 focus:ring-2 focus:ring-[#e8b04b]/20 disabled:opacity-60"
        {...props}
      />
    </label>
  );
}

/** Inline error banner shown above the submit button. */
export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
    >
      {children}
    </p>
  );
}

/** Full-width primary submit button with a built-in pending state. */
export function SubmitButton({
  pending,
  children,
  ...props
}: { pending?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e8b04b] px-4 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      {...props}
    >
      {pending && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black"
        />
      )}
      {children}
    </button>
  );
}
