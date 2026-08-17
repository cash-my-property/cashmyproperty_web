"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Search, FileText, CheckCircle2, Clock, XCircle, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function ContractsPage() {
  const { dict, locale } = useDictionary();
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/buyer/my-contracts');
        setContracts(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch contracts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContracts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
          My Contracts
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your signed purchase contracts and view approval status.</p>
      </div>

      <div className="bg-white dark:bg-[#102418] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1A3626] overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mb-4 text-gray-300 dark:text-[#1A3626]" />
            <p>You have not signed any contracts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-[#102418]/50 border-b border-gray-100 dark:border-[#1A3626]">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1A3626]">
                {contracts.map((contract) => (
                  <tr key={contract.contractId} className="hover:bg-gray-50/50 dark:hover:bg-[#102418]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0">
                          <Image src={contract.property?.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} alt={contract.property?.title || 'Property'} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-[#1A3626] dark:group-hover:text-[#5CD284] transition-colors line-clamp-1">
                            {contract.property?.title || 'Unknown Property'}
                          </p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">Submission #{contract.submissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold uppercase ${
                        contract.status === 'APPROVED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        contract.status === 'PENDING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {contract.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {contract.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                        {contract.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                        {contract.status}
                      </span>
                      {contract.status === 'REJECTED' && contract.rejectionInfo?.reason && (
                        <p className="text-[11px] text-red-500 mt-1 max-w-[200px] truncate" title={contract.rejectionInfo.reason}>
                          {contract.rejectionInfo.reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/${locale}/listings/${contract.auction?.auctionId}`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1A3626] dark:text-[#c9a14b] hover:underline">
                        View Auction <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
