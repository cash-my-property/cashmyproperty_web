"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UploadCloud, Search } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { dict, locale } = useDictionary();
  const content = dict;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBRN, setIsFetchingBRN] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [brnLocked, setBrnLocked] = useState(false);

  // Form Fields
  const [brokerNumber, setBrokerNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [emiratesIdIssue, setEmiratesIdIssue] = useState("");
  const [emiratesIdExpiry, setEmiratesIdExpiry] = useState("");
  const [brokerCardExpiry, setBrokerCardExpiry] = useState("");
  const [brokerCardIssue, setBrokerCardIssue] = useState("");

  // Files
  const [emiratesIdFile, setEmiratesIdFile] = useState<File | null>(null);

  // Auto-fetch on BRN change with debounce
  useEffect(() => {
    const fetchBrnData = async () => {
      if (brokerNumber.length < 4) return;
      
      setIsFetchingBRN(true);
      setError("");
      
      try {
        // Hit the actual testing backend
        const response = await api.get(`/auth/check-existence?brokerNumber=${brokerNumber}`);
        console.log("BRN API Response:", response.data);
        
        // If data is returned
        if (response.data && response.data.broker) {
          const { broker } = response.data;
          const { firstName, lastName, email, phone, brokerCardIssueDate, brokerCardExpiryDate } = broker;
          
          console.log("Destructured Broker Data:", { firstName, lastName, email, phone, brokerCardIssueDate, brokerCardExpiryDate });
          
          setFirstName(firstName || "");
          setLastName(lastName || "");
          setEmail(email || "");
          setPhone(phone || "");
          
          if (brokerCardIssueDate && typeof brokerCardIssueDate === 'string') {
            setBrokerCardIssue(brokerCardIssueDate.split('T')[0]); 
          }
          
          if (brokerCardExpiryDate && typeof brokerCardExpiryDate === 'string') {
            setBrokerCardExpiry(brokerCardExpiryDate.split('T')[0]); 
          }
          
          // Lock if we got real data
          setBrnLocked(true);
        } else {
          // Fallback mock if you want to see the UI lock for testing specifically
          if (brokerNumber === "12345") {
            setFirstName("Ali");
            setLastName("Khan");
            setEmail("ali.khan@example.com");
            setPhone("501234567");
            setBrnLocked(true); 
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch BRN details", err);
        // Do not block signup if validation fails, just let them type manually
      } finally {
        setIsFetchingBRN(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchBrnData();
    }, 1000); // 1s debounce

    return () => clearTimeout(timeoutId);
  }, [brokerNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append('broker_number', brokerNumber);
      formData.append('emirates_id_issue', emiratesIdIssue);
      formData.append('emirates_id_expiry', emiratesIdExpiry);
      formData.append('broker_card_issue', brokerCardIssue);
      formData.append('broker_card_expiry', brokerCardExpiry);
      if (referralCode) formData.append('referal_code', referralCode);

      if (emiratesIdFile) formData.append("emiratesId", emiratesIdFile);

      const response = await api.post("/auth/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        router.push(`/${locale}/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12 pt-32 sm:pt-36 transition-colors">
      <div className="w-full max-w-[1200px] bg-white dark:bg-[#102418] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex overflow-hidden min-h-[500px] transition-colors">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[45%] relative bg-[#1B3A2D] overflow-hidden flex-col items-center justify-center p-12 text-center">
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
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
        <div className="w-full lg:w-[55%] p-8 sm:p-14 lg:p-16 flex flex-col justify-start max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>{content.auth.signup.heading}</h1>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">{content.auth.signup.subheading}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[14px] font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. BRN SECTION AT TOP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300">{content.auth.signup.brnLabel} *</label>
                {isFetchingBRN && <span className="text-[11px] text-[#1A3626] dark:text-[#c9a14b] flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Validating...</span>}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={content.auth.signup.brnPlaceholder}
                  value={brokerNumber}
                  onChange={(e) => {
                    setBrokerNumber(e.target.value);
                    if (brnLocked) setBrnLocked(false); // Unlock if they change BRN
                  }}
                  className="w-full px-4 py-3 pl-10 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                  required
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">Enter your BRN to auto-fill your details.</p>
            </div>

            {/* Name Fields (Auto-filled & Locked) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.firstNameLabel} *</label>
                <input
                  type="text"
                  placeholder={content.auth.signup.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  readOnly={brnLocked}
                  className={`w-full px-4 py-3 rounded-lg text-[14px] focus:outline-none transition-colors ${brnLocked ? 'bg-gray-100 dark:bg-[#163321]/50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:border-[#1A3626] dark:focus:border-[#c9a14b]'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.lastNameLabel} *</label>
                <input
                  type="text"
                  placeholder={content.auth.signup.lastNamePlaceholder}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  readOnly={brnLocked}
                  className={`w-full px-4 py-3 rounded-lg text-[14px] focus:outline-none transition-colors ${brnLocked ? 'bg-gray-100 dark:bg-[#163321]/50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:border-[#1A3626] dark:focus:border-[#c9a14b]'}`}
                  required
                />
              </div>
            </div>

            {/* Email & Phone (Auto-filled & Locked) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.emailLabel} *</label>
                <input
                  type="email"
                  placeholder={content.auth.signup.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={brnLocked}
                  className={`w-full px-4 py-3 rounded-lg text-[14px] focus:outline-none transition-colors ${brnLocked ? 'bg-gray-100 dark:bg-[#163321]/50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:border-[#1A3626] dark:focus:border-[#c9a14b]'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.phoneLabel} *</label>
                <div className={`flex rounded-lg overflow-hidden transition-colors ${brnLocked ? 'bg-gray-100 dark:bg-[#163321]/50 cursor-not-allowed' : 'bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus-within:border-[#1A3626] dark:focus-within:border-[#5CD284]'}`}>
                  <input
                    type="tel"
                    placeholder="+971501234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    readOnly={brnLocked}
                    className={`w-full px-4 py-3 text-[14px] bg-transparent outline-none transition-colors ${brnLocked ? 'text-gray-500 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-[#102418] my-6" />

            {/* Other Details */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Required Documents</h3>
              
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{content.auth.signup.referralLabel}</label>
                <input
                  type="text"
                  placeholder={content.auth.signup.referralPlaceholder}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Emirates ID Issue *</label>
                  <input
                    type="date"
                    value={emiratesIdIssue}
                    onChange={(e) => setEmiratesIdIssue(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Emirates ID Expiry *</label>
                  <input
                    type="date"
                    value={emiratesIdExpiry}
                    onChange={(e) => setEmiratesIdExpiry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-[14px] focus:outline-none focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Broker Card Issue *</label>
                  <input
                    type="date"
                    value={brokerCardIssue}
                    onChange={(e) => setBrokerCardIssue(e.target.value)}
                    readOnly={brnLocked}
                    className={`w-full px-4 py-3 rounded-lg text-[14px] focus:outline-none transition-colors ${brnLocked ? 'bg-gray-100 dark:bg-[#163321]/50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:border-[#1A3626] dark:focus:border-[#c9a14b]'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Broker Card Expiry *</label>
                  <input
                    type="date"
                    value={brokerCardExpiry}
                    onChange={(e) => setBrokerCardExpiry(e.target.value)}
                    readOnly={brnLocked}
                    className={`w-full px-4 py-3 rounded-lg text-[14px] focus:outline-none transition-colors ${brnLocked ? 'bg-gray-100 dark:bg-[#163321]/50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:border-[#1A3626] dark:focus:border-[#c9a14b]'}`}
                    required
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Emirates ID (PDF/Image) *</label>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, setEmiratesIdFile)}
                    className="w-full text-[13px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-[#1A3626]/10 file:text-[#1A3626] dark:file:bg-[#5CD284]/10 dark:file:text-[#5CD284] hover:file:bg-[#1A3626]/20 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] disabled:opacity-70 disabled:cursor-not-allowed text-white dark:text-[#1A3626] rounded-lg font-semibold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {content.auth.signup.submitButton}
            </button>

            <p className="text-center text-[14px] text-gray-500 dark:text-gray-400 mt-6 pb-6">
              {content.auth.signup.loginPrompt}{" "}
              <Link href="/login" className="font-bold text-gray-900 dark:text-white hover:underline">
                {content.auth.signup.loginLinkText}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
