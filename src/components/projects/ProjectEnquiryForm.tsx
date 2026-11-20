"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { useAuth } from "@/context/AuthContext";
import connectPublicService, { type PublicProjectUnit } from "@/services/connectPublicService";
import { apiErrorMessage } from "@/services/rtoService";

/** POST /projects/:ref/enquire → developer ke Enquiries inbox (CRM lead). Login user ke details pehle se bhare. */
export default function ProjectEnquiryForm({ projectRef, units = [] }: { projectRef: string; units?: PublicProjectUnit[] }) {
  const { dict } = useDictionary();
  const t = dict.projectsPage.enquiry;
  const { user } = useAuth();

  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.mobile || "");
  const [email, setEmail] = useState(user?.email || "");
  const [unitTypeId, setUnitTypeId] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [nationality, setNationality] = useState("");
  const [intent, setIntent] = useState<"" | "LIVE_IN" | "INVESTOR">("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const num = (v: string) => (v.replace(/\D/g, "") ? Number(v.replace(/\D/g, "")) : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError(t.nameRequired);
    if (phone.replace(/[^\d+]/g, "").length < 6) return setError(t.phoneRequired);
    const min = num(budgetMin), max = num(budgetMax);
    if (min != null && max != null && min > max) return setError(t.budgetInvalid);
    setBusy(true);
    try {
      const res = await connectPublicService.enquireProject(projectRef, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        unitTypeId: unitTypeId || null,
        budget: min != null || max != null ? { min, max } : null,
        nationality: nationality.trim() || null,
        intent: intent || null,
        message: message.trim() || null,
      });
      setDone(res?.message || t.success);
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="p-5 rounded-2xl bg-[#5CD284]/10 border border-[#5CD284]/30 flex items-start gap-3" role="status">
        <CheckCircle2 className="w-5 h-5 text-[#5CD284] shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{done}</p>
      </div>
    );
  }

  const input =
    "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0c1e14] border border-gray-200 dark:border-[#1A3626] text-sm text-gray-900 dark:text-white outline-none focus:border-[#5CD284] placeholder:text-gray-400";
  const label = "flex flex-col gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 min-w-0";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{t.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t.subtitle}</p>
      </div>
      <label className={label}>{t.name}<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className={input} /></label>
      <label className={label}>{t.phone}<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required className={input} dir="ltr" /></label>
      <label className={label}>{t.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} dir="ltr" /></label>
      {units.length > 0 && (
        <label className={label}>
          {t.unitType}
          <select value={unitTypeId} onChange={(e) => setUnitTypeId(e.target.value)} className={`${input} cursor-pointer`}>
            <option value="">{t.anyUnit}</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <label className={label}>{t.budgetMin}<input inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className={input} dir="ltr" /></label>
        <label className={label}>{t.budgetMax}<input inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className={input} dir="ltr" /></label>
      </div>
      <label className={label}>{t.nationality}<input value={nationality} onChange={(e) => setNationality(e.target.value)} className={input} /></label>
      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{t.intent}</legend>
        <div className="flex gap-2">
          {([["LIVE_IN", t.intentLive], ["INVESTOR", t.intentInvest]] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={intent === v}
              onClick={() => setIntent(intent === v ? "" : v)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                intent === v
                  ? "bg-[#1A3626] text-white border-[#1A3626] dark:bg-[#5CD284] dark:text-[#0A1C12] dark:border-[#5CD284]"
                  : "bg-white dark:bg-[#102418] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-[#1A3626]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>
      <label className={label}>{t.message}<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={2000} className={`${input} resize-none`} /></label>
      {error && <p role="alert" className="text-xs font-semibold text-rose-500">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 rounded-xl bg-[#5CD284] hover:bg-[#4ab872] text-[#0A1C12] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {busy ? t.sending : t.submit}
      </button>
    </form>
  );
}
