"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { dict, locale } = useDictionary();
  const content = dict;
  const router = useRouter();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { 
        email, 
        password,
        deviceInfo: {
          deviceId: "DEVICE_ID_1234",
          uniqueId: "UNIQUE_ID_456",
          model: "iPhone 15 Pro",
          platform: "ios",
          systemVersion: "17.4",
          appVersion: "1.0.0",
          fcmToken: "FCM_TOKEN_ABC_XYZ",
          ipAddress: "192.168.1.1"
        }
      });
      
      // Backend returns data with message and user info in response.data.user
      // Token is set in HttpOnly cookies
      if (response.data && response.data.user) {
        login("dummy-token-because-httponly", response.data.user);
        router.push(`/${locale}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      if (err.response?.data?.status === "verification_pending") {
        router.push(`/${locale}/verify-otp?email=${encodeURIComponent(err.response.data.email || email)}&type=verify`);
        return;
      }
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 pt-32 sm:pt-36 transition-colors">
      <div className="w-full max-w-[1000px] bg-white dark:bg-[#102418] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[640px] transition-colors">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[45%] relative bg-[#1B3A2D] overflow-hidden flex-col items-center justify-center p-12 text-center">
          {/* Background Image / Overlay */}
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Circular Graphic Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-[320px] h-[320px] border border-white/10 rounded-full flex items-center justify-center">
                <div className="w-[280px] h-[280px] border border-white/10 rounded-full relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                     <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                   </div>
                   <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                     <span className="w-2 h-[2px] bg-white"></span>
                     <span className="w-2 h-[2px] bg-white absolute rotate-90"></span>
                   </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[#5CD284] font-bold tracking-[0.15em] text-xs mb-8 uppercase">{content.auth.hero.tagline}</p>
            <h2 className="text-white text-[42px] font-bold mb-6 leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }} dangerouslySetInnerHTML={{ __html: content.auth.hero.title.replace('\n', '<br/>') }}>
            </h2>
            <p className="text-white/70 text-[15px] max-w-[280px] leading-relaxed">
              {content.auth.hero.description}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className="w-full lg:w-[55%] p-8 sm:p-14 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {content.auth.login.heading}
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400">
              {content.auth.login.subheading}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {content.auth.login.emailLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder={content.auth.login.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#915331] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                  {content.auth.login.passwordLabel} <span className="text-red-500">*</span>
                </label>
                <Link href="/forgot-password" className="text-[13px] font-semibold text-[#1A3626] dark:text-[#915331] hover:underline">
                  {content.auth.login.forgotPasswordText}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={content.auth.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#915331] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-[#1A3626] dark:bg-[#915331] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-lg font-semibold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {content.auth.login.submitButton}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-[#102418]" />
              <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">{content.auth.login.dividerText}</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-[#102418]" />
            </div>

            <button
              type="button"
              className="w-full py-3.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#163321] text-gray-800 dark:text-white rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px]">🌐</div>
              {content.auth.login.uaePassButton}
            </button>
          </form>

          <p className="text-center text-[14px] text-gray-500 dark:text-gray-400 mt-10">
            {content.auth.login.signupPrompt}{" "}
            <Link href="/signup" className="font-bold text-gray-900 dark:text-white hover:underline">
              {content.auth.login.signupLinkText}
            </Link>
          </p>
          
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-[#1A3626]">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#102418]/50 border border-gray-100 dark:border-[#1A3626]/50">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Secure Access</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">All connections are encrypted and monitored.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
