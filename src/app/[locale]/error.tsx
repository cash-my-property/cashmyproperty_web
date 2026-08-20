"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] dark:bg-[#091711] p-6 text-center transition-colors">
      <div className="bg-white dark:bg-[#102418] border border-gray-100 dark:border-[#1A3626] rounded-3xl p-10 max-w-md w-full shadow-xl">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Unexpected Error
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          An unexpected error occurred while loading this page. Please try refreshing the page or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reload Page
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#163321]/30 transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
