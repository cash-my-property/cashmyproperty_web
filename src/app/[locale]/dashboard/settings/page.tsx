"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { User, Lock, Bell, Camera, Loader2, Trash2, AlertTriangle, AlertCircle, Globe, Plus, X, ChevronDown, Check, Search, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Image from "next/image";
import { compressImage } from "@/utils/imageCompressor";
import ProfileCropModal from "@/components/modals/ProfileCropModal";

const POPULAR_LANGUAGES = [
  "English",
  "Arabic",
  "Urdu",
  "Hindi",
  "Russian",
  "French",
  "Spanish",
  "German",
  "Chinese",
  "Farsi",
  "Turkish",
  "Italian",
  "Tagalog",
  "Bengali",
  "Punjabi",
];

const ALL_LANGUAGES = [
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Azerbaijani",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Burmese",
  "Chinese (Cantonese)",
  "Chinese (Mandarin)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Farsi (Persian)",
  "Filipino (Tagalog)",
  "Finnish",
  "French",
  "Georgian",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kazakh",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Latvian",
  "Lithuanian",
  "Malay",
  "Malayalam",
  "Marathi",
  "Norwegian",
  "Pashto",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhala",
  "Slovak",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Turkmen",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Vietnamese"
];

const ALL_NATIONALITIES = [
  "Afghan",
  "Albanian",
  "Algerian",
  "American",
  "Andorran",
  "Angolan",
  "Argentine",
  "Armenian",
  "Australian",
  "Austrian",
  "Azerbaijani",
  "Bahraini",
  "Bangladeshi",
  "Belarusian",
  "Belgian",
  "Bolivian",
  "Bosnian",
  "Brazilian",
  "British",
  "Bulgarian",
  "Canadian",
  "Chilean",
  "Chinese",
  "Colombian",
  "Croatian",
  "Cypriot",
  "Czech",
  "Danish",
  "Dutch",
  "Egyptian",
  "Emirati",
  "Estonian",
  "Ethiopian",
  "Filipino",
  "Finnish",
  "French",
  "Georgian",
  "German",
  "Ghanaian",
  "Greek",
  "Hungarian",
  "Icelandic",
  "Indian",
  "Indonesian",
  "Iranian",
  "Iraqi",
  "Irish",
  "Italian",
  "Japanese",
  "Jordanian",
  "Kazakh",
  "Kenyan",
  "Kuwaiti",
  "Kyrgyz",
  "Latvian",
  "Lebanese",
  "Libyan",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malaysian",
  "Maltese",
  "Mauritian",
  "Mexican",
  "Moldovan",
  "Montenegrin",
  "Moroccan",
  "Nepalese",
  "New Zealander",
  "Nigerian",
  "Norwegian",
  "Omani",
  "Pakistani",
  "Palestinian",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Qatari",
  "Romanian",
  "Russian",
  "Saudi",
  "Scottish",
  "Serbian",
  "Singaporean",
  "Slovak",
  "Slovenian",
  "South African",
  "South Korean",
  "Spanish",
  "Sri Lankan",
  "Sudanese",
  "Swedish",
  "Swiss",
  "Syrian",
  "Taiwanese",
  "Tajik",
  "Tanzanian",
  "Thai",
  "Tunisian",
  "Turkish",
  "Turkmen",
  "Ugandan",
  "Ukrainian",
  "Uruguayan",
  "Uzbek",
  "Venezuelan",
  "Vietnamese",
  "Welsh",
  "Yemeni",
  "Zimbabwean"
];

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
  const [nationality, setNationality] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  
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
  
  // Dropdown states
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const nationalityRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Picture Crop Modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setIsNationalityOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      const parts = user.fullName ? user.fullName.split(" ") : [""];
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setBrn(user.brokerNumber || "");
      setNationality(user.nationality || "");
      setBio((user as any).bio || (user as any).about || (user as any).description || "");

      let userLangs: string[] = [];
      if (Array.isArray(user.languages)) {
        userLangs = user.languages.map((l: any) => String(l).trim()).filter(Boolean);
      } else if (typeof user.languages === 'string') {
        try {
          const parsed = JSON.parse(user.languages);
          userLangs = Array.isArray(parsed) ? parsed.map((l: any) => String(l).trim()).filter(Boolean) : [user.languages.trim()];
        } catch {
          userLangs = user.languages.split(',').map((l: string) => l.trim()).filter(Boolean);
        }
      }
      setLanguages(userLangs);
    }
  }, [user]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguages((prev) => prev.filter((l) => l !== langToRemove));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 1000) {
      setBio(val);
    }
  };

  const handleProfileUpdate = async () => {
    setProfileMessage({ type: "", text: "" });
    setIsSavingProfile(true);
    try {
      const response = await api.put('/auth/editProfile', {
        nationality: nationality || "",
        languages,
        bio
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
      setSecurityMessage({ type: "error", text: "Old password and new password must be sent together." });
      return;
    }

    if (newPassword.length < 6) {
      setSecurityMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>_~`\-+=/\\[\]]/.test(newPassword)) {
      setSecurityMessage({ type: "error", text: "Password must contain at least one uppercase letter and one special character." });
      return;
    }
    
    setIsSavingSecurity(true);
    try {
      const response = await api.put('/auth/editProfile', {
        oldPassword,
        newPassword
      });
      setSecurityMessage({ type: "success", text: response.data?.message || "Password updated successfully!" });
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      setSecurityMessage({ type: "error", text: error.response?.data?.message || "Failed to update password." });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Image file size exceeds 10MB limit." });
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
      const croppedFile = new File([croppedBlob], "profile-picture.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("profilePicture", croppedFile);

      await api.put('/auth/uploadProfilePicture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      setProfileMessage({ type: "success", text: "Profile picture updated successfully!" });
      setCropModalOpen(false);
      fetchProfile();
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.response?.data?.message || "Failed to upload image." });
    } finally {
      setIsUploadingImage(false);
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
                <div className="relative w-24 h-24 shrink-0">
                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-[#102418] border-2 border-gray-200 dark:border-[#1A3626] shadow-sm flex items-center justify-center overflow-hidden relative">
                    {isUploadingImage ? (
                      <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#5CD284]" />
                    ) : user?.picture ? (
                      <Image src={user.picture} alt="Profile" fill className="object-cover" />
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
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Picture</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.firstName}</label>
                    <span className="text-[10px] text-gray-400 font-medium">Protected</span>
                  </div>
                  <input 
                    type="text" 
                    value={firstName} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.lastName}</label>
                    <span className="text-[10px] text-gray-400 font-medium">Protected</span>
                  </div>
                  <input 
                    type="text" 
                    value={lastName} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.email}</label>
                    <span className="text-[10px] text-gray-400 font-medium">Protected</span>
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.phone}</label>
                    <span className="text-[10px] text-gray-400 font-medium">Protected</span>
                  </div>
                  <input 
                    type="tel" 
                    value={phone} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm" 
                  />
                </div>
                {brn && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{content.form.brn}</label>
                      <span className="text-[10px] text-gray-400 font-medium">Official BRN</span>
                    </div>
                    <input 
                      type="text" 
                      value={brn}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0a170f] border border-gray-200 dark:border-[#1A3626] text-gray-500 dark:text-gray-400 opacity-75 cursor-not-allowed text-sm" 
                    />
                  </div>
                )}
                {/* Nationality Dropdown */}
                <div className="space-y-2 relative" ref={nationalityRef}>
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                    {(content.form as any).nationality || "Nationality"}
                  </label>
                  
                  <button 
                    type="button"
                    onClick={() => setIsNationalityOpen((prev) => !prev)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-left flex items-center justify-between cursor-pointer"
                  >
                    <span className={nationality ? "text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-500 text-sm"}>
                      {nationality || "Select nationality..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isNationalityOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isNationalityOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-gray-100 dark:border-[#1A3626]">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={nationalitySearch}
                            onChange={(e) => setNationalitySearch(e.target.value)}
                            placeholder="Search nationality..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="p-1.5 pr-2 max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                        {!nationalitySearch && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setNationality("");
                                setNationalitySearch("");
                                setIsNationalityOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-xs text-left transition-colors flex items-center justify-between ${
                                nationality === ""
                                  ? "bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] font-bold"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
                              }`}
                            >
                              <span>None / Clear</span>
                              {nationality === "" && <Check className="w-3.5 h-3.5 text-[#5CD284]" />}
                            </button>
                            <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Popular
                            </div>
                            <div className="flex flex-wrap gap-1 px-1.5 pb-2">
                              {["Emirati", "British", "Pakistani", "Indian", "Egyptian", "Russian", "Lebanese", "French", "Canadian"].map((popNat) => (
                                <button
                                  key={popNat}
                                  type="button"
                                  onClick={() => {
                                    setNationality(popNat);
                                    setNationalitySearch("");
                                    setIsNationalityOpen(false);
                                  }}
                                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                                    nationality === popNat
                                      ? "bg-[#5CD284] text-[#0A1C12] font-semibold"
                                      : "bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1A3626]"
                                  }`}
                                >
                                  {popNat}
                                </button>
                              ))}
                            </div>
                            <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-[#1A3626]">
                              All Nationalities (A-Z)
                            </div>
                          </>
                        )}
                        {ALL_NATIONALITIES
                          .filter((nat) => nat.toLowerCase().includes(nationalitySearch.toLowerCase()))
                          .map((nat) => (
                            <button
                              key={nat}
                              type="button"
                              onClick={() => {
                                setNationality(nat);
                                setNationalitySearch("");
                                setIsNationalityOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-xs text-left transition-colors flex items-center justify-between ${
                                nationality === nat
                                  ? "bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] font-bold"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
                              }`}
                            >
                              <span>{nat}</span>
                              {nationality === nat && <Check className="w-3.5 h-3.5 text-[#5CD284]" />}
                            </button>
                          ))}
                        {ALL_NATIONALITIES.filter((nat) => nat.toLowerCase().includes(nationalitySearch.toLowerCase())).length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">No nationality found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages Spoken Section */}
              <div className="pt-2 space-y-4 border-t border-gray-100 dark:border-[#1A3626]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5CD284]/10 dark:bg-[#5CD284]/15 flex items-center justify-center text-[#1A3626] dark:text-[#5CD284]">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {(content.form as any).languages || "Languages Spoken"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Languages you can communicate in.
                      </p>
                    </div>
                  </div>
                  {languages.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284]">
                      {languages.length} selected
                    </span>
                  )}
                </div>

                {/* Selected Languages Badges */}
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50/80 dark:bg-[#091711] border border-gray-200/80 dark:border-[#1A3626] rounded-xl">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A3626] text-white dark:bg-[#5CD284] dark:text-[#091711] shadow-xs"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="hover:opacity-75 transition-opacity cursor-pointer ml-0.5"
                          title={`Remove ${lang}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Searchable Checkbox Dropdown */}
                <div className="space-y-1.5 relative" ref={languageRef}>
                  <label className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
                    Languages Dropdown (Select Multiple)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLanguageOpen((prev) => !prev)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-left flex items-center justify-between cursor-pointer"
                  >
                    <span className={languages.length > 0 ? "text-gray-900 dark:text-white font-medium text-xs" : "text-gray-400 dark:text-gray-500 text-xs"}>
                      {languages.length > 0 ? `${languages.length} language(s) selected` : "Choose from list..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isLanguageOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-gray-100 dark:border-[#1A3626] flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            placeholder="Search languages..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        {languages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setLanguages([])}
                            className="px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="p-1.5 pr-2 max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                        {ALL_LANGUAGES
                          .filter((lang) => lang.toLowerCase().includes(languageSearch.toLowerCase()))
                          .map((lang) => {
                            const isSelected = languages.includes(lang);
                            return (
                              <label
                                key={lang}
                                className={`w-full px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer select-none ${
                                  isSelected
                                    ? "bg-[#5CD284]/15 text-[#1A3626] dark:text-[#5CD284] font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#163321]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleLanguage(lang)}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#5CD284] focus:ring-[#5CD284] accent-[#5CD284] cursor-pointer"
                                  />
                                  <span>{lang}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#5CD284]" />}
                              </label>
                            );
                          })}
                        {ALL_LANGUAGES.filter((lang) => lang.toLowerCase().includes(languageSearch.toLowerCase())).length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">No language found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Popular Suggested Language Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Quick Suggestions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_LANGUAGES.map((lang) => {
                      const isSelected = languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#5CD284]/20 border border-[#5CD284] text-[#1A3626] dark:text-[#5CD284] font-semibold"
                              : "bg-gray-100 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bio / About Section */}
              <div className="pt-2 space-y-3 border-t border-gray-100 dark:border-[#1A3626]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5CD284]/10 dark:bg-[#5CD284]/15 flex items-center justify-center text-[#1A3626] dark:text-[#5CD284]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        About / Bio
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        A brief professional summary highlighting your background and expertise.
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    bio.length >= 1000
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-gray-100 dark:bg-[#163321] text-gray-600 dark:text-gray-300"
                  }`}>
                    {bio.length} / 1000 characters
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={bio}
                    maxLength={1000}
                    onChange={handleBioChange}
                    placeholder="Write a brief professional bio about yourself, your background, areas of expertise, and experience in the real estate market (or leave empty to clear)..."
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] focus:outline-none focus:border-[#5CD284] dark:focus:border-[#5CD284] transition-colors text-sm text-gray-900 dark:text-white resize-y"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleProfileUpdate}
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3626] hover:bg-[#234833] dark:bg-[#5CD284] dark:hover:bg-[#4cb870] text-white dark:text-[#0A1C12] font-bold text-[14px] tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
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

