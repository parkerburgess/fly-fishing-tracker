"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            FlyFish Tracker
          </Link>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <NavLinks session={session} />
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            <NavLinks session={session} mobile onNavigate={() => setMenuOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
}

function UserMenu({ session, onNavigate }: {
  session: NonNullable<ReturnType<typeof useSession>["data"]>;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
      >
        {session.user?.name}
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          <Link
            href={`/users/${session.user?.id}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => { setOpen(false); onNavigate?.(); }}
          >
            My Profile
          </Link>
          <button
            onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); onNavigate?.(); }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function NavLinks({
  session,
  mobile,
  onNavigate,
}: {
  session: ReturnType<typeof useSession>["data"];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const linkClass = mobile
    ? "block py-2 text-gray-600 hover:text-blue-600"
    : "text-gray-600 hover:text-blue-600 transition-colors";

  return (
    <>
      <Link href="/" className={linkClass} onClick={onNavigate}>Dashboard</Link>
      <Link href="/outings" className={linkClass} onClick={onNavigate}>Outings</Link>
      {session && (
        <Link href="/outings/new" className={linkClass} onClick={onNavigate}>New Outing</Link>
      )}
      <Link href="/reports" className={linkClass} onClick={onNavigate}>Reports</Link>
      {session ? (
        mobile ? (
          <>
            <Link href={`/users/${session.user?.id}`} className={linkClass} onClick={onNavigate}>
              My Profile
            </Link>
            <button
              onClick={() => { signOut({ callbackUrl: "/" }); onNavigate?.(); }}
              className={`${linkClass} cursor-pointer text-left`}
            >
              Logout
            </button>
          </>
        ) : (
          <UserMenu session={session} onNavigate={onNavigate} />
        )
      ) : (
        <Link href="/login" className={linkClass} onClick={onNavigate}>Login</Link>
      )}
    </>
  );
}
