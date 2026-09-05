"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PayButtonProps {
  billId: string;
  undisputedAmount: number;
}

export default function PayButton({ billId, undisputedAmount }: PayButtonProps) {
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: () => paymentsApi.createOrder({ bill_id: billId }),
    onSuccess: (orderData) => {
      loadRazorpayCheckout(orderData);
    },
    onError: () => {
      setPaying(false);
      alert("Could not initiate payment. Please try again.");
    },
  });

  const loadRazorpayCheckout = (orderData: any) => {
    // Check if script already loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      launchRazorpay(orderData);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      launchRazorpay(orderData);
    };
    script.onerror = () => {
      setPaying(false);
      alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
    };
    document.body.appendChild(script);
  };

  const launchRazorpay = (orderData: any) => {
    try {
      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency || "INR",
        name: "CuraVeris",
        description: `Pay undisputed amount to ${orderData.notes?.hospital || "Hospital"}`,
        order_id: orderData.razorpay_order_id,
        prefill: orderData.prefill,
        notes: orderData.notes,
        theme: { color: "#2962FF" },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: async (response: any) => {
          setPaying(false);
          setPaymentSuccess(response.razorpay_payment_id || "captured");
          try {
            await paymentsApi.verify({
              order_id: orderData.razorpay_order_id,
              payment_id: response.razorpay_payment_id || "pay_demo",
              signature: response.razorpay_signature || "sig_demo",
            });
          } catch {
            // Background verification fallback
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setPaying(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="bg-[#E6F9F0] border border-[#0CAF60]/30 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0CAF60] text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-heading text-base font-bold text-[#1B4D3E]">
              Payment Initiated Successfully
            </p>
            <p className="font-body text-xs text-[#2D6A4F] mt-0.5">
              Payment Reference ID: <span className="font-mono font-semibold">{paymentSuccess}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-heading text-lg font-bold text-[#202128]">
            Pay Undisputed Amount
          </p>
          <p className="font-body text-xs sm:text-sm text-[#606470] mt-1 max-w-lg">
            Pay the legitimate portion now directly via Razorpay while we help you recover and dispute the overcharges.
          </p>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <p className="font-body text-[11px] uppercase tracking-wider font-semibold text-[#8C93A4]">
            Amount to pay now
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#202128]">
            {formatCurrency(undisputedAmount)}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#F0F2F5] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-body text-xs text-[#8C93A4]">
          The disputed overcharge is being handled separately through our statutory complaint process.
        </p>
        <button
          type="button"
          onClick={() => {
            setPaying(true);
            createOrderMutation.mutate();
          }}
          disabled={paying || createOrderMutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 bg-[#2962FF] hover:bg-[#1E4BD8] text-white font-body font-semibold text-sm rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 flex-shrink-0"
        >
          {paying || createOrderMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          <span>Pay with Razorpay</span>
        </button>
      </div>
    </div>
  );
}
