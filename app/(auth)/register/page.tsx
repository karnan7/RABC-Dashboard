import Link from "next/link";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your workspace
      </h1>
      <p className="mt-2 text-sm text-[#8a8780]">
        Set up a team and start assigning roles.
      </p>

      {/* TODO: wire to register() in app/lib/api/auth.ts */}
      <div className="mt-6 rounded-lg border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[#6f6c66]">
        Registration form coming soon.
      </div>

      <p className="mt-6 text-center text-sm text-[#8a8780]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#e8b04b] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
