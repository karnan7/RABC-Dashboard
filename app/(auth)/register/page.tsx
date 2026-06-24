"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { register } from "@/app/lib/api/auth";
import { ApiError } from "@/app/lib/api-client";
import { Field, FormError, SubmitButton } from "../_components/auth-fields";

interface FormState {
  error: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const name = String(formData.get("name") ?? "");
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const teamCode = String(formData.get("teamCode") ?? "").trim();

      try {
        await register({
          name,
          email,
          password,
          // Optional — omit entirely when left blank so no team is joined.
          ...(teamCode ? { teamCode } : {}),
        });
      } catch (err) {
        return {
          error:
            err instanceof ApiError
              ? err.message
              : "Something went wrong. Please try again.",
        };
      }

      // Success: registration sets the httpOnly session cookie on the response.
      // Navigate outside the try so a redirect is never treated as a failure.
      router.replace("/dashboard");
      router.refresh();
      return { error: "" };
    },
    { error: "" },
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your workspace
      </h1>
      <p className="mt-2 text-sm text-[#8a8780]">
        Set up a team and start assigning roles.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field
          label="Name"
          id="name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          required
          disabled={pending}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
          disabled={pending}
        />
        <Field
          label="Team code (optional)"
          id="teamCode"
          type="text"
          name="teamCode"
          placeholder="Join an existing team"
          disabled={pending}
        />

        <FormError>{state.error}</FormError>

        <SubmitButton pending={pending}>
          {pending ? "Creating…" : "Create workspace"}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-[#8a8780]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#e8b04b] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
