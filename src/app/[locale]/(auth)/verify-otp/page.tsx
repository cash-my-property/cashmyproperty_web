"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";

function VerifyOtpContent() {
  const { dict, locale } = useDictionary();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const typeParam = searchParams.get("type") === "reset" ? "PASSWORD_RESET" : "EMAIL_VERIFY";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  // OTP Inputs state (6 digits usually)
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Basic countdown timer for Resend OTP
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    
    try {
      await api.post("/resend-otp", {
        email: emailParam,
        type: typeParam
      });
      setResendCooldown(60);
      setSuccess(false); // Reset success state if showing
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/verify-otp", {
        email: emailParam,
        enteredOtp,
        type: typeParam
      });

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          if (typeParam === "PASSWORD_RESET") {
            // Check if backend returned a token for reset
            const resetToken = response.data.resetToken || response.data.data?.resetToken || "dummy_token"; 
            router.push(`/${locale}/reset-password?token=${resetToken}`);
          } else {
            router.push(`/${locale}/login`);
          }
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>Verify Email</h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
          We've sent a 6-digit verification code to <br />
          <strong className="text-gray-900 dark:text-gray-200 mt-1 block">{emailParam}</strong>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
          <span className="mt-0.5">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
          <span className="mt-0.5">✅</span>
          <p>Email verified successfully! Redirecting to login...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2 sm:gap-3" dir="ltr">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 outline-none transition-all text-gray-900 dark:text-white"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full py-4 bg-[#1A3626] dark:bg-[#5CD284] hover:bg-[#12261a] dark:hover:bg-[#4ab872] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-[14px] text-gray-500 dark:text-gray-400">
            Didn't receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-gray-400 dark:text-gray-500 font-medium ml-1">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-[#1A3626] dark:text-[#5CD284] hover:underline ml-1 focus:outline-none"
              >
                Resend Now
              </button>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32 sm:pt-36 min-h-[80vh]">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
        </div>
      }>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}
