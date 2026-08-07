"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Mail } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const { dict, locale } = useDictionary();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/forgot-password", { email });
      if (response.data) {
        // Redirect to OTP verification with type=reset
        router.push(`/${locale}/verify-otp?email=${encodeURIComponent(email)}&type=reset`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32 sm:pt-36 min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A3626]/10 dark:bg-[#5CD284]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#1A3626] dark:text-[#5CD284]" />
          </div>
          <h1 className="text-[32px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Forgot Password
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Enter the email address associated with your account and we'll send you an OTP to reset your password.
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
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#1A3626] dark:bg-[#5CD284] hover:bg-[#12261a] dark:hover:bg-[#4ab872] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send OTP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="text-center pt-2">
            <Link href={`/${locale}/login`} className="text-[14px] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
              Back to Login
            </Link>
          </div>
        </form>

      </div>
    </main>
  );
}
