import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0b0c] px-6 text-[#f5f3ef]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-144 w-xl -translate-x-1/2 rounded-full bg-[#e8b04b] opacity-[0.08] blur-[140px]"
      />

      <Link
        href="/"
        className="relative z-10 mb-8 flex items-center gap-2.5 text-[17px] font-semibold tracking-tight"
      >
        <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#e8b04b] text-black">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="m9 12 2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Warden
      </Link>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#141416]/80 p-8 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
