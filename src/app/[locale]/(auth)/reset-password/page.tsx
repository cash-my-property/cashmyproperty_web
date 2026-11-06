"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";

function ResetPasswordContent() {
  const { locale } = useDictionary();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const codeParam = searchParams.get("code") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(() => {
    const clean = codeParam.replace(/\D/g, "").slice(0, 6);
    const arr = new Array(6).fill("");
    for (let i = 0; i < clean.length; i++) arr[i] = clean[i];
    return arr;
  });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const val = element.value.replace(/\D/g, "");
    if (!val && element.value !== "") return;

    const nextOtp = [...otp];
    nextOtp[index] = val.slice(-1);
    setOtp(nextOtp);

    if (val && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setInfoMessage("");
    try {
      const res = await api.post(`${PUBLIC_API_PREFIX}/auth/forgot-password`, {
        email: email.trim(),
      });
      setResendCooldown(60);
      setInfoMessage(res.data?.message || "If this email has an account, we have sent a 6-digit code.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend reset code.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      setError("Password must be at least 6 characters and contain at least one uppercase letter and one special character (!@#$%^&*).");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(`${PUBLIC_API_PREFIX}/auth/reset-password`, {
        email: email.trim(),
        code,
        password: newPassword,
      });

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 1800);
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
        <div className="w-16 h-16 bg-[#1A3626]/10 dark:bg-[#c9a14b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#1A3626] dark:text-[#c9a14b]" />
        </div>
        <h1
          className="text-[32px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Set New Password
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Enter the 6-digit code sent to your email and choose a new password.
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
          <p>Password reset. Redirecting to login...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
              6-Digit Code *
            </label>
            {resendCooldown > 0 ? (
              <span className="text-[12px] text-gray-400">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="text-[12px] font-bold text-[#1A3626] dark:text-[#c9a14b] hover:underline cursor-pointer"
              >
                Send code again
              </button>
            )}
          </div>
          <div className="flex justify-between gap-2" dir="ltr">
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
                onChange={(e) => handleOtpChange(e.target, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                onPaste={handleOtpPaste}
                onFocus={(e) => e.target.select()}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-bold bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-xl focus:border-[#1A3626] dark:focus:border-[#c9a14b] outline-none transition-all text-gray-900 dark:text-white"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
            New Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 chars, 1 uppercase & 1 special (!@#$%^&*)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors ltr:pr-10 rtl:pl-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors ltr:pr-10 rtl:pl-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full py-4 bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 group mt-2 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Reset Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

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
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32 sm:pt-36 min-h-[80vh]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
