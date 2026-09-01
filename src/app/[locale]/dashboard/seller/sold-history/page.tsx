"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Loader2, 
  Building, 
  MapPin, 
  Eye, 
  Bed, 
  Bath, 
  Maximize, 
  X, 
  ShieldAlert, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

interface SoldHistoryItem {
  _id: string;
  status: string;
  displayStatus: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyDescription?: string;
  location?: string;
  basePrice?: {
    amount?: number;
    currency?: string;
  };
  offerPrice?: {
    amount?: number;
    currency?: string;
  };
  specs?: {
    beds?: number;
    washrooms?: number;
    area?: number;
    unit?: string;
  };
  thumbnail?: string;
  offerDate?: string;
  participantName?: string;
}

export default function SellerSoldHistoryPage() {
  const { locale } = useDictionary();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useSocket();

  const [historyItems, setHistoryItems] = useState<SoldHistoryItem[]>([]);
  const [pagination, setPagination] = useState<{ total?: number; page?: number; pages?: number; limit?: number }>({});
  const [viewModalItem, setViewModalItem] = useState<SoldHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const role = typeof user?.role === 'string' ? user.role.toLowerCase() : (user?.role as any)?.main?.toLowerCase() || "buyer";
  const userType = (user as any)?.sellerType?.toUpperCase() || (typeof user?.role === 'object' ? (user.role as any)?.type?.toUpperCase() : 'REGULAR');
  const isRegularSeller = role === 'seller' && userType !== 'SIMPLE';

  useEffect(() => {
    if (authLoading || !isRegularSeller) return;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        let url = `/seller/sold-history?page=${currentPage}&limit=8`;
        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`;
        }
        const response = await api.get(url);
        if (response.data?.success) {
          setHistoryItems(response.data?.data || []);
          if (response.data?.pagination) {
            setPagination(response.data.pagination);
          }
        }
      } catch (err: any) {
        addToast("Error", err.response?.data?.message || "Failed to load sold history records.", "warning");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, statusFilter, authLoading, isRegularSeller]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
      </div>
    );
  }

  // Access Control check
  if (!isRegularSeller) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[500px]">
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-[#1A3626] text-center max-w-lg w-full shadow-xl">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-sm">
            Sold History is exclusively available for Realtime Sellers. Simple Listing Sellers and Buyers cannot view auction deal histories.
          </p>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full py-3.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string, displayStatus?: string) => {
    const label = displayStatus || status || "Unknown";
    switch (status) {
      case "SOLD":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case "SOLD_FAIL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case "BID_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
            <Clock className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Sold & Deal History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Track your property sales, completed auctions, and received buyer offers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#102418] p-2 rounded-2xl border border-gray-100 dark:border-[#1A3626]">
        {[
          { id: "all", label: "All History" },
          { id: "SOLD", label: "Sold" },
          { id: "BID_RECEIVED", label: "Offers Received" },
          { id: "SOLD_FAIL", label: "Expired / Failed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              statusFilter === tab.id
                ? "bg-[#1A3626] text-white dark:bg-[#c9a14b] dark:text-[#091711] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#163321]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content List / Loading / Empty State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="bg-white dark:bg-[#102418] rounded-3xl p-12 border border-gray-100 dark:border-[#1A3626] text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#1A3626]/30 rounded-full flex items-center justify-center mb-6">
            <Building className="w-10 h-10 text-gray-400 dark:text-[#c9a14b]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Records Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm">
            {statusFilter === "all"
              ? "You don't have any past property sale history or active offer records yet."
              : `No property records found under the status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {historyItems.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#102418] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-[#1A3626] transition-all duration-300 flex flex-col p-2 group"
            >
              {/* Thumbnail */}
              <div className="relative h-[220px] overflow-hidden rounded-[20px] bg-gray-100 dark:bg-[#091711] w-full">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.propertyTitle || "Property"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {getStatusBadge(item.status, item.displayStatus)}
                </div>
              </div>

              {/* Info Container */}
              <div className="p-4 pt-4 flex flex-col flex-1">
                <h3 className="font-bold text-[18px] text-gray-900 dark:text-white leading-tight line-clamp-1 mb-1">
                  {item.propertyTitle || "Untitled Property"}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b] flex-shrink-0" />
                  <span className="line-clamp-1">{item.location || "Dubai, UAE"}</span>
                </p>

                {/* Pricing Details */}
                <div className="bg-gray-50 dark:bg-[#091711] p-3 rounded-xl space-y-1.5 mb-4 border border-gray-100 dark:border-[#1A3626]/50">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Base Price</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      AED {item.basePrice?.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                  {item.offerPrice?.amount ? (
                    <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-[#c9a14b]">
                      <span>Offer / Deal</span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-[#5CD284]">
                        <Dirham className="text-xs" /> {item.offerPrice.amount.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300 mb-4 px-1">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                    <span>{item.specs?.beds || 0} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                    <span>{item.specs?.washrooms || 0} Baths</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />
                    <span>{item.specs?.area || 0} {item.specs?.unit || "sqft"}</span>
                  </div>
                </div>

                {/* Buyer / Participant */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-[#1A3626] mt-auto mb-3">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300 font-medium">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {item.participantName || "No Bids"}
                  </span>
                  {item.offerDate ? (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.offerDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>

                {/* Action button */}
                <button
                  onClick={() => setViewModalItem(item)}
                  className="w-full py-2.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-[#163321] dark:hover:bg-[#1A3626] text-gray-800 dark:text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && (pagination.pages || 1) > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-[#1A3626]">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {pagination.pages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 rounded-xl border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= (pagination.pages || 1)}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 rounded-xl border border-gray-200 dark:border-[#1A3626] text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-[#1A3626]">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deal Record Details</h2>
                {getStatusBadge(viewModalItem.status, viewModalItem.displayStatus)}
              </div>
              <button
                onClick={() => setViewModalItem(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Image & Title */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {viewModalItem.thumbnail ? (
                  <div className="relative h-36 w-full sm:w-48 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={viewModalItem.thumbnail}
                      alt={viewModalItem.propertyTitle || "Property"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {viewModalItem.propertyTitle || "Untitled Property"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                    {viewModalItem.location || "N/A"}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Property ID: {viewModalItem.propertyId || "N/A"}
                  </p>
                </div>
              </div>

              {/* Detail Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-[#091711] p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Base Price</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    AED {viewModalItem.basePrice?.amount?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Offer / Final Deal Price</p>
                  <p className="font-bold text-emerald-600 dark:text-[#5CD284] text-sm">
                    {viewModalItem.offerPrice?.amount
                      ? `AED ${viewModalItem.offerPrice.amount.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Buyer / Participant</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {viewModalItem.participantName || "No Bids"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Bedrooms</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {viewModalItem.specs?.beds || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Washrooms</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {viewModalItem.specs?.washrooms || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Area</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {viewModalItem.specs?.area || "N/A"} {viewModalItem.specs?.unit || "sqft"}
                  </p>
                </div>
              </div>

              {viewModalItem.propertyDescription && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Property Description
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {viewModalItem.propertyDescription}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#091711] flex justify-end">
              <button
                onClick={() => setViewModalItem(null)}
                className="px-6 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
