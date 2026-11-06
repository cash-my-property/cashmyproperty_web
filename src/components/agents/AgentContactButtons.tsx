"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import type { PublicAgent } from "@/services/connectPublicService";

/**
 * Agent ke Call / WhatsApp / Email buttons — backend 4832d23: GET /agents aur /agents/:id ab
 * `contact { phone, whatsapp, email }` bhejte hain (purani app jaisa; listing ke lead CTA se alag).
 * Jo field null ho uska button nahi dikhta; teeno null ho to kuch render nahi hota.
 */
export default function AgentContactButtons({
  contact,
  agentName,
  size = "sm",
}: {
  contact: PublicAgent["contact"];
  agentName: string;
  size?: "sm" | "lg";
}) {
  const { dict } = useDictionary();
  const t = dict.agentContact;
  if (!contact || (!contact.phone && !contact.whatsapp && !contact.email)) return null;

  const digits = (n: string) => n.replace(/[^\d]/g, "");
  const message = encodeURIComponent(t.whatsappMessage.replace("{name}", agentName));
  const base =
    size === "lg"
      ? "flex-1 basis-[100px] py-3 px-4 rounded-xl text-sm whitespace-nowrap"
      : "flex-1 py-2 px-2.5 rounded-lg text-[11px]";
  const btn = `${base} font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border`;
  const icon = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className="flex flex-wrap gap-2 w-full">
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className={`${btn} border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#163321]`}>
          <Phone className={icon} /> {t.call}
        </a>
      )}
      {contact.whatsapp && (
        <a
          href={`https://wa.me/${digits(contact.whatsapp)}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} border-[#25D366]/40 bg-[#25D366]/10 text-[#128C4A] dark:text-[#5CD284] hover:bg-[#25D366]/20`}
        >
          <MessageCircle className={icon} /> {t.whatsapp}
        </a>
      )}
      {contact.email && (
        <a
          href={`mailto:${contact.email}?subject=${encodeURIComponent(t.emailSubject)}`}
          className={`${btn} border-gray-200 dark:border-[#1A3626] text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#163321]`}
        >
          <Mail className={icon} /> {t.email}
        </a>
      )}
    </div>
  );
}
