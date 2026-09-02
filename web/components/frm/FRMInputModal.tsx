"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const frmInputSchema = z.object({
  monthly_income: z.coerce
    .number()
    .min(1000, "Please enter your approximate monthly income"),
  monthly_expenses: z.coerce
    .number()
    .min(0, "Please enter your approximate monthly expenses"),
  verified_savings: z.coerce
    .number()
    .min(0, "Please enter your available savings"),
  insurance_coverage_claimed: z.coerce
    .number()
    .min(0, "Please enter your insurance coverage limit"),
  already_paid: z.coerce
    .number()
    .min(0, "Cannot be negative"),
});

type FRMInputFormData = z.infer<typeof frmInputSchema>;

interface FRMInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  billId: string;
  onSuccess: () => void;
}

export const FRMInputModal: React.FC<FRMInputModalProps> = ({
  isOpen,
  onClose,
  billId,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FRMInputFormData>({
    resolver: zodResolver(frmInputSchema),
    defaultValues: {
      monthly_income: 75000,
      monthly_expenses: 40000,
      verified_savings: 250000,
      insurance_coverage_claimed: 500000,
      already_paid: 0,
    },
  });

  const onSubmit = async (data: FRMInputFormData) => {
    try {
      await api.frm.startAssessment(billId, {
        monthly_income: data.monthly_income,
        monthly_expenses: data.monthly_expenses,
        verified_savings: data.verified_savings,
        insurance_coverage_claimed: data.insurance_coverage_claimed,
        already_paid: data.already_paid,
      });
      toast.success("Financial risk recalculated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update financial assessment.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalize Your Financial Risk"
      description="Enter your household finances to calculate your realistic out-of-pocket costs and emergency savings health."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Monthly Household Income (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 75,000"
          error={errors.monthly_income?.message}
          {...register("monthly_income")}
        />

        <Input
          label="Monthly Household Expenses (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 40,000"
          error={errors.monthly_expenses?.message}
          {...register("monthly_expenses")}
        />

        <Input
          label="Available Liquid Savings / Fixed Deposits (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 2,50,000"
          hint="Savings that can be accessed immediately for medical payments."
          error={errors.verified_savings?.message}
          {...register("verified_savings")}
        />

        <Input
          label="Health Insurance Sum Insured (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 5,00,000"
          error={errors.insurance_coverage_claimed?.message}
          {...register("insurance_coverage_claimed")}
        />

        <Input
          label="Amount Already Paid (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 0"
          hint="Any advance deposit or initial payment already made to the hospital."
          error={errors.already_paid?.message}
          {...register("already_paid")}
        />

        <div className="flex gap-2 pt-3 border-t border-border-subtle">
          <Button type="button" variant="secondary" size="md" className="w-1/3" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="w-2/3" isLoading={isSubmitting}>
            Calculate Risk
          </Button>
        </div>
      </form>
    </Modal>
  );
};
