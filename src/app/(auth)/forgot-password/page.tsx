"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { content } from "@/config/content";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify OTP logic here
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 transition-colors">
      <div className="w-full max-w-[1000px] bg-white dark:bg-[#1E293B] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[640px] transition-colors">
        
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

        {/* RIGHT PANEL - FORM */}
        <div className="w-full lg:w-[55%] p-8 sm:p-14 lg:p-16 flex flex-col justify-center">
          
          <Link href="/login" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-8 w-fit">
            <ArrowLeft className="w-4 h-4" /> {content.auth.forgotPassword.backToLoginText}
          </Link>

          <div className="mb-10">
            <h1 className="text-[32px] sm:text-[36px] font-bold text-gray-900 dark:text-white mb-3 tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {content.auth.forgotPassword.heading}
            </h1>
            <p className="text-[15px] text-gray-500 dark:text-gray-400">
              {content.auth.forgotPassword.subheading}
            </p>
          </div>
          
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.auth.forgotPassword.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder={content.auth.forgotPassword.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#5CD284] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-[#1A3626] dark:bg-[#5CD284] hover:bg-[#12261a] dark:hover:bg-[#4ab872] text-white dark:text-[#1A3626] rounded-lg font-semibold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {content.auth.forgotPassword.submitButton} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                  {content.auth.forgotPassword.otpLabel} sent to <span className="text-[#1A3626] dark:text-[#5CD284]">{email}</span>
                </label>
                
                {/* 4-Digit OTP Inputs */}
                <div className="flex justify-center gap-4 mb-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 sm:w-16 sm:h-16 text-center text-[24px] font-bold rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#5CD284] transition-all"
                      required
                    />
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <button type="button" className="text-[13px] font-semibold text-gray-500 hover:text-[#1A3626] dark:text-gray-400 dark:hover:text-[#5CD284] transition-colors">
                    {content.auth.forgotPassword.resendOtpText}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#1A3626] dark:bg-[#5CD284] hover:bg-[#12261a] dark:hover:bg-[#4ab872] text-white dark:text-[#1A3626] rounded-lg font-semibold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {content.auth.forgotPassword.verifyButton} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
          
          <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
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
