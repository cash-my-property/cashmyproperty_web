"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { content } from "@/config/content";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [brn, setBrn] = useState("");
  const [referral, setReferral] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+971");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 transition-colors">
      <div className="w-full max-w-[1200px] bg-white dark:bg-[#1E293B] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[500px] transition-colors">
        
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

        {/* RIGHT PANEL - SIGNUP FORM */}
        <div className="w-full lg:w-[55%] p-8 sm:p-14 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>{content.auth.signup.heading}</h1>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">{content.auth.signup.subheading}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* BRN No & Referral Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.brnLabel}</label>
                <input
                  type="text"
                  placeholder={content.auth.signup.brnPlaceholder}
                  value={brn}
                  onChange={(e) => setBrn(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.referralLabel} <span className="text-gray-400 dark:text-gray-500 font-normal">{content.auth.signup.referralOptional}</span></label>
                <input
                  type="text"
                  placeholder={content.auth.signup.referralPlaceholder}
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.firstNameLabel}</label>
                <input
                  type="text"
                  placeholder={content.auth.signup.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.lastNameLabel}</label>
                <input
                  type="text"
                  placeholder={content.auth.signup.lastNamePlaceholder}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.emailLabel}</label>
              <input
                type="email"
                placeholder={content.auth.signup.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.phoneLabel}</label>
              <div className="flex rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden focus-within:border-[#1A3626] dark:focus-within:border-[#5CD284] focus-within:ring-1 focus-within:ring-[#1A3626] dark:focus-within:ring-[#5CD284] transition-colors bg-white dark:bg-slate-800">
                <input
                  type="text"
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="w-20 px-4 py-3.5 text-[14px] text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-slate-700/50 border-r border-gray-200 dark:border-slate-700 outline-none"
                />
                <input
                  type="tel"
                  placeholder={content.auth.signup.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 text-[14px] text-gray-900 dark:text-white bg-transparent placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.passwordLabel}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={content.auth.signup.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors pr-12 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.confirmPasswordLabel}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={content.auth.signup.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#5CD284] focus:ring-1 focus:ring-[#1A3626] dark:focus:ring-[#5CD284] transition-colors pr-12 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-[#1A3626] dark:text-[#5CD284] focus:ring-[#1A3626] dark:focus:ring-[#5CD284] dark:bg-slate-800"
                  required
                />
              </div>
              <label htmlFor="terms" className="text-[13px] text-gray-500 dark:text-gray-400">
                {content.auth.signup.termsAgreeStart} <Link href="#" className="font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{content.auth.signup.termsOfService}</Link> {content.auth.signup.and} <Link href="#" className="font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{content.auth.signup.privacyPolicy}</Link>.
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-4 bg-[#1A3626] dark:bg-[#5CD284] hover:bg-[#12261a] dark:hover:bg-[#4ab872] text-white dark:text-[#1A3626] rounded-lg font-semibold text-[15px] transition-colors shadow-sm"
            >
              {content.auth.signup.submitButton}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
              <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{content.auth.signup.dividerText}</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-slate-800" />
            </div>

            <button
              type="button"
              className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px]">🌐</div>
              {content.auth.signup.uaePassButton}
            </button>
          </form>

          <p className="text-center text-[14px] text-gray-500 dark:text-gray-400 mt-10">
            {content.auth.signup.loginPrompt}{" "}
            <Link href="/login" className="font-bold text-gray-900 dark:text-white hover:underline">
              {content.auth.signup.loginLinkText}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
