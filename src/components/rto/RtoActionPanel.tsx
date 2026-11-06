"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Building2, CheckCircle2, Clock, Eye, FileText, Loader2, Lock, ShieldCheck, Trophy, Upload, XCircle } from "lucide-react";
import Dirham from "@/components/Dirham";
import { useDictionary } from "@/components/DictionaryProvider";
import { useSocket } from "@/context/SocketContext";
import {
  rtoService,
  uploadRtoDocument,
  apiErrorMessage,
  type RtoContractInfo,
  type RtoDetail,
  type RtoLiveState,
  type RtoUploadedDoc,
} from "@/services/rtoService";

interface Props {
  detail: RtoDetail;
  live: RtoLiveState | null;
  isAuthenticated: boolean;
  /** CMP Connect team member (AGENT) — agency ya developer */
  isAgent: boolean;
  /** Agency ka member (DLD broker) — sirf yahi contract / offer kar sakta hai */
  isBroker: boolean;
  /** Logged-in agent ki company (apni agency ki property pehchanne ke liye) */
  myCompanyName?: string | null;
  /** Offer/contract ke baad detail + history + live dobara lao */
  onChanged: () => Promise<void> | void;
}

const FINAL = new Set(["SOLD", "NOT_SOLD", "ENDED"]);
const card = "bg-white dark:bg-[#102418] rounded-3xl border border-gray-100 dark:border-[#1A3626] shadow-sm p-6";

/**
 * Backend rule (cmp-server e26dade): Real Time Offer mein contract / offer sirf agency brokers
 * (AGENT + company AGENCY). Public buyers aur developer staff sirf dekh sakte hain, aur broker
 * apni hi agency ki property pe nahi (backend `can.*` false + 403).
 */
