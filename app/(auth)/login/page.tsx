"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/app/lib/api/auth";
import { ApiError } from "@/app/lib/api-client";
import { Field, FormError, SubmitButton } from "../_components/auth-fields";

interface FormState {
  error: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      try {
        await login(email, password);
      } catch (err) {
        return {
          error:
            err instanceof ApiError
              ? err.message
              : "Something went wrong. Please try again.",
        };
      }

      // Success: the server set the httpOnly session cookie on the response.
      // Navigate to the dashboard and refresh so the server layout re-reads it.
      // Done outside the try so a redirect is never treated as a failure.
      router.replace("/dashboard");
      router.refresh();
      return { error: "" };
    },
    { error: "" },
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-[#8a8780]">
        Log in to your Warden workspace.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field
          label="Email"
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          disabled={pending}
        />
        <Field
          label="Password"
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          disabled={pending}
        />

        <FormError>{state.error}</FormError>

        <SubmitButton pending={pending}>
          {pending ? "Logging in…" : "Log in"}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-[#8a8780]">
        No account?{" "}
        <Link href="/register" className="text-[#e8b04b] hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
