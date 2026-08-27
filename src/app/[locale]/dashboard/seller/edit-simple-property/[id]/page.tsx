"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { Loader2, CheckCircle2, ArrowRight, UploadCloud, X, File as FileIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import Image from "next/image";

// Recreated Document Config from backend
// Recreated Document Config from backend simpleListingRule.js
const PROPERTY_DOC_CONFIG: any = {
  RESIDENTIAL: {
    READY: {
      APARTMENT: { images: { min: 8, max: 25 }, required: ["contractA", "propertyTitleDeed", "propertyTrakheesi", "passportDocument"] },
      VILLA: { images: { min: 10, max: 25 }, required: ["contractA", "propertyTitleDeed", "propertyTrakheesi", "passportDocument"] },
      LAND: { images: { min: 2, max: 10 }, required: ["contractA", "propertyTitleDeed", "propertyTrakheesi", "passportDocument"] }
    },
    OFF_PLAN: {
      APARTMENT: { images: { min: 4, max: 10 }, required: ["contractA", "propertyTrakheesi", "passportDocument", "oqoodDocument"] },
      VILLA: { images: { min: 4, max: 10 }, required: ["contractA", "propertyTrakheesi", "passportDocument", "oqoodDocument"] }
    }
  },
  COMMERCIAL: {
    READY: {
      RETAIL: { images: { min: 5, max: 25 }, required: ["contractA", "propertyTitleDeed", "propertyTrakheesi", "passportDocument"] },
      OFFICES: { images: { min: 5, max: 25 }, required: ["contractA", "propertyTitleDeed", "propertyTrakheesi", "passportDocument"] },
      BUILDING: { images: { min: 10, max: 25 }, required: ["contractA", "propertyTitleDeed", "propertyTrakheesi", "passportDocument"] }
    },
    OFF_PLAN: {
      RETAIL: { images: { min: 4, max: 10 }, required: ["contractA", "oqoodDocument", "propertyTrakheesi", "passportDocument"] }
    }
  }
};

