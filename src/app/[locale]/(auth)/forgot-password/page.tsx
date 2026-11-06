"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Mail } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { locale } = useDictionary();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post(`${PUBLIC_API_PREFIX}/auth/forgot-password`, {
        email: email.trim(),
      });
      if (response.data) {
        router.push(`/${locale}/reset-password?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32 sm:pt-36 min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-[#102418] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A3626]/10 dark:bg-[#c9a14b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#1A3626] dark:text-[#c9a14b]" />
          </div>
          <h1
            className="text-[32px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Forgot Password
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Enter your buyer account email address and we&apos;ll send you a 6-digit code to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send 6-Digit Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-[12px] text-center text-gray-400 dark:text-gray-500">
            CMP Connect agents reset their password in the CMP Connect portal.
          </p>

          <div className="text-center pt-2">
            <Link
              href={`/${locale}/login`}
              className="text-[14px] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
