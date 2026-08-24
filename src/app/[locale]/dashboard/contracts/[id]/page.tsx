"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ArrowLeft, Loader2, FileText, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

export default function ContractDetailsPage() {
  const { locale } = useDictionary();
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useSocket();
  
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/buyer/my-contracts/${id}`);
        setContract(res.data.data);
      } catch {
        addToast("Error", "Failed to load contract details. Please try again.", "warning");
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
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contract Not Found</h2>
        <Link href={`/${locale}/dashboard/contracts`} className="mt-4 text-[#1A3626] dark:text-[#c9a14b] underline">
          Back to Contracts
        </Link>
      </div>
    );
  }

  const prop = contract.propertyId || {};
  const auc = contract.auctionId || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/dashboard/contracts`} className="p-2 bg-white dark:bg-[#102418] rounded-lg border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#1A3626]/50">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Contract Details
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Submission #{contract.submissionNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status & Information</h2>
            
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#091711] border border-gray-100 dark:border-[#1A3626]">
              <div className={`p-2 rounded-full ${
                contract.status === 'APPROVED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                contract.status === 'PENDING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {contract.status === 'APPROVED' && <CheckCircle2 className="w-6 h-6" />}
                {contract.status === 'PENDING' && <Clock className="w-6 h-6" />}
                {contract.status === 'REJECTED' && <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Status</p>
                <p className={`text-lg font-bold ${
                  contract.status === 'APPROVED' ? 'text-green-600 dark:text-green-400' :
                  contract.status === 'PENDING' ? 'text-blue-600 dark:text-blue-400' :
                  'text-red-600 dark:text-red-400'
                }`}>{contract.status}</p>
              </div>
            </div>

            {contract.status === 'REJECTED' && contract.rejectionInfo && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400">
                <p className="font-bold mb-1">Rejection Reason:</p>
                <p className="text-sm">{contract.rejectionInfo.reason}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-[#1A3626]">
                <span className="text-gray-500 dark:text-gray-400">Submitted On</span>
                <span className="font-medium text-gray-900 dark:text-white">{contract.createdAt ? new Date(contract.createdAt).toLocaleString('en-AE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-[#1A3626]">
                <span className="text-gray-500 dark:text-gray-400">Property Title</span>
                <span className="font-medium text-gray-900 dark:text-white">{prop.propertyTitle || (auc._id ? `Auction Offer #${auc._id.slice(-6).toUpperCase()}` : 'Purchase Contract')}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-500 dark:text-gray-400">Location</span>
                <span className="font-medium text-gray-900 dark:text-white">{prop.propertyLocation || (auc.status ? `Auction Status: ${auc.status}` : 'N/A')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submitted Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['signedContract', 'buyerESignature', 'propertyUndertakingLetter', 'propertyCheque', 'passportDocument', 'propertyEid_Visa', 'companyLicense'].map((docKey) => {
                const doc = contract[docKey];
                if (!doc || !doc.url) return null;
                return (
                  <a key={docKey} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#1A3626]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{docKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <Download className="w-4 h-4 text-[#1A3626] dark:text-[#c9a14b]" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden sticky top-24">
            <div className="aspect-[4/3] relative bg-gray-100 dark:bg-[#163321]">
              <Image src={prop.propertyImages?.[0]?.url || "/property-placeholder.svg"} alt="Property" fill className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{prop.propertyTitle || (auc._id ? `Auction Offer #${auc._id.slice(-6).toUpperCase()}` : 'Property')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{prop.propertyLocation || (auc.status ? `Auction Status: ${auc.status}` : '')}</p>
              
              {auc._id ? (
                <Link href={`/${locale}/auctions/${auc._id}`} className="block w-full py-3 px-4 bg-[#1A3626] dark:bg-[#c9a14b] text-white text-center rounded-xl font-bold hover:bg-[#1A3626]/90 transition-colors">
                  View Auction
                </Link>
              ) : (
                <Link href={`/${locale}/dashboard/contracts`} className="block w-full py-3 px-4 bg-gray-200 dark:bg-[#1A3626] text-gray-700 dark:text-white text-center rounded-xl font-bold hover:opacity-90 transition-colors">
                  Back to Contracts
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
