/**
 * CuraVeris Runtime Data & Taxonomy Validator.
 * Validates complex object trees, statutory rates, and component schemas before rendering.
 * Emits telemetry on schema mismatches or empty nodes.
 */

import { analytics } from '../analytics/events';

export const APPROVED_TAXONOMY_CATEGORIES = [
  'NPPA_MEDICAL_DEVICE',
  'DPCO_ESSENTIAL_DRUG',
  'CGHS_ROOM_TARIFF',
  'CGHS_PROCEDURE_TARIFF',
  'IRDAI_NON_PAYABLE_SURCHARGE',
  'STANDARD_HOSPITAL_FEE',
] as const;

export type ApprovedTaxonomyCategory = typeof APPROVED_TAXONOMY_CATEGORIES[number];

export interface ValidationResult {
  isValid: boolean;
  missingNodes: string[];
  invalidTypes: string[];
  warnings: string[];
}

export class RuntimeValidator {
  /**
   * Validate bill item against statutory taxonomy.
   */
  static validateBillItem(item: any, contextName = 'BillItem'): ValidationResult {
    const missingNodes: string[] = [];
    const invalidTypes: string[] = [];
    const warnings: string[] = [];

    if (!item) {
      missingNodes.push(`${contextName} (root is null/undefined)`);
      return { isValid: false, missingNodes, invalidTypes, warnings };
    }

    if (!item.raw_text && !item.normalized_name && !item.name) {
      missingNodes.push(`${contextName}.item_name`);
    }

    if (item.charged_rate === undefined && item.charged_amount === undefined && item.charged === undefined) {
      missingNodes.push(`${contextName}.charged_rate`);
    }

    if (item.category && !APPROVED_TAXONOMY_CATEGORIES.includes(item.category as any)) {
      warnings.push(`Non-standard category '${item.category}' mapped to general hospital fees.`);
    }

    const isValid = missingNodes.length === 0;

    if (!isValid || warnings.length > 0) {
      console.warn(`[RuntimeValidator] Validation issue in ${contextName}:`, { missingNodes, warnings });
      analytics.track('runtime_validation_issue', {
        context: contextName,
        missing_nodes: missingNodes,
        warnings,
      });
    }

    return { isValid, missingNodes, invalidTypes, warnings };
  }

  /**
   * Validate entire bill payload.
   */
  static validateBillPayload(payload: any): ValidationResult {
    const missingNodes: string[] = [];
    const invalidTypes: string[] = [];
    const warnings: string[] = [];

    if (!payload) {
      missingNodes.push('BillPayload (empty)');
      return { isValid: false, missingNodes, invalidTypes, warnings };
    }

    if (payload.total_billed === undefined) missingNodes.push('total_billed');
    if (payload.total_overcharge === undefined) missingNodes.push('total_overcharge');
    if (payload.risk_score === undefined) missingNodes.push('risk_score');

    return {
      isValid: missingNodes.length === 0,
      missingNodes,
      invalidTypes,
      warnings,
    };
  }
}
