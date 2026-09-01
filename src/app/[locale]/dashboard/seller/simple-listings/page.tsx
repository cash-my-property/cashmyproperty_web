"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, Building, MapPin, Eye, Edit, Bed, Bath, Maximize, X, Lock, ArrowRight, Share2, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { generateShareToken } from "@/lib/shareToken";

export default function MySimpleListingsPage() {
  const { dict, locale } = useDictionary();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useSocket();
  const [properties, setProperties] = useState<any[]>([]);
  const [showVerificationError, setShowVerificationError] = useState(false);
  const [viewModalProperty, setViewModalProperty] = useState<any | null>(null);
  const [editModalProperty, setEditModalProperty] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleShareProperty = (property: any) => {
    const propId = property._id || property.propertyId || property.id;
    const token = generateShareToken(propId, user?._id);
    const shareUrl = `${window.location.origin}/${locale}/simple-listings/${propId}?st=${token}`;

    if (navigator.share) {
      navigator.share({ title: property.title || "Property Listing", url: shareUrl }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      addToast("Link Copied", "Shareable property link with access token copied to clipboard!", "success");
    }
  };

  const fetchProperties = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      let url = `/seller/mySimpleListings?page=${pageNum}&limit=10&sortBy=${sortBy}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const response = await api.get(url);
      const resData = response.data?.result || response.data;
      const newItems = resData?.data || [];

      const paginationObj = resData?.pagination || response.data?.pagination || response.data?.result?.pagination;
      const calculatedTotalPages = paginationObj?.totalPages
        ? Number(paginationObj.totalPages)
        : paginationObj?.total
        ? Math.ceil(Number(paginationObj.total) / 10)
        : 1;

      setTotalPages(calculatedTotalPages);
      setCurrentPage(pageNum);
      setHasMore(pageNum < calculatedTotalPages);

      if (append) {
        setProperties(prev => [
          ...prev,
          ...newItems.filter((item: any) => !prev.some(p => (p._id || p.id) === (item._id || item.id)))
        ]);
      } else {
        setProperties(newItems);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to load your listings. Please try refreshing.";
      addToast("Error", errorMsg, "warning");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProperties(1, false);
  }, [statusFilter, sortBy]);

  const loadNextPage = () => {
    if (isFetchingMore || isLoading || !hasMore) return;
    fetchProperties(currentPage + 1, true);
  };

  // Scroll listener for Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingMore || isLoading || !hasMore) return;
      const scrollHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;
      if (currentScroll >= scrollHeight - 600) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, hasMore, isFetchingMore, isLoading]);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Simple Listings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all the properties you have added</p>
        </div>
        <button 
          onClick={() => {
            if (user && user.isVerified === false) {
              setShowVerificationError(true);
            } else {
              router.push(`/${locale}/dashboard/seller/add-simple-property`);
            }
          }}
          className="bg-[#1A3626] dark:bg-[#c9a14b] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#1A3626]/90 transition-colors cursor-pointer"
        >
          Add New Property
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#5CD284]" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 border border-gray-100 dark:border-[#1A3626] text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#1A3626]/30 rounded-full flex items-center justify-center mb-6">
            <Building className="w-10 h-10 text-gray-400 dark:text-[#c9a14b]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Properties Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">You haven't added any properties to the platform yet. Add your first property to start receiving offers.</p>
          <button 
            onClick={() => {
              if (user && user.isVerified === false) {
                setShowVerificationError(true);
              } else {
                router.push(`/${locale}/dashboard/seller/add-simple-property`);
              }
            }}
            className="bg-[#1A3626] dark:bg-[#c9a14b] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#1A3626]/90 transition-colors cursor-pointer"
          >
            Add New Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id || property.id} className="bg-white dark:bg-[#102418] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#1A3626] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-48 w-full bg-gray-100 dark:bg-[#091711]">
                {property.image ? (
                  <Image 
                    src={property.image} 
                    alt={property.title || "Property"} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-300 dark:text-[#1A3626]" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handleShareProperty(property)}
                    className="w-8 h-8 bg-white/90 dark:bg-[#102418]/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 dark:text-[#c9a14b] shadow-md hover:scale-105 transition-all"
                    title="Share Private Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    property.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                    property.status === 'PENDING' || property.status === 'AWAITING' ? 'bg-orange-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {property.status || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">{property.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{property.location}</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300 mb-4">
                    {property.specs?.beds && (
                      <span className="flex items-center gap-1"><Bed className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {property.specs.beds} Beds</span>
                    )}
                    {property.specs?.washrooms && (
                      <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {property.specs.washrooms} Baths</span>
                    )}
                    {property.area?.value && (
                      <span className="flex items-center gap-1"><Maximize className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" /> {property.area.value} sqft</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#1A3626] flex items-center justify-between">
                  <div className="text-[#1A3626] dark:text-[#c9a14b] font-bold text-lg">
                    <Dirham className="mr-1 text-sm" />
                    {property.price?.amount?.toLocaleString() || 0}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewModalProperty(property)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditModalProperty(property)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                      title="Edit Property"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION / INFINITE SCROLL LOADER */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center my-8 gap-3">
          <button
            onClick={loadNextPage}
            disabled={isFetchingMore}
            className="px-8 py-3.5 rounded-2xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading More Listings...</span>
              </>
            ) : (
              <>
                <span>Load More Listings</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          <span className="text-xs text-gray-500 font-medium">Showing page {currentPage} of {totalPages}</span>
        </div>
      )}

      {/* View Property Modal */}
      {viewModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-[#1A3626]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Details</h2>
              <button onClick={() => setViewModalProperty(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {viewModalProperty.image ? (
                  <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden shadow-sm">
                    <Image 
                      src={viewModalProperty.image} 
                      alt={viewModalProperty.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{viewModalProperty.title}</h3>
                  <p className="text-[#1A3626] dark:text-[#5CD284] text-xl font-bold">AED {viewModalProperty.price?.amount?.toLocaleString() || 0}</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-[#163321]/50 p-4 rounded-2xl">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{viewModalProperty.status || "PENDING"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Property ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{viewModalProperty.propertyId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{viewModalProperty.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{viewModalProperty.area?.value || 0} {viewModalProperty.area?.unit || "sqft"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{viewModalProperty.specs?.beds || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Washrooms</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{viewModalProperty.specs?.washrooms || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date Added</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{new Date(viewModalProperty.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {viewModalProperty.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#091711] flex justify-end">
              <button 
                onClick={() => setViewModalProperty(null)}
                className="px-6 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 p-8 text-center border border-gray-100 dark:border-[#1A3626]">
            <div className="w-20 h-20 bg-gray-50 dark:bg-[#163321] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{dict.dashboard.seller.cannotEditListingTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mb-3 ${
                editModalProperty.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' :
                editModalProperty.status === 'PENDING' || editModalProperty.status === 'AWAITING' ? 'bg-orange-500/10 text-orange-600' :
                'bg-gray-500/10 text-gray-600'
              }`}>{editModalProperty.status}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
              {editModalProperty.status === 'ACTIVE'
                ? dict.dashboard.seller.activeLockDesc
                : editModalProperty.status === 'PENDING' || editModalProperty.status === 'AWAITING'
                ? dict.dashboard.seller.pendingLockDesc
                : dict.dashboard.seller.rejectedLockDesc}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}/dashboard/seller/rejected-simple-properties`}
                className="w-full py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={() => setEditModalProperty(null)}
              >
                {dict.dashboard.seller.viewRejectedSimple} <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setEditModalProperty(null)}
                className="w-full py-3 bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                {dict.dashboard.seller.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Error Modal */}
      {showVerificationError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 p-8 text-center border border-gray-100 dark:border-[#1A3626]">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-orange-500 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verification Pending</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Your account is currently under review. You will be able to add properties once an administrator verifies your account. Thank you for your patience!
            </p>
            <button 
              onClick={() => setShowVerificationError(false)}
              className="w-full py-3.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:bg-[#1A3626]/90 transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
