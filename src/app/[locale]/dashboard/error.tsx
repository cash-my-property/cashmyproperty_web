"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Something went wrong!
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        An error occurred while loading this section of your dashboard. This might be due to a temporary network issue.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#0A3622] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md cursor-pointer"
      >
        <RefreshCw className="w-4 h-4 animate-spin-hover" /> Try Again
      </button>
    </div>
  );
}
