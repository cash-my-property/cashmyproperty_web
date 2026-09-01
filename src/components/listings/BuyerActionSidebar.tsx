import { useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, FileText, Upload, AlertCircle, Loader2, ShieldAlert, Download } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface BuyerActionSidebarProps {
  auctionId: string;
  contractStatus: string;
  canBid: boolean;
  currentValue: number;
  onBidSuccess: () => void;
  onContractSubmitted: () => void;
  onBidOptimistic?: (amount: number) => void;
}

export default function BuyerActionSidebar({ auctionId, contractStatus, canBid, currentValue, onBidSuccess, onContractSubmitted, onBidOptimistic }: BuyerActionSidebarProps) {
  const { user } = useAuth();
  const [showVerificationError, setShowVerificationError] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [files, setFiles] = useState({
    signedContract: null as File | null,
    passportDocument: null as File | null,
    propertyCheque: null as File | null,
    propertyUndertakingLetter: null as File | null,
    buyerESignature: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const submitContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!files.signedContract || !files.passportDocument || !files.propertyCheque || !files.propertyUndertakingLetter || !files.buyerESignature) {
      setErrorMessage("Please upload all mandatory documents");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('auctionId', auctionId);
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      await api.post('/buyer/sign-contract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccessMessage("Contract submitted successfully!");
      setTimeout(() => onContractSubmitted(), 1500);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Failed to submit contract");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentValue) {
      setBidAmount(currentValue.toString());
    }
  }, [currentValue]);

  const placeBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && user.isVerified === false) {
      setShowVerificationError(true);
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
    
    const bidValue = Number(bidAmount);
    if (!bidAmount || isNaN(bidValue)) {
      setErrorMessage("Please enter a valid offer amount");
      return;
    }

    if (bidValue < currentValue) {
      setErrorMessage(`Offer cannot be lower than the current value of AED ${currentValue.toLocaleString()}`);
      return;
    }
    
    const maxAllowed = currentValue * 1.10;
    if (bidValue > maxAllowed) {
      setErrorMessage(`Offer cannot exceed 10% of the current value (Max: AED ${Math.floor(maxAllowed).toLocaleString()})`);
      return;
    }

    try {
      setIsBidding(true);
      if (onBidOptimistic) {
        onBidOptimistic(bidValue);
      }
      await api.post('/buyer/place-bid', { auctionId, bidAmount: bidValue });
      setSuccessMessage("Offer placed successfully!");
      setTimeout(() => onBidSuccess(), 1500);
    } catch (error: any) {
      if (onBidOptimistic) {
        onBidOptimistic(currentValue);
      }
      setErrorMessage(error.response?.data?.message || "Failed to place offer");
    } finally {
      setIsBidding(false);
    }
  };

  if (contractStatus === 'PENDING') {
    return (
      <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1A3626]">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <Clock className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contract Under Review</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Your purchase contract is currently pending admin approval. You will be able to place offers once approved.</p>
        </div>
      </div>
    );
  }

  if (canBid) {
    const maxAllowed = currentValue * 1.10;
    return (
      <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1A3626]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Place an Offer</h3>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-xl">
            {successMessage}
          </div>
        )}
        <form onSubmit={placeBid} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offer Amount (AED)</label>
            <input 
              type="number" 
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={currentValue}
              max={Math.floor(maxAllowed)}
              step="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#1A3626] bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1A3626] dark:focus:ring-[#c9a14b] outline-none"
              placeholder="Enter amount..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Max allowable offer: AED {Math.floor(maxAllowed).toLocaleString()} (+10%)
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isBidding}
            className="w-full py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold rounded-xl hover:bg-[#1A3626]/90 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isBidding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Make Offer'}
          </button>
        </form>
      </div>
    );
  }

  // State: NOT_SIGNED or REJECTED
  return (
    <div className="bg-white dark:bg-[#102418] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1A3626]">
      {contractStatus === 'REJECTED' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Contract Rejected</p>
            <p>Please review your documents and submit again.</p>
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sign Purchase Contract</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You must upload the following mandatory documents to submit offers on this property.</p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-xl">
          {successMessage}
        </div>
      )}

      <form onSubmit={submitContract} className="space-y-4">
        {[
          { key: 'signedContract', label: 'Signed Contract' },
          { key: 'passportDocument', label: 'Passport Document' },
          { key: 'propertyCheque', label: 'Property Cheque' },
          { 
            key: 'propertyUndertakingLetter', 
            label: 'Undertaking Letter',
            templateUrl: '/undertaking-letter.pdf'
          },
          { key: 'buyerESignature', label: 'E-Signature' }
        ].map(({ key, label, templateUrl }) => (
          <div key={key} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300">{label} *</label>
              {templateUrl && (
                <a
                  href={templateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="undertaking-letter.pdf"
                  className="text-xs text-[#1A3626] dark:text-[#c9a14b] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-[#1A3626] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A3626]/50 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 truncate max-w-[150px]">
                  {files[key as keyof typeof files]?.name || 'Choose File'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, key as keyof typeof files)}
                  accept=".pdf,image/*"
                />
              </label>
              {files[key as keyof typeof files] && <CheckCircle2 className="w-5 h-5 text-[#5CD284]" />}
            </div>
          </div>
        ))}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-6 py-3 bg-[#1A3626] dark:bg-[#c9a14b] text-white font-bold rounded-xl hover:bg-[#1A3626]/90 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}