const AMENITIES_CONFIG: Record<string, string[]> = {
  RESIDENTIAL: [
    "Balcony",
    "Barbecue Area",
    "Built in Wardrobes",
    "Central A/C",
    "Covered Parking",
    "Private Gym",
    "Private Jacuzzi",
    "Kitchen Appliances",
    "Maids Room",
    "Pets Allowed",
    "Private Garden",
    "Private Pool",
    "Shared Pool",
    "Study",
    "View of Water",
    "Security",
    "Concierge",
    "Shared Spa",
    "Shared Gym",
    "Maid Service",
    "Walk-in Closet",
    "View of Landmark",
    "Children's Play Area",
    "Lobby in Building",
    "Children's Pool",
    "Vastu-compliant"
  ],
  COMMERCIAL: [
    "Networked",
    "Covered Parking",
    "Shared Pool",
    "Shared Gym",
    "Dining in building",
    "Conference room",
    "Lobby in Building",
    "Vastu-compliant"
  ]
};

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditSimplePropertyPage() {
  const params = useParams();
  const { locale } = useDictionary();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyCategory: "RESIDENTIAL",
    propertyPlan: "READY",
    propertyType: "APARTMENT",
    propertyLocation: "",
    propertyPrice: "",
    propertyArea: "",
    propertyBedrooms: "1",
    propertyBathrooms: "1",
    propertyBuiltUpArea: "",
    propertyDescription: "",
    trakheesiNumber: "",
    // New fields for simple listing
    listingPurpose: "SALE",
    rentalPeriod: "PER_YEAR",
    whatsappNumber: "",
    permitNumber: "",
    referenceNumber: "",
    unitNumber: "",
    parkingSpaces: "0",
    furnishingStatus: "NOT_FURNISHED",
    availability: "Vacant"
  });

  
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [deletedDocs, setDeletedDocs] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [step, setStep] = useState(1);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const validateStep = (s: number): boolean => {
    setError(null);
    if (s === 1) {
      if (!formData.propertyTitle.trim()) { setError('Property title is required.'); return false; }
      if (!formData.listingPurpose) { setError('Listing purpose is required.'); return false; }
      if (!formData.propertyCategory) { setError('Category is required.'); return false; }
    }
    if (s === 2) {
      if (!formData.propertyLocation.trim()) { setError('Location is required.'); return false; }
      if (!formData.propertyPrice || Number(formData.propertyPrice) <= 0) { setError('A valid price is required.'); return false; }
      if (!formData.propertyArea || Number(formData.propertyArea) <= 0) { setError('A valid area is required.'); return false; }
      if (!formData.whatsappNumber.trim()) { setError('WhatsApp number is required.'); return false; }
      if (!formData.permitNumber.trim()) { setError('Trakheesi permit number is required.'); return false; }
      if (!formData.referenceNumber.trim()) { setError('Reference number is required.'); return false; }
      if (!formData.unitNumber.trim()) { setError('Unit number is required.'); return false; }
      if (!formData.propertyDescription.trim()) { setError('Description is required.'); return false; }
      if (amenities.length === 0) { setError('Please select at least one amenity.'); return false; }
    }
    return true;
  };

  const isStepValid = (s: number): boolean => {
    if (s < 1) return false;
    if (s >= 1 && (!formData.propertyTitle.trim() || !formData.listingPurpose || !formData.propertyCategory)) return false;
    if (s >= 2 && (!formData.propertyLocation.trim() || !formData.propertyPrice || !formData.propertyArea || !formData.whatsappNumber.trim() || !formData.permitNumber.trim() || !formData.referenceNumber.trim() || !formData.unitNumber.trim() || !formData.propertyDescription.trim() || amenities.length === 0)) return false;
    return true;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return;
      try {
        setIsFetching(true);
        const res = await api.get(`/seller/getEditSimpleListingDetails/${params.id}`);
        const data = res.data?.data || res.data;
        
        setFormData({
          propertyTitle: data.propertyTitle || "",
          propertyCategory: data.propertyCategory || "RESIDENTIAL",
          propertyPlan: data.propertyPlan || "READY",
          propertyType: data.propertyType || "APARTMENT",
          propertyLocation: data.propertyLocation || "",
          propertyPrice: data.propertyPrice?.amount?.toString() || data.propertyPrice?.toString() || "",
          propertyArea: data.propertyArea?.value?.toString() || data.propertyArea?.toString() || "",
          propertyBedrooms: data.propertyBedrooms?.toString() || "1",
          propertyBathrooms: data.propertyBathrooms?.toString() || data.propertyWashrooms?.toString() || "1",
          propertyBuiltUpArea: data.propertyBuiltUpArea?.toString() || "",
          propertyDescription: data.propertyDescription || "",
          trakheesiNumber: data.trakheesiNumber || data.permitNumber || "",
          // New fields
          listingPurpose: data.listingPurpose || "SALE",
          rentalPeriod: data.rentalPeriod || "PER_YEAR",
          whatsappNumber: data.whatsappNumber || "",
          permitNumber: data.permitNumber || "",
          referenceNumber: data.referenceNumber || "",
          unitNumber: data.unitNumber || "",
          parkingSpaces: data.parkingSpaces?.toString() || "0",
          furnishingStatus: data.furnishingStatus || "NOT_FURNISHED",
          availability: data.availability || "Vacant"
        });
        
        if (data.propertyAmenities) setAmenities(data.propertyAmenities);
        if (data.propertyImages) setExistingImages(data.propertyImages);
        if (data.propertyDocuments) setExistingDocs(data.propertyDocuments);
      } catch (err) {
        console.error("Failed to fetch property details", err);
        setError("Could not load property details. It might not exist or you don't have access.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProperty();
  }, [params.id]);

  

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      if (value !== "" && Number(value) < 0) {
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
    // Reset documents if category/plan/type changes to avoid orphaned files
    if (["propertyCategory", "propertyPlan", "propertyType"].includes(e.target.name)) {
      setDocuments({});
      if (e.target.name === "propertyCategory") {
        setAmenities([]);
      }
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleDocumentChange = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [docName]: e.target.files![0] }));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getExistingDoc = (docType: string) => {
    if (!existingDocs) return null;
    if (Array.isArray(existingDocs)) {
      return existingDocs.find((d: any) => d.type === docType || d.documentType === docType || d.name === docType);
    }
    return existingDocs[docType] || null;
  };

  const currentConfig = PROPERTY_DOC_CONFIG[formData.propertyCategory]?.[formData.propertyPlan]?.[formData.propertyType];
  const requiredDocs = currentConfig?.required || [];
  const minImages = currentConfig?.images?.min || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (images.length + existingImages.length < minImages) {
      setError(`Please upload at least ${minImages} images for this property type.`);
      setIsSubmitting(false);
      return;
    }
    if (amenities.length === 0) {
      setError("Please select at least one amenity.");
      setIsSubmitting(false);
      return;
    }
    for (const doc of requiredDocs) {
      const existing = getExistingDoc(doc);
      if (!documents[doc] && !existing) {
        setError(`Missing required document: ${doc}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = new FormData();
      
      // Basic text fields
      const allowedFields = [
        'propertyTitle', 'propertyCategory', 'propertyPlan', 'propertyType', 
        'propertyLocation', 'propertyDescription', 'trakheesiNumber',
        'listingPurpose', 'whatsappNumber', 'permitNumber', 'referenceNumber', 
        'unitNumber', 'furnishingStatus', 'availability'
      ];
      
      allowedFields.forEach(key => {
        if (formData[key as keyof typeof formData]) {
          payload.append(key, formData[key as keyof typeof formData] as string);
        }
      });

      payload.set('propertyPrice', formData.propertyPrice);
      payload.set('propertyArea', formData.propertyArea);
      payload.set('parkingSpaces', formData.parkingSpaces);

      // rentalPeriod is required only when listingPurpose is RENT
      if (formData.listingPurpose === 'RENT') {
        payload.set('rentalPeriod', formData.rentalPeriod);
      }

      // propertyBedrooms and propertyBathrooms: only allowed for APARTMENT or VILLA
      if (['APARTMENT', 'VILLA'].includes(formData.propertyType)) {
        if (formData.propertyBedrooms) payload.set('propertyBedrooms', formData.propertyBedrooms);
        if (formData.propertyBathrooms) payload.set('propertyBathrooms', formData.propertyBathrooms);
      }

      // propertyBuiltUpArea: only allowed for VILLA, LAND, BUILDING
      if (['VILLA', 'LAND', 'BUILDING'].includes(formData.propertyType) && formData.propertyBuiltUpArea) {
        payload.set('propertyBuiltUpArea', formData.propertyBuiltUpArea);
      }

      // Amenities array (Joi allows ["A", "B"] or repeated keys, we will send multiple keys)
      amenities.forEach(a => payload.append('propertyAmenities', a));

      // Append images
      images.forEach(img => {
        payload.append('propertyImages', img);
      });

      // Append required docs
      Object.entries(documents).forEach(([docName, file]) => {
        payload.append(docName, file);
      });

      payload.append('deletedImages', JSON.stringify(deletedImages));
      payload.append('imagesToRemove', JSON.stringify(deletedImages));
      payload.append('deletedDocs', JSON.stringify(deletedDocs));
      await api.patch(`/seller/editRejectedSimpleListing/${params.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard/seller/simple-listings`);
      }, 2000);
      
    } catch (err: any) {
      console.error("Failed to add property", err);
      setError(err.response?.data?.message || err.message || "An error occurred while adding the property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Property Re-submitted Successfully!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Your property has been re-submitted and is back under review.
        </p>
        <p className="text-sm font-semibold text-[#1A3626] dark:text-[#5CD284] animate-pulse">
          Redirecting you to your properties...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {isFetching ? (
        <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" /></div>
      ) : (
      <>
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Rejected Simple Listing</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Update your listing details to resolve the rejection issues and re-submit.</p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-[#1A3626] z-0">
            <div
              className="h-full bg-[#5CD284] transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
          </div>
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Details & Amenities' },
            { num: 3, label: 'Media & Docs' },
          ].map(({ num, label }) => (
            <div key={num} className="flex flex-col items-center z-10">
              <button
                type="button"
                onClick={() => { if (isStepValid(num - 1)) setStep(num); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  step === num
                    ? 'bg-[#5CD284] border-[#5CD284] text-white shadow-lg shadow-[#5CD284]/30 scale-110'
                    : isStepValid(num)
                    ? 'bg-[#1A3626] border-[#5CD284] text-white'
                    : 'bg-white dark:bg-[#102418] border-gray-300 dark:border-[#1A3626] text-gray-400'
                }`}
              >
                {isStepValid(num) && step > num ? 'âœ“' : num}
              </button>
              <span className={`mt-2 text-xs font-semibold ${step === num ? 'text-[#5CD284]' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 sm:mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-sm flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-white dark:bg-[#102418] p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626]">

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4">1. Basic Information</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Property Title *</label>
              <input required name="propertyTitle" value={formData.propertyTitle} onChange={handleChange} placeholder="e.g. Luxury 4BHK Villa in Palm Jumeirah" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Listing Purpose *</label>
                <select name="listingPurpose" value={formData.listingPurpose} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors">
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>
              {formData.listingPurpose === "RENT" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rental Period *</label>
                  <select name="rentalPeriod" value={formData.rentalPeriod} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors">
                    <option value="PER_YEAR">Per Year</option>
                    <option value="PER_MONTH">Per Month</option>
                    <option value="PER_WEEK">Per Week</option>
                    <option value="PER_DAY">Per Day</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select name="propertyCategory" value={formData.propertyCategory} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors">
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Completion Status</label>
                <select name="propertyPlan" value={formData.propertyPlan} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors">
                  <option value="READY">Ready</option>
                  <option value="OFF_PLAN">Off-Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors">
                  {formData.propertyCategory === 'RESIDENTIAL' ? (
                    <>
                      <option value="APARTMENT">Apartment</option>
                      <option value="VILLA">Villa</option>
                      {formData.propertyPlan === 'READY' && <option value="LAND">Land</option>}
                    </>
                  ) : (
                    <>
                      <option value="RETAIL">Retail</option>
                      {formData.propertyPlan === 'READY' && (
                        <>
                          <option value="OFFICES">Offices</option>
                          <option value="BUILDING">Building</option>
                        </>
                      )}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details, Pricing & Amenities */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4">2. Details &amp; Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                <input required name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} placeholder="e.g. Dubai Marina" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (AED) *</label>
                <input required type="number" name="propertyPrice" min="1" value={formData.propertyPrice} onChange={handleChange} placeholder="e.g. 1500000" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Area (sq.ft) *</label>
                <input required type="number" name="propertyArea" min="1" value={formData.propertyArea} onChange={handleChange} placeholder="e.g. 2500" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              {["VILLA", "LAND", "BUILDING"].includes(formData.propertyType) && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Built-up Area (sq.ft) *</label>
                  <input required type="number" name="propertyBuiltUpArea" min="1" value={formData.propertyBuiltUpArea} onChange={handleChange} placeholder="e.g. 2000" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
                </div>
              )}
              {["APARTMENT", "VILLA"].includes(formData.propertyType) && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                    <select name="propertyBedrooms" value={formData.propertyBedrooms} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] max-h-48 overflow-y-auto">
                      <option value="Studio">Studio</option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num.toString()}>{num} {num === 1 ? 'Bedroom' : 'Bedrooms'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bathrooms</label>
                    <select name="propertyBathrooms" value={formData.propertyBathrooms} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] max-h-48 overflow-y-auto">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num.toString()}>{num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number *</label>
                <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="e.g. +971501234567" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Trakheesi Permit Number *</label>
                <input required name="permitNumber" value={formData.permitNumber} onChange={handleChange} placeholder="e.g. 7123456789" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reference Number *</label>
                <input required name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} placeholder="e.g. REF-1234567890" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Unit Number *</label>
                <input required name="unitNumber" value={formData.unitNumber} onChange={handleChange} placeholder="e.g. Apartment 1402" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Parking Spaces *</label>
                <input required type="number" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleChange} placeholder="e.g. 1" min="0" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Furnishing Status *</label>
                <select name="furnishingStatus" value={formData.furnishingStatus} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors">
                  <option value="NOT_FURNISHED">Unfurnished</option>
                  <option value="SEMI">Semi-Furnished</option>
                  <option value="FULL">Fully Furnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Availability *</label>
                <input required name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Vacant, or Date" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <textarea required rows={4} name="propertyDescription" value={formData.propertyDescription} onChange={handleChange} placeholder="Describe your property..." className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] resize-none" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-2">Amenities *</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(AMENITIES_CONFIG[formData.propertyCategory] || AMENITIES_CONFIG.RESIDENTIAL).map(amenity => (
                  <label key={amenity} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-[#1A3626] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors">
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-[#1A3626] dark:text-[#5CD284] rounded focus:ring-[#5CD284]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media & Documents */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4">3. Media &amp; Documents</h2>

            {/* Images Upload */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Property Images <span className="text-gray-400 font-normal text-sm">(min {minImages})</span></h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-[#1A3626] rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#163321]/50 transition-colors" onClick={() => imageInputRef.current?.click()}>
                <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">Click to upload images</p>
                <p className="text-sm text-gray-500">Minimum {minImages} images required for {formData.propertyType}</p>
                <input type="file" multiple accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageChange} />
              </div>

              {(existingImages.filter(img => !deletedImages.includes(img._id || img.id || img.public_id)).length > 0 || images.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-4">
                  {existingImages
                    .filter(img => !deletedImages.includes(img._id || img.id || img.public_id))
                    .map((img, i) => {
                      const imgId = img._id || img.id || img.public_id;
                      const imgSrc = img.url || img;
                      return (
                        <div key={`existing-${imgId}-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-[#1A3626] group">
                          <Image src={imgSrc} alt="Existing Preview" fill className="object-cover" />
                          <span className="absolute bottom-1 left-1 bg-gray-900/70 dark:bg-black/70 text-[10px] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Existing</span>
                          <button type="button" onClick={() => setDeletedImages(prev => [...prev, imgId])} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}

                  {images.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-[#5CD284] group">
                      <Image src={URL.createObjectURL(file)} alt="New Preview" fill className="object-cover" />
                      <span className="absolute bottom-1 left-1 bg-[#1A3626] text-[10px] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">New</span>
                      <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {i > 0 && (
                          <button type="button" onClick={() => { setImages(prev => { const updated = [...prev]; const temp = updated[i]; updated[i] = updated[i - 1]; updated[i - 1] = temp; return updated; }); }} className="bg-black/60 text-white p-1 rounded-md hover:bg-black/80 cursor-pointer">
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {i < images.length - 1 && (
                          <button type="button" onClick={() => { setImages(prev => { const updated = [...prev]; const temp = updated[i]; updated[i] = updated[i + 1]; updated[i + 1] = temp; return updated; }); }} className="bg-black/60 text-white p-1 rounded-md hover:bg-black/80 cursor-pointer">
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Required Documents */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Required Documents</h3>
              {requiredDocs.length === 0 ? (
                <p className="text-gray-500">No documents required or unsupported configuration.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requiredDocs.map((doc: string) => {
                    const existing = getExistingDoc(doc);
                    const isRequired = !existing;
                    return (
                      <div key={doc} className="bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] p-4 rounded-xl flex flex-col justify-between">
                        <div className="mb-4">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {doc.replace(/([A-Z])/g, ' $1').trim()} {isRequired ? '*' : ''}
                          </label>
                          {existing && (
                            <div className="mb-3 p-2.5 bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-lg flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Already Uploaded</p>
                                <a href={existing.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A3626] dark:text-[#c9a14b] font-semibold hover:underline truncate block">
                                  {existing.fileName || 'View Document'}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                        {documents[doc] ? (
                          <div className="flex items-center justify-between bg-white dark:bg-[#102418] p-2.5 rounded-lg border border-[#5CD284]">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileIcon className="w-4 h-4 text-[#5CD284] flex-shrink-0" />
                              <span className="text-xs truncate">{documents[doc].name}</span>
                            </div>
                            <button type="button" onClick={() => { const newDocs = {...documents}; delete newDocs[doc]; setDocuments(newDocs); }} className="cursor-pointer">
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <input required={isRequired} type="file" accept=".pdf,image/*" onChange={(e) => handleDocumentChange(doc, e)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1A3626]/10 file:text-[#1A3626] dark:file:bg-[#c9a14b]/20 dark:file:text-[#c9a14b] hover:file:bg-[#1A3626]/20 cursor-pointer" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-[#1A3626]">
          <button
            type="button"
            onClick={() => { setError(null); setStep(s => s - 1); }}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            â† Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => { if (validateStep(step)) setStep(s => s + 1); }}
              className="px-8 py-3 bg-[#1A3626] dark:bg-[#5CD284] text-white dark:text-[#091711] font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                <>Save Changes <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          )}
        </div>

      </form>
      </>
      )}
    </div>
  );
}
