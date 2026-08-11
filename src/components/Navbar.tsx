"use client";

import Link from "next/link";
import { useState } from "react";
import { UserMenu, useSignOut } from "@parkerburgess/wandering-parker-ui";

export function Navbar({ userId, userName }: { userId: string; userName: string }) {
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
            <NavLinks userId={userId} userName={userName} />
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            <NavLinks userId={userId} userName={userName} mobile onNavigate={() => setMenuOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLinks({
  userId,
  userName,
  mobile,
  onNavigate,
}: {
  userId: string;
  userName: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const signOut = useSignOut();
  const linkClass = mobile
    ? "block py-2 text-gray-600 hover:text-blue-600"
    : "text-gray-600 hover:text-blue-600 transition-colors";

  return (
    <>
      <Link href="/" className={linkClass} onClick={onNavigate}>Dashboard</Link>
      <Link href="/outings" className={linkClass} onClick={onNavigate}>Outings</Link>
      <Link href="/outings/new" className={linkClass} onClick={onNavigate}>New Outing</Link>
      <Link href="/reports" className={linkClass} onClick={onNavigate}>Reports</Link>
      {mobile ? (
        <>
          <Link href={`/users/${userId}`} className={linkClass} onClick={onNavigate}>
            My Profile
          </Link>
          <button
            onClick={() => { onNavigate?.(); signOut(); }}
            className={`${linkClass} cursor-pointer text-left`}
          >
            Logout
          </button>
        </>
      ) : (
        <UserMenu
          userName={userName}
          extraItems={[{ label: "My Profile", href: `/users/${userId}` }]}
        />
      )}
    </>
  );
}
