"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";
import { getSafeNextPath } from "@/lib/authHint";

function VerifyOtpContent() {
  const { locale } = useDictionary();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const isResetFlow = searchParams.get("type") === "reset";

  const [email, setEmail] = useState(emailParam);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  // 6-digit OTP inputs
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // If navigated with type=reset, forward to reset-password page (which accepts email + 6-digit code + new password)
  useEffect(() => {
    if (isResetFlow) {
      router.replace(`/${locale}/reset-password${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ""}`);
    }
  }, [isResetFlow, emailParam, locale, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value.replace(/\D/g, "");
    if (!val && element.value !== "") return;

    const nextOtp = [...otp];
    nextOtp[index] = val.slice(-1);
    setOtp(nextOtp);

    if (val && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const nextOtp = new Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      nextOtp[i] = pasted[i];
    }
    setOtp(nextOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
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
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setInfoMessage("");

    try {
      const res = await api.post(`${PUBLIC_API_PREFIX}/auth/resend-verification`, {
        email: email.trim(),
      });
      setResendCooldown(60);
      setSuccess(false);
      setInfoMessage(res.data?.message || "If the email needs verifying, we have sent a new code.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend verification code.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (enteredCode.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const response = await api.post(`${PUBLIC_API_PREFIX}/auth/verify-email`, {
        email: email.trim(),
        code: enteredCode,
      });

      const data = response.data?.data || response.data;
      if (data) {
        setSuccess(true);
        if (data.account) {
          login(data.account);
        }
        setTimeout(() => {
          router.push(getSafeNextPath(locale));
        }, 800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "This code is not correct or has expired. Ask for a new one.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#102418] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="text-center mb-8">
        <h1
          className="text-[32px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Verify Email
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
          We&apos;ve sent a 6-digit verification code to <br />
          {emailParam ? (
            <strong className="text-gray-900 dark:text-gray-200 mt-1 block">{emailParam}</strong>
          ) : (
            <span>your email address</span>
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
          <span className="mt-0.5">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {infoMessage && !error && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
          <span className="mt-0.5">✉️</span>
          <p>{infoMessage}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
          <span className="mt-0.5">✅</span>
          <p>Email verified! You are now logged in...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {!emailParam && (
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
              required
            />
          </div>
        )}

        <div className="flex justify-between gap-2 sm:gap-3" dir="ltr">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl focus:border-[#1A3626] dark:focus:border-[#c9a14b] focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 outline-none transition-all text-gray-900 dark:text-white"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full py-4 bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify & Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center space-y-3">
          <p className="text-[14px] text-gray-500 dark:text-gray-400">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-gray-400 dark:text-gray-500 font-medium ml-1">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-[#1A3626] dark:text-[#c9a14b] hover:underline ml-1 focus:outline-none cursor-pointer"
              >
                Send again
              </button>
            )}
          </p>
          <div>
            <Link
              href={`/${locale}/login`}
              className="text-[13px] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32 sm:pt-36 min-h-[80vh]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
          </div>
        }
      >
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}
