"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";

function ResetPasswordContent() {
  const { dict, locale } = useDictionary();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    // Basic pattern check frontend-side before hitting backend
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setError("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/reset-password", { 
        resetToken: token,
        newPassword
      });
      
      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. The token may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#102418] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1A3626]/10 dark:bg-[#915331]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#1A3626] dark:text-[#915331]" />
        </div>
        <h1 className="text-[32px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Set New Password
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Please enter your new password below to reset your account access.
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
          <p>Password reset successful! Redirecting to login...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#915331] transition-colors pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#915331] transition-colors pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full py-4 bg-[#1A3626] dark:bg-[#915331] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 group mt-2 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Reset Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 pt-32 sm:pt-36 min-h-[80vh]">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#915331]" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
