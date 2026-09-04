"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { User, Lock, Bell, Camera, Loader2, Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Image from "next/image";

export default function SettingsPage() {
  const { dict } = useDictionary();
  const content = dict.dashboard.settings;
  const { user, fetchProfile, logout } = useAuth();
  
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
  const [deleteReasonPreset, setDeleteReasonPreset] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteBlockers, setDeleteBlockers] = useState<string[]>([]);
  
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
    const finalReason = deleteReasonPreset === "Other reason (please specify below)" 
      ? customReason.trim() 
      : (deleteReasonPreset || customReason.trim());

    if (!finalReason) {
      setDeleteError("Please select or specify a reason for deleting your account.");
      return;
    }

    if (!confirmDeleteChecked) {
      setDeleteError("Please check the confirmation box before deleting your account.");
      return;
    }

    setIsSubmittingDelete(true);
    setDeleteError("");
    setDeleteBlockers([]);

    try {
      await api.delete('/auth/delete-account', {
        data: { reason: finalReason }
      });

      // Clear auth context & cookies
      await logout();
      const locale = document.documentElement.lang || 'en';
      window.location.href = `/${locale}/login`;
    } catch (error: any) {
      setIsSubmittingDelete(false);
      const data = error.response?.data;
      if (data?.code === 'DELETE_BLOCKED' && Array.isArray(data?.blockers) && data.blockers.length > 0) {
        setDeleteBlockers(data.blockers);
        setDeleteError(data.message || "Account cannot be deleted. Please resolve all pending issues first.");
      } else {
        setDeleteError(data?.message || "Failed to delete account. Please try again.");
      }
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] cursor-pointer ${
              activeTab === 'personal' 
                ? 'bg-[#1A3626] dark:bg-[#c9a14b]/10 text-white dark:text-[#c9a14b]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]'
            }`}
          >
            <User className="w-4 h-4" /> {content.tabs.personal}
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] cursor-pointer ${
              activeTab === 'security' 
                ? 'bg-[#1A3626] dark:bg-[#c9a14b]/10 text-white dark:text-[#c9a14b]' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]'
            }`}
          >
            <Lock className="w-4 h-4" /> {content.tabs.security}
          </button>
          <button 
            onClick={() => setActiveTab('delete')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[14px] cursor-pointer ${
              activeTab === 'delete' 
                ? 'bg-red-600 text-white dark:bg-red-600 dark:text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/40'
            }`}
          >
            <Trash2 className="w-4 h-4" /> {content.tabs.deleteAccount}
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
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#1A3626] dark:bg-[#c9a14b] rounded-full flex items-center justify-center text-white dark:text-[#091711] hover:scale-105 transition-transform shadow-md z-10 cursor-pointer"
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
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#091711] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
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
              
              <div className="pt-4 pb-8">
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={isSavingSecurity}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#091711] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingSecurity && <Loader2 className="w-4 h-4 animate-spin" />}
                  {content.form.updatePassword}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-xl">
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-red-700 dark:text-red-400">
                    {content.tabs.deleteAccount}
                  </h3>
                  <p className="text-xs text-red-600/90 dark:text-red-300/80 mt-1 leading-relaxed">
                    Deleting your account is permanent. Your active session will be terminated and your profile data will be permanently archived/deleted according to RERA regulations.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                  {deleteBlockers.length > 0 && (
                    <ul className="list-disc list-inside text-xs space-y-1 pt-1 pl-2 text-red-700 dark:text-red-300">
                      {deleteBlockers.map((blocker, idx) => (
                        <li key={idx}>{blocker}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200 block">
                  Why are you deleting your account? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2.5">
                  {[
                    { id: "REASON_1", label: "I am no longer using Cash My Property" },
                    { id: "REASON_2", label: "I created a duplicate or secondary account" },
                    { id: "REASON_3", label: "Privacy or security concerns" },
                    { id: "OTHER", label: "Other reason (please specify below)" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      onClick={() => setDeleteReasonPreset(item.label)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-sm font-medium ${
                        deleteReasonPreset === item.label
                          ? "bg-red-50/60 dark:bg-red-950/20 border-red-500 text-red-900 dark:text-red-200"
                          : "bg-gray-50 dark:bg-[#102418] border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deleteReason"
                        checked={deleteReasonPreset === item.label}
                        onChange={() => setDeleteReasonPreset(item.label)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                {(deleteReasonPreset === "Other reason (please specify below)" || !deleteReasonPreset) && (
                  <div className="pt-2">
                    <textarea
                      rows={3}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please provide details on why you are deleting your account..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-red-500 transition-colors text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmDeleteChecked}
                    onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
                    className="mt-1 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    I understand that this action is irreversible and I want to permanently delete my account and access.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isSubmittingDelete || !confirmDeleteChecked}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-[14px] tracking-wide transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {isSubmittingDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

