"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { User, Lock, Bell, Camera } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { dict } = useDictionary();
  const content = dict.dashboard.settings;
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {content.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] ${
              activeTab === 'personal' 
                ? 'bg-[#1A3626] dark:bg-[#5CD284]/10 text-white dark:text-[#5CD284]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> {content.tabs.personal}
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] ${
              activeTab === 'security' 
                ? 'bg-[#1A3626] dark:bg-[#5CD284]/10 text-white dark:text-[#5CD284]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" /> {content.tabs.security}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] ${
              activeTab === 'notifications' 
                ? 'bg-[#1A3626] dark:bg-[#5CD284]/10 text-white dark:text-[#5CD284]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" /> {content.tabs.notifications}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
          
          {activeTab === 'personal' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#1A3626] dark:bg-[#5CD284] rounded-full flex items-center justify-center text-white dark:text-[#0F172A] hover:scale-105 transition-transform shadow-md">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Picture</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.firstName}</label>
                  <input type="text" defaultValue="John" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.lastName}</label>
                  <input type="text" defaultValue="Doe" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.email}</label>
                  <input type="email" defaultValue="john.doe@example.com" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.phone}</label>
                  <input type="tel" defaultValue="+971 50 123 4567" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.brn}</label>
                  <input type="text" placeholder="Optional for Buyers" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0F172A] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {content.form.saveChanges}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-md">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.currentPassword}</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.newPassword}</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-gray-900 dark:text-white" />
              </div>
              
              <div className="pt-4">
                <button className="px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#0F172A] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {content.form.updatePassword}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
