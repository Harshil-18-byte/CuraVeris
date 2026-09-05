"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ArrowRightLeft, Loader2, CheckCircle2, AlertTriangle, Building2 } from "lucide-react";
import { billsApi } from "@/lib/api";
import { BillSummary } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BillComparisonModalProps {
  bills: BillSummary[];
  isOpen: boolean;
  onClose: () => void;
}

export default function BillComparisonModal({
  bills,
  isOpen,
  onClose,
}: BillComparisonModalProps) {
  const completedBills = bills.filter((b) => b.processing_status === "COMPLETED");
  const [bill1Id, setBill1Id] = useState<string>(completedBills[0]?.id || "");
  const [bill2Id, setBill2Id] = useState<string>(completedBills[1]?.id || completedBills[0]?.id || "");

  const canCompare = Boolean(bill1Id && bill2Id && bill1Id !== bill2Id);

  const { data: comparisonData, isLoading, isError } = useQuery({
    queryKey: ["bills-compare", bill1Id, bill2Id],
    queryFn: () => billsApi.compare(bill1Id, bill2Id),
    enabled: canCompare && isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-black/[0.08] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DBF1F4] flex items-center justify-center text-[#43A8B2]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                Compare Hospital Bills
              </h2>
              <p className="text-xs text-[#606470]">
                Side-by-side forensic rate and overcharge comparison
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C93A4] hover:text-[#202128] hover:bg-[#F0F2F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedBills.length < 2 ? (
          <div className="py-12 text-center text-[#606470]">
            <p className="text-sm font-bold text-[#202128]">At least 2 completed bills are required</p>
            <p className="text-xs text-[#606470] mt-1 max-w-sm mx-auto">
              Please upload and audit at least two hospital bills to compare their charges and overcharge patterns.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#202128] mb-1.5">
                  Bill 1 (Baseline)
                </label>
                <select
                  value={bill1Id}
                  onChange={(e) => setBill1Id(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#202128] focus:border-[#43A8B2] outline-none"
                >
                  {completedBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.hospital_name || "Hospital"} — ₹{Number(b.total_billed_amount || 0).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202128] mb-1.5">
                  Bill 2 (Comparison)
                </label>
                <select
                  value={bill2Id}
                  onChange={(e) => setBill2Id(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#202128] focus:border-[#43A8B2] outline-none"
                >
                  {completedBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.hospital_name || "Hospital"} — ₹{Number(b.total_billed_amount || 0).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {bill1Id === bill2Id ? (
              <p className="text-xs text-amber-600 font-medium text-center">
                Please select two different bills to see the comparison.
              </p>
            ) : isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#606470]">
                <Loader2 className="w-6 h-6 animate-spin text-[#43A8B2]" />
                <span className="text-xs">Computing side-by-side audit metrics…</span>
              </div>
            ) : comparisonData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Bill 1 Card */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-[#43A8B2] uppercase tracking-wider">Bill 1</span>
                    <p className="font-heading font-bold text-sm text-[#202128] truncate mt-0.5">
                      {comparisonData.bill_1.hospital_name}
                    </p>
                    <p className="text-[11px] text-[#606470] mt-0.5">Date: {comparisonData.bill_1.date}</p>
                    
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#606470]">Total Billed:</span>
                        <span className="font-mono font-bold text-[#202128]">
                          {formatCurrency(Number(comparisonData.bill_1.total_billed))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#606470]">Overcharges:</span>
                        <span className="font-mono font-bold text-[#DC2626]">
                          {formatCurrency(Number(comparisonData.bill_1.overcharge))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#606470]">Violations:</span>
                        <span className="font-semibold text-[#202128]">
                          {comparisonData.bill_1.finding_count} items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bill 2 Card */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-[#43A8B2] uppercase tracking-wider">Bill 2</span>
                    <p className="font-heading font-bold text-sm text-[#202128] truncate mt-0.5">
                      {comparisonData.bill_2.hospital_name}
                    </p>
                    <p className="text-[11px] text-[#606470] mt-0.5">Date: {comparisonData.bill_2.date}</p>
                    
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#606470]">Total Billed:</span>
                        <span className="font-mono font-bold text-[#202128]">
                          {formatCurrency(Number(comparisonData.bill_2.total_billed))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#606470]">Overcharges:</span>
                        <span className="font-mono font-bold text-[#DC2626]">
                          {formatCurrency(Number(comparisonData.bill_2.overcharge))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#606470]">Violations:</span>
                        <span className="font-semibold text-[#202128]">
                          {comparisonData.bill_2.finding_count} items
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variance Summary */}
                <div className="p-4 rounded-2xl bg-[#DBF1F4]/40 border border-[#79C5CD]/30 space-y-2">
                  <p className="text-xs font-bold text-[#202128]">Comparison Summary</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[#202128]">
                    <div>
                      <span className="text-[#606470]">Billed Variance: </span>
                      <span className="font-mono font-bold">
                        {formatCurrency(Math.abs(Number(comparisonData.comparison.billed_difference)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#606470]">Overcharge Variance: </span>
                      <span className="font-mono font-bold text-[#DC2626]">
                        {formatCurrency(Math.abs(Number(comparisonData.comparison.overcharge_difference)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#606470]">Provider: </span>
                      <span className="font-semibold">
                        {comparisonData.comparison.same_hospital ? "Same Facility" : "Different Facilities"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
