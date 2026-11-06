"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import connectPublicService from "@/services/connectPublicService";
import { apiErrorMessage } from "@/services/rtoService";

export default function ContactPage() {
  const { dict } = useDictionary();
  const { addToast } = useSocket();
  const { user } = useAuth();
  const content = dict;
  const cf = dict.contactForm;

  // Logged-in user ka naam / email pehle se bhar do
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.mobile || "",
    message: ""
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CMP Connect POST /contact-us (backend 4728f57). Pehle yeh form kuch bhejta hi nahi tha.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.message.trim().length < 10) {
      setError(cf.messageTooShort);
      return;
    }
    setIsSubmitting(true);
    try {
      await connectPublicService.contactUs({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        ...(formData.phone.trim() && { mobile: formData.phone.trim() }),
        message: formData.message.trim(),
      });
      addToast(cf.sentTitle, cf.sentBody, "success");
      setFormData((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setError(apiErrorMessage(err, cf.failed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full py-24 sm:py-32 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: 'url("/hero-bg.svg")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A3626]/90 via-[#0a1a13]/85 to-[#091711] dark:from-[#091711]/95 dark:via-[#091711]/90 dark:to-[#091711]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#5CD284]/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#5CD284]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#5CD284] font-bold tracking-[0.2em] text-[11px] sm:text-[12px] mb-6 uppercase bg-white/10 dark:bg-white/5 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 dark:border-white/5 shadow-sm">
            {content.contact.hero.tagline}
          </span>
          <h1 className="text-white text-[38px] sm:text-[56px] lg:text-[62px] font-bold mb-6 leading-[1.15] tracking-tight max-w-3xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.contact.hero.title.replace('\n', ' ')}
          </h1>
          <p className="text-white/80 dark:text-gray-300 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed font-light">
            {content.contact.hero.description}
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 sm:gap-16 items-start">
        
        {/* Left Side: Contact Form */}
        <div className="w-full lg:w-[60%] bg-white dark:bg-[#102418] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-150 dark:border-[#1A3626]">
          <p className="text-[#1A3626] dark:text-[#5CD284] font-bold tracking-widest text-[12px] mb-3 uppercase">
            {content.contact.main.label}
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.contact.main.heading}
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            {content.contact.main.description}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.contact.main.form.firstNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={content.contact.main.form.firstNamePlaceholder}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5CD284]/20 focus:border-[#5CD284] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.contact.main.form.lastNameLabel}
                </label>
                <input
                  type="text"
                  placeholder={content.contact.main.form.lastNamePlaceholder}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5CD284]/20 focus:border-[#5CD284] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.contact.main.form.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder={content.contact.main.form.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5CD284]/20 focus:border-[#5CD284] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.contact.main.form.phoneLabel}
                </label>
                <input
                  type="tel"
                  placeholder={content.contact.main.form.phonePlaceholder}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5CD284]/20 focus:border-[#5CD284] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {content.contact.main.form.messageLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder={content.contact.main.form.messagePlaceholder}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5CD284]/20 focus:border-[#5CD284] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1A3626] dark:bg-[#5CD284] hover:opacity-90 text-white dark:text-[#0A1C12] rounded-xl font-bold text-[15px] transition-all duration-300 shadow-md mt-4 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {cf.sending}
                </>
              ) : (
                content.contact.main.form.submitButton
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Info & Map */}
        <div className="w-full lg:w-[40%] flex flex-col gap-8">
          
          {/* Office Info Card */}
          <div className="bg-[#1A3626] dark:bg-[#102418] rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-white/10 dark:border-[#1A3626]">
            <h3 className="text-[24px] font-bold mb-8" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {content.contact.main.office.title}
            </h3>
            
            <div className="space-y-7">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#5CD284]/15 border border-[#5CD284]/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">{content.contact.main.office.addressTitle}</h4>
                  <p className="text-[14px] text-white/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: siteConfig.footer.contact.address.replace(', ', ',<br/>') }}></p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#5CD284]/15 border border-[#5CD284]/30 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">Call Us</h4>
                  <p className="text-[14px] text-white/70">{siteConfig.footer.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#5CD284]/15 border border-[#5CD284]/30 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">Email Us</h4>
                  <p className="text-[14px] text-white/70">{siteConfig.footer.contact.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-5 pt-6 border-t border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#5CD284]/20 border border-[#5CD284]/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">{content.contact.main.office.workingHoursTitle}</h4>
                  <p className="text-[14px] text-white/70 leading-relaxed whitespace-pre-line">
                    {content.contact.main.office.workingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Card — office location (Business Bay, Opus Tower, B601) Google Maps embed */}
          <div className="w-full h-[300px] bg-gray-200 dark:bg-[#102418] rounded-3xl overflow-hidden shadow-sm border border-gray-150 dark:border-[#1A3626] relative">
            <iframe
              title={`Cash My Property office — ${siteConfig.footer.contact.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(siteConfig.footer.contact.mapQuery)}&z=16&output=embed`}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Directions — Google Maps mein raasta */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.footer.contact.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 start-4 bg-white dark:bg-[#102418] text-gray-900 dark:text-white px-5 py-2.5 rounded-full font-bold text-[13px] shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer border border-gray-200 dark:border-[#1A3626]"
            >
              <MapPin className="w-4 h-4 text-[#5CD284]" /> Get Directions
            </a>
          </div>

        </div>
      </section>
      
    </main>
  );
}
