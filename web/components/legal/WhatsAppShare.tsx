"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppShareProps {
  documentType: string;
  downloadUrl: string;
  hospitalName: string;
  overchargeAmount: string;
  className?: string;
}

export default function WhatsAppShare({
  documentType,
  downloadUrl,
  hospitalName,
  overchargeAmount,
  className = "",
}: WhatsAppShareProps) {
  const getMessage = () => {
    const messages: Record<string, string> = {
      HOSPITAL_COMPLAINT:
        `I have raised a formal complaint against ${hospitalName || "the hospital"} for overcharging me by ${overchargeAmount}. ` +
        `The complaint is based on a CuraVeris statutory audit and cites official government pricing caps. ` +
        `Here is the verified complaint letter: ${downloadUrl}`,
      ANTI_DETENTION:
        `We have served an emergency anti-detention legal notice on ${hospitalName || "the hospital"}. ` +
        `The notice cites the Consumer Protection Act and demands immediate unconditional discharge. ` +
        `Notice copy: ${downloadUrl}`,
      CONSUMER_COURT:
        `I have sent a consumer court legal notice to ${hospitalName || "the hospital"} ` +
        `for billing irregularities and overcharges of ${overchargeAmount}. ` +
        `Notice: ${downloadUrl}`,
      INSURANCE_OMBUDSMAN:
        `I have prepared a formal statutory complaint to the Insurance Ombudsman regarding unauthorized deductions by ${hospitalName || "the insurer"}. ` +
        `Petition: ${downloadUrl}`,
    };

    const text =
      messages[documentType] ||
      `My CuraVeris hospital bill audit found verified overcharges of ${overchargeAmount} at ${hospitalName || "the hospital"}. ` +
      `Audit & Legal Document: ${downloadUrl}`;

    return encodeURIComponent(text);
  };

  const handleShare = () => {
    const url = `https://wa.me/?text=${getMessage()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 h-9 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-body font-semibold text-xs rounded-lg transition-all shadow-xs hover:shadow ${className}`}
    >
      <MessageCircle size={15} strokeWidth={2.2} />
      <span>Share on WhatsApp</span>
    </button>
  );
}
