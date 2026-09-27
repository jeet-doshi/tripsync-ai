import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/join" className="btn-ghost btn-sm">
            Join a trip
          </Link>
          <Link href="/create" className="btn-primary btn-sm">
            Create a trip
          </Link>
        </nav>
      </div>
    </header>
  );
}
