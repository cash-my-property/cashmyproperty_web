import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#091711]">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-[#1A3626]/20 dark:border-[#c9a14b]/20 border-t-[#1A3626] dark:border-t-[#5CD284] animate-spin"></div>
        {/* Inner static icon */}
        <div className="w-12 h-12 bg-[#1A3626] dark:bg-[#c9a14b] rounded-xl flex items-center justify-center rotate-45 shadow-lg shadow-[#5CD284]/20 animate-pulse">
          <div className="-rotate-45 font-bold text-white dark:text-[#1A3626] text-xl">C</div>
        </div>
      </div>
      <h2 className="mt-8 text-sm font-bold text-[#1A3626] dark:text-[#c9a14b] tracking-[0.3em] uppercase animate-pulse">Loading</h2>
    </div>
  );
}
