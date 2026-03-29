"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ onNewEntry, isSaving }) {
  const pathname = usePathname(); // Yeh check karne ke liye ki hum kaunse page par hain

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="text-xl font-bold tracking-tight">New Project</span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 text-sm font-medium">
          <Link 
            href="/" 
            className={`${pathname === "/" ? "text-blue-600" : "text-gray-500 hover:text-gray-800"} transition`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`${pathname === "/about" ? "text-blue-600" : "text-gray-500 hover:text-gray-800"} transition`}
          >
            About
          </Link>
        </div>
      </div>

      {/* Button - Sirf tab dikhayein jab hum Home page par hon */}
      {pathname === "/" && (
        <button
          onClick={onNewEntry}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          + New Entry
        </button>
      )}
    </nav>
  );
}