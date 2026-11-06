"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import {
  User,
  Lock,
  Camera,
  Loader2,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Building2,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";
import Image from "next/image";
import ProfileCropModal from "@/components/modals/ProfileCropModal";

export default function SettingsPage() {
  const { dict, locale } = useDictionary();
  const content = dict.dashboard.settings;
  const { user, isAgent, setUserData, fetchProfile, logout, logoutAll } = useAuth();

  const [activeTab, setActiveTab] = useState<"personal" | "security" | "delete">("personal");

  // Buyer Profile Form states
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Loading & Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" });

  // Delete Account states
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Picture Crop Modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setMobile(user.mobile || user.phone || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setProfileMessage({ type: "error", text: "Full name must be at least 2 characters." });
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await api.patch(`${PUBLIC_API_PREFIX}/me`, {
        fullName: trimmedName,
        mobile: mobile.trim() ? mobile.trim() : null,
      });

      const updatedAccount = response.data?.data || response.data?.account;
      if (updatedAccount) {
        setUserData(updatedAccount);
      } else {
        await fetchProfile();
      }
      setProfileMessage({
        type: "success",
        text: response.data?.message || "Changes saved.",
      });
    } catch (error: any) {
      setProfileMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Image file size exceeds 5MB limit." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setCropImageSrc(reader.result as string);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingImage(true);
    setProfileMessage({ type: "", text: "" });

    try {
      // 1. Get Cloudinary upload signature from backend
      const sigRes = await api.get(`${PUBLIC_API_PREFIX}/me/photo-signature`);
      const sigData = sigRes.data?.data || sigRes.data;
      const { timestamp, signature, apiKey, cloudName, folder } = sigData;

      if (!cloudName || !apiKey || !signature) {
        throw new Error("Could not obtain upload signature.");
      }

      // 2. Upload directly to Cloudinary
      const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const cloudForm = new FormData();
      cloudForm.append("file", croppedFile);
      cloudForm.append("api_key", String(apiKey));
      cloudForm.append("timestamp", String(timestamp));
      cloudForm.append("signature", String(signature));
      cloudForm.append("folder", String(folder));

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: cloudForm,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.secure_url || !uploadJson.public_id) {
        throw new Error(uploadJson?.error?.message || "Failed to upload photo to Cloudinary.");
      }

      // 3. Save avatar in buyer profile via PATCH /cmpConnect/public/me
      const patchRes = await api.patch(`${PUBLIC_API_PREFIX}/me`, {
        avatar: {
          url: uploadJson.secure_url,
          public_id: uploadJson.public_id,
        },
      });

      const updatedAccount = patchRes.data?.data || patchRes.data?.account;
      if (updatedAccount) {
        setUserData(updatedAccount);
      } else {
        await fetchProfile();
      }

      setProfileMessage({ type: "success", text: "Profile photo updated!" });
      setCropModalOpen(false);
    } catch (error: any) {
      setProfileMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Failed to upload image.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingImage(true);
    setProfileMessage({ type: "", text: "" });
    try {
      const patchRes = await api.patch(`${PUBLIC_API_PREFIX}/me`, { avatar: null });
      const updatedAccount = patchRes.data?.data || patchRes.data?.account;
      if (updatedAccount) {
        setUserData(updatedAccount);
      } else {
        await fetchProfile();
      }
      setProfileMessage({ type: "success", text: "Profile photo removed." });
    } catch (error: any) {
      setProfileMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to remove photo.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePasswordUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSecurityMessage({ type: "", text: "" });

    const requiresCurrent = user?.hasPassword !== false;
    if (requiresCurrent && !currentPassword) {
      setSecurityMessage({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (!newPassword) {
      setSecurityMessage({ type: "error", text: "Please enter a new password." });
      return;
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      setSecurityMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      setSecurityMessage({
        type: "error",
        text: "Password must be at least 6 characters and contain at least one uppercase letter and one special character (!@#$%^&*).",
      });
      return;
    }

    setIsSavingSecurity(true);
    try {
      const response = await api.post(`${PUBLIC_API_PREFIX}/me/change-password`, {
        currentPassword: requiresCurrent ? currentPassword : "",
        newPassword,
      });

      const updatedAccount = response.data?.data?.account || response.data?.account;
      if (updatedAccount) {
        setUserData(updatedAccount);
      } else {
        await fetchProfile();
      }

      setSecurityMessage({
        type: "success",
        text: response.data?.message || "Password changed. You have been logged out on other devices.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      setSecurityMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    const requiresPassword = user?.hasPassword !== false;

    if (requiresPassword && !deletePassword) {
      setDeleteError("Please enter your password to confirm account deletion.");
      return;
    }

    if (!requiresPassword && deleteConfirmText.trim() !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }

    if (!confirmDeleteChecked) {
      setDeleteError("Please check the confirmation box before deleting your account.");
      return;
    }

    setIsSubmittingDelete(true);

    try {
      await api.delete(`${PUBLIC_API_PREFIX}/me`, {
        data: requiresPassword
          ? { password: deletePassword }
          : { confirm: "DELETE" },
      });

      setUserData(null);
      window.location.href = `/${locale}/login`;
    } catch (error: any) {
      setIsSubmittingDelete(false);
      setDeleteError(error.response?.data?.message || "Failed to delete account. Please try again.");
    }
  };

  const avatarSrc = user?.avatarUrl || user?.picture || null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {content.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{content.description}</p>
      </div>

      {/* CMP CONNECT AGENT VIEW (Read-only profile per portal.html spec) */}
      {isAgent ? (
        <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] p-8 space-y-8">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#163321]/50 border border-emerald-200 dark:border-[#5CD284]/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#1A3626] dark:text-[#5CD284] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                CMP Connect Agent Account
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                You are signed in with your CMP Connect agent account
                {user?.agent?.companyName ? ` (${user.agent.companyName})` : ""}. You can browse, save properties, and contact agents here like a buyer. Profile details and password changes are managed in the CMP Connect portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#091711] border-2 border-gray-200 dark:border-[#1A3626] flex items-center justify-center overflow-hidden relative shrink-0">
              {avatarSrc ? (
                <Image src={avatarSrc} alt={user?.fullName || "Agent"} fill className="object-cover" />
              ) : (
                <User className="w-9 h-9 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              {user?.agent?.companyName && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#5CD284]/15 dark:text-[#5CD284]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.agent.companyName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-[#1A3626]">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
              <p className="mt-1.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-sm text-gray-800 dark:text-gray-200">
                {user?.fullName || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
              <p className="mt-1.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-sm text-gray-800 dark:text-gray-200">
                {user?.email || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile</label>
              <p className="mt-1.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-sm text-gray-800 dark:text-gray-200">
                {user?.mobile || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</label>
              <p className="mt-1.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-sm text-gray-800 dark:text-gray-200">
                {user?.agent?.companyName || "—"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-[#1A3626] flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-[#163321] hover:bg-gray-200 dark:hover:bg-[#1f442c] text-gray-800 dark:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
            <button
              type="button"
              disabled={isLoggingOutAll}
              onClick={async () => {
                setIsLoggingOutAll(true);
                await logoutAll();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition-colors cursor-pointer"
            >
              {isLoggingOutAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Log Out on All Devices
            </button>
          </div>
        </div>
      ) : (
        /* BUYER ACCOUNT VIEW (PUBLIC) */
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Sidebar Tabs */}
          <div className="w-full lg:w-64 space-y-2 shrink-0">
            <button
              onClick={() => setActiveTab("personal")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] cursor-pointer ${
                activeTab === "personal"
                  ? "bg-[#1A3626] dark:bg-[#c9a14b]/10 text-white dark:text-[#c9a14b]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]"
              }`}
            >
              <User className="w-4 h-4" /> {content.tabs.personal}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#1A3626] dark:bg-[#c9a14b]/10 text-white dark:text-[#c9a14b]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#102418]"
              }`}
            >
              <Lock className="w-4 h-4" /> {content.tabs.security}
            </button>
            <button
              onClick={() => setActiveTab("delete")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[14px] cursor-pointer ${
                activeTab === "delete"
                  ? "bg-red-600 text-white dark:bg-red-600 dark:text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/40"
              }`}
            >
              <Trash2 className="w-4 h-4" /> {content.tabs.deleteAccount}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] p-8">
            {activeTab === "personal" && (
              <form onSubmit={handleProfileUpdate} className="space-y-8 animate-in fade-in duration-500">
                {profileMessage.text && (
                  <div
                    className={`p-4 rounded-xl text-[14px] font-medium flex items-center gap-2 ${
                      profileMessage.type === "success"
                        ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                {/* Profile Picture */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <div className="w-full h-full rounded-full bg-gray-100 dark:bg-[#102418] border-2 border-gray-200 dark:border-[#1A3626] shadow-sm flex items-center justify-center overflow-hidden relative">
                      {isUploadingImage ? (
                        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
                      ) : avatarSrc ? (
                        <Image src={avatarSrc} alt="Profile" fill className="object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      title="Change profile picture"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#1A3626] hover:bg-[#234833] dark:bg-[#5CD284] dark:hover:bg-[#4cb870] rounded-full flex items-center justify-center text-white dark:text-[#0A1C12] hover:scale-110 transition-all shadow-md z-10 cursor-pointer border-2 border-white dark:border-[#102418]"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Photo</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG or WebP up to 5MB</p>
                    {avatarSrc && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingImage}
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={80}
                      placeholder="Hala Mansour"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#5CD284]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                      {content.form.phone} (UAE)
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+971501234567"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#5CD284]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                        {content.form.email}
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Verified</span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm"
                    />
                  </div>

                  {user?.code && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                          Account ID
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">System ID</span>
                      </div>
                      <input
                        type="text"
                        value={user.code}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] hover:bg-[#234833] dark:bg-[#5CD284] dark:hover:bg-[#4cb870] text-white dark:text-[#0A1C12] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {content.form.saveChanges}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <div className="space-y-8 animate-in fade-in duration-500 max-w-md">
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  {securityMessage.text && (
                    <div
                      className={`p-4 rounded-xl text-[14px] font-medium flex items-center gap-2 ${
                        securityMessage.type === "success"
                          ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {securityMessage.text}
                    </div>
                  )}

                  {user?.hasPassword !== false ? (
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                        {content.form.currentPassword}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-700 dark:text-blue-300">
                      You signed up with Google. You can set a password below to also log in with your email and password.
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                      {content.form.newPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 chars, 1 uppercase & 1 special (!@#$%^&*)"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#c9a14b] transition-colors text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingSecurity}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#091711] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingSecurity && <Loader2 className="w-4 h-4 animate-spin" />}
                      {content.form.updatePassword}
                    </button>
                  </div>
                </form>

                <div className="pt-6 border-t border-gray-100 dark:border-[#1A3626] space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Active Sessions</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sign out of your account across all browsers and devices.
                  </p>
                  <button
                    type="button"
                    disabled={isLoggingOutAll}
                    onClick={async () => {
                      setIsLoggingOutAll(true);
                      await logoutAll();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#163321] text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                  >
                    {isLoggingOutAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    Log out on all devices
                  </button>
                </div>
              </div>
            )}

            {activeTab === "delete" && (
              <div className="space-y-6 animate-in fade-in duration-500 max-w-xl">
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-red-700 dark:text-red-400">
                      {content.tabs.deleteAccount}
                    </h3>
                    <p className="text-xs text-red-600/90 dark:text-red-300/80 mt-1 leading-relaxed">
                      Deleting your account is permanent. Your personal data and saved properties will be removed, and all active sessions will be terminated immediately.
                    </p>
                  </div>
                </div>

                {deleteError && (
                  <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-sm flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                {user?.hasPassword !== false ? (
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200 block">
                      Enter your password to confirm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-red-500 transition-colors text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-800 dark:text-gray-200 block">
                      Type <span className="font-mono text-red-600">DELETE</span> to confirm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-red-500 transition-colors text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 dark:border-[#1A3626]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmDeleteChecked}
                      onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
                      className="mt-1 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      I understand that this action is irreversible and I want to permanently delete my account and saved properties.
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
      )}

      {/* Profile Picture Cropper Modal */}
      {cropImageSrc && (
        <ProfileCropModal
          imageSrc={cropImageSrc}
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          isUploading={isUploadingImage}
        />
      )}
    </div>
  );
}
