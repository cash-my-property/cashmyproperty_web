"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSocket } from "@/context/SocketContext";

export default function ContactPage() {
  const { dict } = useDictionary();
  const { addToast } = useSocket();
  const content = dict;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Message Sent", "Thank you! Your message has been received. We will get back to you shortly.", "success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
      });
    }, 1200);
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#091711] transition-colors min-h-screen">
      
      {/* HERO BANNER */}
      <section className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/hero-bg.svg")'
          }}
        />
        <div className="absolute inset-0 bg-[#1B3A2D]/85 dark:bg-[#091711]/90 mix-blend-multiply" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center pt-10">
          <span className="text-[#5CD284] font-bold tracking-[0.2em] text-[12px] mb-4 uppercase bg-white/10 px-5 py-2 rounded-full backdrop-blur-sm border border-white/10">
            {content.contact.hero.tagline}
          </span>
          <h1 className="text-white text-[44px] sm:text-[56px] font-bold mb-4 leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.contact.hero.title.replace('\n', ' ')}
          </h1>
          <p className="text-white/80 text-[16px] sm:text-[18px] max-w-xl leading-relaxed font-light">
            {content.contact.hero.description}
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT SECTION */}
      <section className="py-16 sm:py-24 px-6 lg:px-12 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Side: Contact Form */}
        <div className="w-full lg:w-[60%] bg-white dark:bg-[#102418] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#1A3626]">
          <p className="text-[#1A3626] dark:text-[#c9a14b] font-bold tracking-widest text-[12px] mb-3 uppercase">
            {content.contact.main.label}
          </p>
          <h2 className="text-[32px] sm:text-[38px] font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {content.contact.main.heading}
          </h2>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
            {content.contact.main.description}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.contact.main.form.firstNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={content.contact.main.form.firstNamePlaceholder}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {content.contact.main.form.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder={content.contact.main.form.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1A3626]/20 dark:focus:ring-[#5CD284]/20 focus:border-[#1A3626] dark:focus:border-[#c9a14b] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1A3626] dark:bg-[#c9a14b] hover:bg-[#12261a] dark:hover:bg-[#b38d3f] text-white dark:text-[#1A3626] rounded-xl font-bold text-[15px] transition-all duration-300 shadow-sm hover:shadow-md mt-4 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
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
          <div className="bg-[#1A3626] dark:bg-[#102418] rounded-3xl p-8 sm:p-10 text-white shadow-lg">
            <h3 className="text-[24px] font-bold mb-8" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {content.contact.main.office.title}
            </h3>
            
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">{content.contact.main.office.addressTitle}</h4>
                  <p className="text-[14px] text-white/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: siteConfig.footer.contact.address.replace(', ', ',<br/>') }}></p>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">Call Us</h4>
                  <p className="text-[14px] text-white/70">{siteConfig.footer.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#5CD284]" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-white/90 mb-1">Email Us</h4>
                  <p className="text-[14px] text-white/70">{siteConfig.footer.contact.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-5 pt-6 border-t border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#5CD284]/20 flex items-center justify-center shrink-0">
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
          
          {/* Map Placeholder */}
          <div className="w-full h-[300px] bg-gray-200 dark:bg-[#163321] rounded-3xl overflow-hidden shadow-sm relative group">
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: 'url("/property-placeholder.svg")' }}
            />
            {/* Map Overlay Button */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
               <button className="bg-white dark:bg-[#102418] text-gray-900 dark:text-white px-6 py-3 rounded-full font-bold text-[14px] shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer">
                 <MapPin className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> Get Directions
               </button>
            </div>
          </div>

        </div>
      </section>
      
    </main>
  );
}