export default function RtoActionPanel({ detail, live, isAuthenticated, isAgent, isBroker, myCompanyName, onChanged }: Props) {
  const { dict } = useDictionary();
  const t = dict.rto;
  const pathname = usePathname();
  const status = live?.status || detail.status;
  const contractStatus = detail.myContract?.status;

  if (FINAL.has(status)) {
    const won = detail.myOffer?.status === "WON" || (detail.leading && status === "SOLD");
    return (
      <div className={card}>
        {status === "SOLD" ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{t.detail.soldFor}</p>
            <p className="text-3xl font-extrabold text-[#1A3626] dark:text-[#c9a14b] flex items-baseline gap-1">
              <Dirham /> {(live?.finalPrice ?? detail.finalPrice ?? detail.currentPrice).toLocaleString()}
            </p>
          </>
        ) : (
          <p className="text-gray-700 dark:text-gray-200 font-semibold">{t.detail.notSoldNote}</p>
        )}
        {detail.myOffer && (
          <div className={`mt-4 flex items-center gap-2 text-sm font-bold ${won ? "text-emerald-600" : "text-gray-500"}`}>
            {won ? <Trophy className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {won ? t.detail.won : t.detail.lost}
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={card}>
        <Lock className="w-8 h-8 text-[#1A3626] dark:text-[#c9a14b] mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.contract.loginTitle}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{t.contract.loginBody}</p>
        <Link
          href={`${pathname.split("/").slice(0, 2).join("/")}/login?next=${encodeURIComponent(pathname)}`}
          className="block text-center w-full py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm"
        >
          {t.contract.loginCta}
        </Link>
      </div>
    );
  }

  // Normal buyer: sirf dekh sakta hai — broker dhoondhne ka raasta do
  if (!isAgent) {
    return (
      <div className={card}>
        <Eye className="w-8 h-8 text-[#1A3626] dark:text-[#c9a14b] mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.contract.publicTitle}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{t.contract.publicBody}</p>
        <Link
          href={`${pathname.split("/").slice(0, 2).join("/")}/agents`}
          className="block text-center w-full py-3 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-bold text-sm"
        >
          {t.contract.findBroker}
        </Link>
      </div>
    );
  }

  // Developer ka staff broker nahi hota
  if (!isBroker) {
    return (
      <div className={`${card} flex gap-3`}>
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 dark:text-gray-200">{t.contract.developerBlocked}</p>
      </div>
    );
  }

  // Apni agency ki property: backend 4728f57 ka ownAgency flag (purane responses ke liye naam se fallback)
  const isOwnAgency =
    detail.ownAgency ??
    (!detail.myContract && !detail.can.signContract && !detail.can.placeOffer && !!myCompanyName && !!detail.company?.name &&
      myCompanyName.trim().toLowerCase() === detail.company.name.trim().toLowerCase());
  if (isOwnAgency) {
    return (
      <div className={`${card} flex gap-3`}>
        <Building2 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 dark:text-gray-200">{t.contract.ownAgency}</p>
      </div>
    );
  }

  if (contractStatus === "APPROVED" || detail.can.placeOffer) {
    return <OfferForm detail={detail} live={live} onChanged={onChanged} />;
  }

  if (contractStatus === "PENDING") {
    return (
      <div className={`${card} flex gap-3`}>
        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 dark:text-gray-200">{t.contract.pending}</p>
      </div>
    );
  }

  if (detail.can.signContract) {
    return <ContractForm detail={detail} onChanged={onChanged} />;
  }

  return (
    <div className={card}>
      <p className="text-sm text-gray-600 dark:text-gray-300">{t.contract.closed}</p>
    </div>
  );
}

/* ───────────────────────── Place offer ───────────────────────── */

function OfferForm({ detail, live, onChanged }: Pick<Props, "detail" | "live" | "onChanged">) {
  const { dict } = useDictionary();
  const t = dict.rto;
  const { addToast } = useSocket();
  const status = live?.status || detail.status;
  const current = live?.currentPrice ?? detail.currentPrice;
  const hasOffers = (live?.offers ?? detail.offers) > 0;
  // Offer current price se ZYADA honi chahiye (doc: minimumOffer se more than)
  const floor = Math.max(current, detail.minimumOffer || 0);
  const step = floor >= 10_000_000 ? 100_000 : floor >= 1_000_000 ? 10_000 : 5_000;
  const [amount, setAmount] = useState<string>("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myStatus = detail.myOffer?.status;
  const value = Number(amount.replace(/[^\d]/g, ""));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!value || value <= floor) {
      setError(`${t.offer.tooLow} ${floor.toLocaleString()}`);
      return;
    }
    setIsPlacing(true);
    try {
      const res = await rtoService.placeOffer(detail.id, value);
      addToast(t.offer.success, res.extended ? t.detail.extended : t.offer.successBody, "success");
      setAmount("");
      await onChanged();
    } catch (err) {
      const statusCode = (err as { response?: { status?: number } })?.response?.status;
      setError(statusCode === 409 ? t.offer.raced : apiErrorMessage(err));
      await onChanged(); // naya price dikhao
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-[#5CD284] text-sm font-bold">
        <ShieldCheck className="w-4 h-4" /> {t.contract.approved}
      </div>

      {myStatus && (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between gap-2 ${
            myStatus === "LEADING" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          <span>{myStatus === "LEADING" ? t.detail.leading : t.detail.outbid}</span>
          <span className="flex items-baseline gap-1"><Dirham /> {detail.myOffer!.amount.toLocaleString()}</span>
        </div>
      )}

      {status !== "ACTIVE" ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">{t.offer.notLive}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.offer.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.detail.minimumOffer} <span className="font-bold text-gray-800 dark:text-gray-200">AED {floor.toLocaleString()}</span>
          </p>
          <label className="text-xs font-bold text-gray-600 dark:text-gray-300" htmlFor="rto-amount">{t.offer.amountLabel}</label>
          <input
            id="rto-amount"
            inputMode="numeric"
            autoComplete="off"
            value={amount ? Number(amount.replace(/[^\d]/g, "") || 0).toLocaleString() : ""}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder={(floor + step).toLocaleString()}
            className="w-full bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white outline-none focus:border-[#5CD284]"
          />
          <div className="flex flex-wrap gap-2">
            {[1, 5, 10].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => setAmount(String(floor + step * mult))}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-[#163321] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1A3626] cursor-pointer"
              >
                +{(step * mult).toLocaleString()}
              </button>
            ))}
          </div>
          {!hasOffers && <p className="text-xs text-gray-500">{t.detail.noOffers}</p>}
          {error && <p role="alert" className="text-sm text-rose-600 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={isPlacing}
            className="w-full py-3.5 rounded-xl bg-[#5CD284] hover:bg-[#4cb870] text-[#0A1C12] font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isPlacing ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t.offer.placing}</>) : t.offer.submit}
          </button>
        </form>
      )}
    </div>
  );
}

/* ───────────────────────── Register (contract) ───────────────────────── */

function ContractForm({ detail, onChanged }: Pick<Props, "detail" | "onChanged">) {
  const { dict } = useDictionary();
  const t = dict.rto;
  const { addToast } = useSocket();
  const [info, setInfo] = useState<RtoContractInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [emiratesIdExpiry, setEmiratesIdExpiry] = useState("");
  const [brokerCardExpiry, setBrokerCardExpiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    rtoService
      .getContract(detail.id)
      .then((c) => !cancelled && setInfo(c))
      .catch((err) => !cancelled && setLoadError(apiErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [detail.id]);

  const accept = useMemo(() => (info?.rules.allowedFormats || ["pdf", "jpg", "jpeg", "png"]).map((f) => `.${f}`).join(","), [info]);

  const pick = (key: string, file: File | undefined) => {
    setError(null);
    if (!file || !info) return;
    const label = info.labels[key] || key;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!info.rules.allowedFormats.includes(ext)) return setError(`${label} ${t.contract.badFormat}`);
    if (file.size > info.rules.maxSizeBytes) {
      return setError(`${label} ${t.contract.tooLarge} (${Math.round(info.rules.maxSizeBytes / 1024 / 1024)} MB)`);
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;
    if (info.required.some((k) => !files[k])) return setError(t.contract.missing);
    setError(null);
    setIsSubmitting(true);
    try {
      const { document: sig } = await rtoService.getContractUploadSignature(detail.id);
      const entries = await Promise.all(
        Object.entries(files).map(async ([key, file]) => [key, await uploadRtoDocument(sig, file)] as [string, RtoUploadedDoc])
      );
      await rtoService.signContract(detail.id, {
        documents: Object.fromEntries(entries),
        ...(emiratesIdExpiry && { emiratesIdExpiry }),
        ...(brokerCardExpiry && { brokerCardExpiry }),
      });
      addToast(t.contract.title, t.contract.submitted, "success");
      await onChanged();
    } catch (err) {
      setError(apiErrorMessage(err, (err as Error)?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) return <div className={card}><p className="text-sm text-rose-600">{loadError}</p></div>;
  if (!info) {
    return (
      <div className={`${card} flex justify-center py-10`}>
        <Loader2 className="w-6 h-6 animate-spin text-[#1A3626] dark:text-[#c9a14b]" />
      </div>
    );
  }

  const row = (key: string, required: boolean) => {
    const file = files[key];
    return (
      <label
        key={key}
        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 cursor-pointer transition-colors ${
          file ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5" : "border-gray-200 dark:border-[#1A3626] hover:border-[#5CD284]"
        }`}
      >
        {file ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <FileText className="w-5 h-5 text-gray-400 shrink-0" />}
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-bold text-gray-800 dark:text-gray-100">
            {info.labels[key] || key}
            <span className={`ms-2 text-[10px] uppercase tracking-wider ${required ? "text-rose-500" : "text-gray-400"}`}>
              {required ? t.contract.required : t.contract.optional}
            </span>
          </span>
          {file && <span className="block text-[11px] text-gray-500 truncate">{file.name}</span>}
        </span>
        <span className="text-[11px] font-bold text-[#1A3626] dark:text-[#5CD284] shrink-0 flex items-center gap-1">
          <Upload className="w-3.5 h-3.5" /> {file ? t.contract.replace : t.contract.choose}
        </span>
        <input type="file" accept={accept} className="sr-only" onChange={(e) => pick(key, e.target.files?.[0])} disabled={isSubmitting} />
      </label>
    );
  };

  return (
    <form onSubmit={submit} className={`${card} flex flex-col gap-3`}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.contract.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 -mt-1">{t.contract.subtitle}</p>

      {info.status === "REJECTED" && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm">
          <p className="font-bold text-rose-700 dark:text-rose-300">{t.contract.rejected}</p>
          {info.rejectionReason && <p className="text-rose-700/90 dark:text-rose-200 mt-1">{info.rejectionReason}</p>}
          <p className="text-rose-700/80 dark:text-rose-200/80 mt-1 text-xs">{t.contract.rejectedHint}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {info.required.map((k) => row(k, true))}
        {info.optional.map((k) => row(k, false))}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {[
          { id: "eid", label: t.contract.emiratesIdExpiry, value: emiratesIdExpiry, set: setEmiratesIdExpiry },
          { id: "brk", label: t.contract.brokerCardExpiry, value: brokerCardExpiry, set: setBrokerCardExpiry },
        ].map((f) => (
          <label key={f.id} className="text-xs font-bold text-gray-600 dark:text-gray-300 flex flex-col gap-1">
            {f.label}
            <input
              type="date"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              disabled={isSubmitting}
              className="bg-gray-50 dark:bg-[#091711] border border-gray-200 dark:border-[#1A3626] rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white"
            />
          </label>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-rose-600 font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl bg-[#1A3626] dark:bg-[#c9a14b] text-white dark:text-[#1A3626] font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t.contract.uploading}</>) : t.contract.submit}
      </button>
      {info.submissionNumber > 0 && (
        <p className="text-[11px] text-gray-400 text-center">{t.contract.submission} #{info.submissionNumber + 1}</p>
      )}
    </form>
  );
}
