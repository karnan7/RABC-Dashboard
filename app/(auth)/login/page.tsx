import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-[#8a8780]">
        Log in to your Warden workspace.
      </p>

      {/* TODO: wire to login() in app/lib/api/auth.ts */}
      <div className="mt-6 rounded-lg border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[#6f6c66]">
        Login form coming soon.
      </div>

      <p className="mt-6 text-center text-sm text-[#8a8780]">
        No account?{" "}
        <Link href="/register" className="text-[#e8b04b] hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
