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
      toast.success("Updated your financial estimate!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Could not update details. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tell us a bit about your finances"
      description="This helps us give you a more accurate estimate of how this bill affects your savings."
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
          label="Money in bank / Emergency savings (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 2,50,000"
          hint="Money in your bank account, fixed deposits, or emergency fund that you can use right away."
          error={errors.verified_savings?.message}
          {...register("verified_savings")}
        />

        <Input
          label="Health Insurance Coverage Limit (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 5,00,000"
          hint="The maximum amount your insurance will pay for this hospital stay."
          error={errors.insurance_coverage_claimed?.message}
          {...register("insurance_coverage_claimed")}
        />

        <Input
          label="Amount already paid to the hospital (₹)"
          type="number"
          leftAddon={<span className="text-xs font-semibold">₹</span>}
          placeholder="e.g. 0"
          hint="Any advance deposit or payment you have already made."
          error={errors.already_paid?.message}
          {...register("already_paid")}
        />

        <div className="flex gap-2 pt-3 border-t border-border-subtle">
          <Button type="button" variant="secondary" size="md" className="w-1/3" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="w-2/3" isLoading={isSubmitting}>
            Recalculate Estimate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
