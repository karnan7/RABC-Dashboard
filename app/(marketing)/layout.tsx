import Link from "next/link";
import { Instrument_Serif } from "next/font/google";

const displaySerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${displaySerif.variable} relative flex min-h-screen flex-col overflow-hidden bg-[#0b0b0c] text-[#f5f3ef] selection:bg-[#e8b04b] selection:text-black`}
    >
      {/* Atmosphere: faint grid + warm key-light glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(120% 80% at 70% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 70% 0%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-168 w-2xl rounded-full bg-[#e8b04b] opacity-[0.10] blur-[140px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#e8b04b] text-black shadow-[0_0_0_1px_rgba(232,176,75,0.4),0_8px_24px_-6px_rgba(232,176,75,0.5)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3Z"
                fill="currentColor"
                opacity="0.18"
              />
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
          <span className="text-[17px] font-semibold tracking-tight">
            Warden
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm text-[#bdb9b0] transition-colors hover:text-[#f5f3ef]"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#f5f3ef] px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-[#8a8780] sm:flex-row sm:items-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            Warden · Role-based access control
          </p>
          <p>© {new Date().getFullYear()} Warden. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
