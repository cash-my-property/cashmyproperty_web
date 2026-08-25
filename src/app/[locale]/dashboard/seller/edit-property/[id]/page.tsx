"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { Loader2, CheckCircle2, ArrowRight, UploadCloud, X, File as FileIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import Image from "next/image";

// Recreated Document Config from backend
const PROPERTY_DOC_CONFIG: any = {
  RESIDENTIAL: {
    READY: {
      APARTMENT: { images: { min: 8, max: 25 }, required: ["exclusiveContract", "propertyTitleDeed", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyFloorPlan", "propertyESignature"] },
      VILLA: { images: { min: 10, max: 25 }, required: ["exclusiveContract", "propertyTitleDeed", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyFloorPlan", "propertyESignature"] },
      LAND: { images: { min: 2, max: 10 }, required: ["exclusiveContract", "propertyTitleDeed", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyESignature"] }
    },
    OFF_PLAN: {
      APARTMENT: { images: { min: 4, max: 10 }, required: ["exclusiveContract", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "OqoodDocument", "spaDocument", "statementOfAccount", "propertyFloorPlan"] },
      VILLA: { images: { min: 4, max: 10 }, required: ["exclusiveContract", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "OqoodDocument", "spaDocument", "statementOfAccount", "propertyFloorPlan"] }
    }
  },
  COMMERCIAL: {
    READY: {
      RETAIL: { images: { min: 5, max: 25 }, required: ["exclusiveContract", "propertyTitleDeed", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyESignature"] },
      OFFICES: { images: { min: 5, max: 25 }, required: ["exclusiveContract", "propertyTitleDeed", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyESignature"] },
      BUILDING: { images: { min: 10, max: 25 }, required: ["exclusiveContract", "propertyTitleDeed", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyESignature"] }
    },
    OFF_PLAN: {
      RETAIL: { images: { min: 4, max: 10 }, required: ["exclusiveContract", "OqoodDocument", "propertyCheque", "propertyTrakheesi", "passportDocument", "propertyUndertakingLetter", "propertyESignature"] }
    }
  }
};

const AMENITIES = ["Balcony", "Central A/C", "Covered Parking", "Private Pool", "Shared Gym", "Security", "View of Water", "Children's Play Area"];

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditPropertyPage() {
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
    trakheesiNumber: ""
  });

  
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [deletedDocs, setDeletedDocs] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [documents, setDocuments] = useState<Record<string, File>>({});

  const imageInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return;
      try {
        setIsFetching(true);
        const res = await api.get(`/seller/rejectedPropertydetails/${params.id}`);
        const data = res.data?.data || res.data;
        
        console.log('DEBUG: API Response:', res);
        console.log('DEBUG: Extracted Data:', data);
        
        setFormData({
          propertyTitle: data.title || data.propertyTitle || '',
          propertyCategory: data.propertyCategory || 'RESIDENTIAL',
          propertyPlan: data.propertyPlan || 'READY',
          propertyType: data.propertyType || 'APARTMENT',
          propertyLocation: data.location || data.propertyLocation || '',
          propertyPrice: data.pricing?.price?.amount?.toString() || data.propertyPrice?.amount?.toString() || data.propertyPrice?.toString() || '',
          propertyArea: data.details?.area?.value?.toString() || data.propertyArea?.value?.toString() || data.propertyArea?.toString() || '',
          propertyBedrooms: data.details?.bedrooms?.toString() || data.propertyBedrooms?.toString() || '1',
          propertyBathrooms: data.details?.washrooms?.toString() || data.propertyBathrooms?.toString() || data.propertyWashrooms?.toString() || '1',
          propertyBuiltUpArea: data.builtUpArea?.toString() || data.propertyBuiltUpArea?.toString() || '',
          propertyDescription: data.description || data.propertyDescription || '',
          trakheesiNumber: data.trakheesiNumber || data.permitNumber || ''
        });
        
        if (data.propertyAmenities) setAmenities(data.propertyAmenities);
        if (data.images) setExistingImages(Array.isArray(data.images) ? data.images : [data.images]); else if (data.propertyImages) setExistingImages(data.propertyImages);
        if (data.documents) setExistingDocs(data.documents); else if (data.propertyDocuments) setExistingDocs(data.propertyDocuments);
      } catch (err) {
        console.error('Failed to fetch property details', err);
        setError('Could not load property details. It might not exist or you don\'t have access.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProperty();
  }, [params.id]);

  

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset documents if category/plan/type changes to avoid orphaned files
    if (["propertyCategory", "propertyPlan", "propertyType"].includes(e.target.name)) {
      setDocuments({});
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
      const hasExistingDoc = existingDocs.some(d => d.type === doc || d.documentType === doc);
      if (!documents[doc] && !hasExistingDoc) {
        setError(`Missing required document: ${doc}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = new FormData();
      
      // Basic text fields
      const allowedFields = ['propertyTitle', 'propertyCategory', 'propertyPlan', 'propertyType', 'propertyLocation', 'propertyDescription', 'trakheesiNumber'];
      
      allowedFields.forEach(key => {
        if (formData[key as keyof typeof formData]) {
          payload.append(key, formData[key as keyof typeof formData] as string);
        }
      });

      payload.set('propertyPrice', formData.propertyPrice);
      payload.set('propertyArea', formData.propertyArea);

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
      payload.append('deletedDocs', JSON.stringify(deletedDocs));
      await api.patch(`/seller/editRejectedProperty/${params.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard/seller/properties`);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Rejected Property</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Update your property details to resolve the rejection issues and re-submit.</p>
      </div>

      {error && (
        <div className="mb-6 sm:mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-sm flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-white dark:bg-[#102418] p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-[#1A3626]">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4">1. Basic Information</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Property Title *</label>
            <input required name="propertyTitle" value={formData.propertyTitle} onChange={handleChange} placeholder="e.g. Luxury 4BHK Villa in Palm Jumeirah" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Details & Pricing */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4 pt-4">2. Details & Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
              <input required name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} placeholder="e.g. Dubai Marina" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (AED) *</label>
              <input required type="number" name="propertyPrice" value={formData.propertyPrice} onChange={handleChange} placeholder="e.g. 1500000" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Trakheesi Number *</label>
              <input required type="number" name="trakheesiNumber" value={formData.trakheesiNumber} onChange={handleChange} placeholder="e.g. 12345678" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Area (sq.ft) *</label>
              <input required type="number" name="propertyArea" value={formData.propertyArea} onChange={handleChange} placeholder="e.g. 2500" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
            </div>
            {["VILLA", "LAND", "BUILDING"].includes(formData.propertyType) && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Built-up Area (sq.ft) *</label>
                <input required type="number" name="propertyBuiltUpArea" value={formData.propertyBuiltUpArea} onChange={handleChange} placeholder="e.g. 2000" className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]" />
              </div>
            )}
            {["APARTMENT", "VILLA"].includes(formData.propertyType) && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                  <select name="propertyBedrooms" value={formData.propertyBedrooms} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]">
                    <option value="Studio">Studio</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5+">5+ Bedrooms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bathrooms</label>
                  <select name="propertyBathrooms" value={formData.propertyBathrooms} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284]">
                    <option value="1">1 Bathroom</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="3">3 Bathrooms</option>
                    <option value="4">4 Bathrooms</option>
                    <option value="5+">5+ Bathrooms</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
            <textarea required rows={4} name="propertyDescription" value={formData.propertyDescription} onChange={handleChange} placeholder="Describe your property..." className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#5CD284] resize-none" />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4 pt-4">3. Amenities *</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMENITIES.map(amenity => (
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

        {/* Images Upload */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4 pt-4">4. Property Images</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-[#1A3626] rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#163321]/50 transition-colors" onClick={() => imageInputRef.current?.click()}>
            <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">Click to upload images</p>
            <p className="text-sm text-gray-500">Minimum {minImages} images required for {formData.propertyType}</p>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={imageInputRef} 
              className="hidden" 
              onChange={handleImageChange}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-4">
              {images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-[#1A3626] group">
                  <Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Required Documents Upload */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#1A3626] pb-4 pt-4">5. Required Documents</h2>
          
          {requiredDocs.length === 0 ? (
            <p className="text-gray-500">No documents required or unsupported configuration.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requiredDocs.map((doc: string) => (
                <div key={doc} className="bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] p-4 rounded-xl">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {doc.replace(/([A-Z])/g, ' $1').trim()} *
                  </label>
                  {documents[doc] ? (
                    <div className="flex items-center justify-between bg-white dark:bg-[#102418] p-2 rounded-lg border border-[#5CD284]">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon className="w-4 h-4 text-[#5CD284] flex-shrink-0" />
                        <span className="text-xs truncate">{documents[doc].name}</span>
                      </div>
                      <button type="button" onClick={() => {
                        const newDocs = {...documents};
                        delete newDocs[doc];
                        setDocuments(newDocs);
                      }}>
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <input 
                      required
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={(e) => handleDocumentChange(doc, e)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1A3626]/10 file:text-[#1A3626] dark:file:bg-[#c9a14b]/20 dark:file:text-[#c9a14b] hover:file:bg-[#1A3626]/20 cursor-pointer"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-10 py-4 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting Property...
              </>
            ) : (
              <>
                Submit for Approval <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>
    </>
      )}
    </div>
  );
}
