"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Download, 
  Eye, 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  AlertTriangle, 
  Calendar, 
  X,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Award,
  Hash,
  Tag
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import Dirham from "@/components/Dirham";

interface DocumentItem {
  key: string;
  label: string;
  url: string;
}

export default function ContractDetailsPage() {
  const { locale } = useDictionary();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addToast } = useSocket();

  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [activePropertyImageIndex, setActivePropertyImageIndex] = useState(0);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/buyer/my-contracts/${id}`);
        setContract(res.data?.data || res.data);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Failed to load contract details. Please try again.";
        addToast("Error", errorMsg, "warning");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchContract();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-gray-100 dark:bg-[#102418] rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contract Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
          The contract record you are looking for does not exist or has been removed.
        </p>
        <Link
          href={`/${locale}/dashboard/contracts`}
          className="px-6 py-2.5 bg-[#1A3626] dark:bg-[#c9a14b] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Return to My Contracts
        </Link>
      </div>
    );
  }

  const prop = contract.propertyId || {};
  const auc = contract.auctionId || {};
  const rejectionReason = contract.rejectionReason || contract.rejectionInfo?.reason;
  const images = prop.propertyImages?.length > 0 ? prop.propertyImages.map((i: any) => i.url || i) : [];

  const docDefinitions: { key: string; label: string }[] = [
    { key: "signedContract", label: "Signed Contract" },
    { key: "buyerESignature", label: "E-Signature Document" },
    { key: "propertyUndertakingLetter", label: "Undertaking Letter" },
    { key: "propertyCheque", label: "Security Cheque" },
    { key: "passportDocument", label: "Passport Copy" },
    { key: "propertyEid_Visa", label: "Emirates ID / Visa" },
    { key: "companyLicense", label: "Company License" }
  ];

  const availableDocs: DocumentItem[] = docDefinitions
    .map(({ key, label }) => {
      const docObj = contract[key];
      const url = typeof docObj === "string" ? docObj : docObj?.url;
      return url ? { key, label, url } : null;
    })
    .filter(Boolean) as DocumentItem[];

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "ACCEPTED" || s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved / Accepted
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    }
    if (s === "PENDING_REVIEW" || s === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          Under Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        {status || "Draft"}
      </span>
    );
  };

  const isPdf = (url: string) => url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/pdf");

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/dashboard/contracts`}
            className="p-2.5 bg-white dark:bg-[#102418] rounded-xl border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#163321] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Contract Details
              </h1>
              {contract.contractId && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#1A3626]/10 dark:bg-[#c9a14b]/10 text-[#1A3626] dark:text-[#c9a14b] font-mono text-xs font-bold">
                  {contract.contractId}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
              Submission #{contract.submissionNumber || 1} • Ref ID: {contract._id}
            </p>
          </div>
        </div>

        <div>{getStatusBadge(contract.status)}</div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Overview, Rejection Alert, Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Overview & Dates */}
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626] shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
              Submission Timestamps & Contract Meta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-[#091711] p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626]/50">
              <div>
                <p className="text-xs text-gray-400 mb-1">Contract Code</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  {contract.contractId || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Signed Date</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {contract.signedAt
                    ? new Date(contract.signedAt).toLocaleString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Last Status Update</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {contract.updatedAt
                    ? new Date(contract.updatedAt).toLocaleString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Rejection Alert Banner */}
            {contract.status === "REJECTED" && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Submission Rejected
                </div>
                <p className="text-xs leading-relaxed">
                  {rejectionReason || "Your contract documents could not be verified by the admin team."}
                </p>
              </div>
            )}
          </div>

          {/* Submitted Documents Grid */}
          <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 border border-gray-100 dark:border-[#1A3626] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                Attached Contract Files ({availableDocs.length})
              </h2>
            </div>

            {availableDocs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No document files attached to this contract submission.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableDocs.map((doc) => (
                  <div
                    key={doc.key}
                    className="p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#091711] flex flex-col justify-between space-y-3 group hover:border-[#1A3626]/30 dark:hover:border-[#c9a14b]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {doc.label}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">
                            {isPdf(doc.url) ? "PDF Document" : "Image File"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-[#1A3626]">
                      <button
                        onClick={() => setPreviewDoc({ title: doc.label, url: doc.url })}
                        className="flex-1 py-1.5 text-xs font-semibold bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-[#163321] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-[#163321] transition-colors"
                        title="Download / Open file"
                      >
                        <Download className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Property Payload Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#102418] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#1A3626] shadow-sm sticky top-24">
            {/* Property Image Thumbnail */}
            <div className="relative h-48 w-full bg-gray-100 dark:bg-[#091711]">
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt={prop.propertyTitle || "Property"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              {prop.propertyType && (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                  {prop.propertyType}
                </div>
              )}
            </div>

            {/* Property Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {prop.propertyTitle || "Untitled Property"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b] flex-shrink-0" />
                  <span className="line-clamp-1">{prop.propertyLocation || "Dubai, UAE"}</span>
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="bg-gray-50 dark:bg-[#091711] p-3.5 rounded-2xl space-y-2 border border-gray-100 dark:border-[#1A3626]">
                {prop.propertyPrice?.amount ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Listed Price</span>
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Dirham className="text-xs" /> {prop.propertyPrice.amount.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                {auc.currentHighestBid ? (
                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-gray-200/50 dark:border-[#1A3626]">
                    <span className="text-gray-400">Winning / Final Deal Bid</span>
                    <span className="text-emerald-600 dark:text-[#5CD284] flex items-center gap-1">
                      <Dirham className="text-xs" /> {auc.currentHighestBid.toLocaleString()}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Specs */}
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 px-1">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                  <span>{prop.propertyBedrooms || 0} Beds</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                  <span>{prop.propertyWashrooms || prop.propertyBathrooms || 0} Baths</span>
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-[#1A3626] dark:text-[#c9a14b]" />
                  <span>{prop.propertyArea?.value || 0} {prop.propertyArea?.unit || "sqft"}</span>
                </div>
              </div>

              {/* View Full Details In-Page Modal Trigger */}
              <button
                onClick={() => setShowPropertyModal(true)}
                className="w-full py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white text-center rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> View Full Property Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-[#1A3626]">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                  Contract Property Details
                </h3>
              </div>
              <button
                onClick={() => setShowPropertyModal(null as any)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Image Carousel */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#091711]">
                    <Image
                      src={images[activePropertyImageIndex] || images[0]}
                      alt={prop.propertyTitle || "Property"}
                      fill
                      className="object-cover"
                    />

                    {images.length > 1 && (
                      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                        <button
                          onClick={() =>
                            setActivePropertyImageIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setActivePropertyImageIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails row */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActivePropertyImageIndex(idx)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                            activePropertyImageIndex === idx
                              ? "border-[#1A3626] dark:border-[#c9a14b]"
                              : "border-transparent opacity-60"
                          }`}
                        >
                          <Image src={img} alt="thumb" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Info Grid */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1A3626]/10 text-[#1A3626] dark:bg-[#c9a14b]/10 dark:text-[#c9a14b] uppercase">
                      {prop.propertyType || "PROPERTY"}
                    </span>
                    {auc.status && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase">
                        Auction Status: {auc.status}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prop.propertyTitle}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                    {prop.propertyLocation}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-[#091711] p-4 rounded-2xl border border-gray-100 dark:border-[#1A3626]">
                  <div>
                    <p className="text-xs text-gray-400">Listed Price</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      AED {prop.propertyPrice?.amount?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Final / Winning Bid</p>
                    <p className="font-bold text-emerald-600 dark:text-[#5CD284] text-sm">
                      AED {auc.currentHighestBid?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Area</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {prop.propertyArea?.value || 0} {prop.propertyArea?.unit || "sqft"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Bedrooms</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {prop.propertyBedrooms || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Washrooms</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {prop.propertyWashrooms || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Auction End Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                      {auc.endTime ? new Date(auc.endTime).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#091711] flex justify-end">
              <button
                onClick={() => setShowPropertyModal(false)}
                className="px-6 py-2.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#102418] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#1A3626]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1A3626] dark:text-[#c9a14b]" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#163321] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-[#091711] min-h-[400px]">
              {isPdf(previewDoc.url) ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[65vh] rounded-xl border border-gray-200 dark:border-[#1A3626]"
                  title={previewDoc.title}
                />
              ) : (
                <div className="relative max-h-[65vh] w-full flex items-center justify-center">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.title}
                    className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-[#1A3626] bg-gray-50 dark:bg-[#102418] flex justify-end gap-3">
              <a
                href={previewDoc.url}
                target="_blank"
                download
                className="px-5 py-2 bg-[#1A3626] dark:bg-[#c9a14b] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 bg-white dark:bg-[#163321] border border-gray-200 dark:border-[#1A3626] text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
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
