"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function SignupPage() {
  const { dict, locale } = useDictionary();
  const content = dict;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Buyer Signup Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setError("Password must be at least 6 characters and contain at least one uppercase letter and one special character (!@#$%^&*).");
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, any> = {
        fullName: trimmedName,
        email: email.trim(),
        password,
      };
      if (mobile.trim()) {
        payload.mobile = mobile.trim();
      }

      const response = await api.post(`${PUBLIC_API_PREFIX}/auth/signup`, payload);

      if (response.data) {
        const verifiedEmail = response.data?.data?.email || email.trim();
        router.push(`/${locale}/verify-otp?email=${encodeURIComponent(verifiedEmail)}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 pt-32 sm:pt-36 transition-colors">
      <div className="w-full max-w-[1000px] bg-white dark:bg-[#102418] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[600px] transition-colors">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[45%] relative bg-[#1B3A2D] overflow-hidden flex-col items-center justify-center p-12 text-center">
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'url("/hero-bg.svg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[#5CD284] font-bold tracking-[0.15em] text-xs mb-8 uppercase">{content.auth.hero.tagline}</p>
            <h2
              className="text-white text-[42px] font-bold mb-6 leading-[1.1]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
              dangerouslySetInnerHTML={{ __html: content.auth.hero.title.replace('\n', '<br/>') }}
            />
            <p className="text-white/70 text-[15px] max-w-[280px] leading-relaxed">
              {content.auth.hero.description}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - BUYER SIGNUP FORM */}
        <div className="w-full lg:w-[55%] p-8 sm:p-14 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h1
              className="text-[32px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {content.auth.signup.heading}
            </h1>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              Create your buyer account to save properties and contact verified agents.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Hala Mansour"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                required
              />
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.auth.signup.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder={content.auth.signup.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.auth.signup.phoneLabel}{" "}
                  <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+971501234567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {content.auth.signup.passwordLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 chars, 1 uppercase & 1 special (!@#$%^&*)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors ltr:pr-12 rtl:pl-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                At least 6 characters, one uppercase letter, and one special character (!@#$%^&*).
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-lg font-semibold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {content.auth.signup.submitButton}
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gray-100 dark:bg-[#1A3626]" />
              <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
                {content.auth.signup.dividerText || "or"}
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-[#1A3626]" />
            </div>

            <GoogleSignInButton
              locale={locale}
              label="Continue with Google"
              onError={(msg) => {
                if (msg) setError(msg);
              }}
            />

            <p className="text-center text-[14px] text-gray-500 dark:text-gray-400 mt-6">
              {content.auth.signup.loginPrompt}{" "}
              <Link href={`/${locale}/login`} className="font-bold text-gray-900 dark:text-white hover:underline">
                {content.auth.signup.loginLinkText}
              </Link>
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#102418]/50 border border-gray-100 dark:border-[#1A3626]/50">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-700 dark:text-green-500" />
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Are you a <strong className="text-gray-800 dark:text-gray-200">CMP Connect Agent</strong>? You don&apos;t need to sign up here —{" "}
                  <Link href={`/${locale}/login`} className="text-[#1A3626] dark:text-[#5CD284] font-semibold hover:underline">
                    log in with your CMP Connect password
                  </Link>.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
