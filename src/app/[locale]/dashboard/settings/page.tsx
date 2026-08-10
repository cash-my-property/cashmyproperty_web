"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { User, Lock, Bell, Camera, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Image from "next/image";

export default function SettingsPage() {
  const { dict } = useDictionary();
  const content = dict.dashboard.settings;
  const { user, fetchProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('personal');

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [brn, setBrn] = useState("");
  
  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Loading and feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" });
  
  // Delete account states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const parts = user.fullName ? user.fullName.split(" ") : [""];
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setBrn(user.brokerNumber || "");
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setProfileMessage({ type: "", text: "" });
    setIsSavingProfile(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const response = await api.put('/auth/editProfile', {
        fullName,
        phone
      });
      
      setProfileMessage({ type: "success", text: response.data?.message || "Profile updated successfully!" });
      fetchProfile();
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setSecurityMessage({ type: "", text: "" });
    if (!oldPassword || !newPassword) {
      setSecurityMessage({ type: "error", text: "Please fill in both password fields." });
      return;
    }
    
    setIsSavingSecurity(true);
    try {
      await api.put('/auth/editProfile', {
        oldPassword,
        newPassword
      });
      setSecurityMessage({ type: "success", text: "Password updated successfully!" });
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      setSecurityMessage({ type: "error", text: error.response?.data?.message || "Failed to update password." });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      await api.put('/auth/uploadProfilePicture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileMessage({ type: "success", text: "Profile picture updated successfully!" });
      fetchProfile();
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.response?.data?.message || "Failed to upload image." });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) return;
    setIsSubmittingDelete(true);
    setSecurityMessage({ type: "", text: "" });
    try {
      await api.delete('/auth/delete-account', {
        data: { reason: deleteReason }
      });
      // Force logout and redirect
      window.location.href = `/${document.documentElement.lang || 'en'}/login`;
    } catch (error: any) {
      setSecurityMessage({ type: "error", text: error.response?.data?.message || "Failed to delete account." });
      setIsSubmittingDelete(false);
    }
  };

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
                ? 'bg-[#1A3626] dark:bg-[#c9a14b]/10 text-white dark:text-[#c9a14b]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]'
            }`}
          >
            <User className="w-4 h-4" /> {content.tabs.personal}
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] ${
              activeTab === 'security' 
                ? 'bg-[#1A3626] dark:bg-[#c9a14b]/10 text-white dark:text-[#c9a14b]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]'
            }`}
          >
            <Lock className="w-4 h-4" /> {content.tabs.security}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] p-8">
          
          {activeTab === 'personal' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {profileMessage.text && (
                <div className={`p-4 rounded-xl text-[14px] font-medium flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                  {profileMessage.text}
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-[#102418] border-4 border-white dark:border-[#1A3626] shadow-sm flex items-center justify-center overflow-hidden">
                  {isUploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  ) : user?.picture ? (
                    <Image src={user.picture} alt="Profile" fill className="object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#1A3626] dark:bg-[#c9a14b] rounded-full flex items-center justify-center text-white dark:text-[#091711] hover:scale-105 transition-transform shadow-md z-10"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Picture</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.firstName}</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.lastName}</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.email}</label>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-70 cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.phone}</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white" 
                  />
                </div>
                {brn && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.brn}</label>
                    <input 
                      type="text" 
                      value={brn}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-70 cursor-not-allowed" 
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleProfileUpdate}
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#091711] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  {content.form.saveChanges}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-md">
              {securityMessage.text && (
                <div className={`p-4 rounded-xl text-[14px] font-medium flex items-center gap-2 ${securityMessage.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                  {securityMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.currentPassword}</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.newPassword}</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white" 
                />
              </div>
              
              <div className="pt-4 pb-8 border-b border-gray-100 dark:border-[#1A3626]">
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={isSavingSecurity}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#091711] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isSavingSecurity && <Loader2 className="w-4 h-4 animate-spin" />}
                  {content.form.updatePassword}
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-500">Delete Account</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                
                {isDeleting ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Reason for deletion</label>
                      <textarea 
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="Please tell us why you are leaving..."
                        className="w-full px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-900 focus:outline-none focus:border-red-500 transition-colors text-gray-900 dark:text-white h-24 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleDeleteAccount}
                        disabled={!deleteReason.trim() || isSubmittingDelete}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-[14px] tracking-wide hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {isSubmittingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Confirm Deletion
                      </button>
                      <button 
                        onClick={() => { setIsDeleting(false); setDeleteReason(""); }}
                        disabled={isSubmittingDelete}
                        className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-[#102418] text-gray-700 dark:text-gray-300 font-bold text-[14px] hover:bg-gray-200 dark:hover:bg-[#1A3626] transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="px-6 py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 font-bold text-[14px] hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
