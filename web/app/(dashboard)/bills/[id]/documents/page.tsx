'use client'
import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { legalDocsApi } from '@/lib/api'
import {
  FileText, Download, Plus, CheckCircle,
  AlertCircle, Clock, ChevronDown, ChevronUp,
  ExternalLink
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

const DOC_DESCRIPTIONS: Record<string, string> = {
  HOSPITAL_COMPLAINT: 'A formal letter to hospital management citing the exact overcharges and demanding a refund within 15 days.',
  ANTI_DETENTION: 'A legal notice citing the Consumer Protection Act and IPC that demands immediate discharge of a medically fit patient being held over a billing dispute.',
  INSURANCE_DISPUTE: 'A formal dispute letter to your insurance company or TPA challenging claim rejection or disallowance.',
  OMBUDSMAN_PETITION: 'A complete petition to the Insurance Ombudsman — a free government service for resolving insurance disputes.',
  CONSUMER_COURT: 'A legal notice to be sent before filing a consumer complaint. Free to file for claims up to ₹5 lakhs.',
  CGHS_GRIEVANCE: 'A grievance petition for central government employees to file with the CGHS office against an empanelled hospital.',
}

const WHEN_TO_USE: Record<string, string> = {
  HOSPITAL_COMPLAINT: 'Use this first. Send it to the hospital before escalating anywhere else.',
  ANTI_DETENTION: 'Use this immediately if the hospital is refusing to discharge a medically fit patient.',
  INSURANCE_DISPUTE: 'Use this if your insurance company has rejected or underpaid your claim.',
  OMBUDSMAN_PETITION: 'Use this if your insurer has not resolved your dispute within 30 days.',
  CONSUMER_COURT: 'Use this if the hospital has not responded to your formal complaint within 15 days.',
  CGHS_GRIEVANCE: 'Use this if you are a central government employee treated at a CGHS empanelled hospital.',
}

interface ExtraInputsFormProps {
  docType: string
  onSubmit: (inputs: Record<string, string>) => void
  isLoading: boolean
  billData: any
}

function ExtraInputsForm({ docType, onSubmit, isLoading, billData }: ExtraInputsFormProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({
    patient_address: '',
    patient_city: '',
    hospital_address: '',
  })

  const update = (key: string, value: string) =>
    setInputs(prev => ({ ...prev, [key]: value }))

  const fields: Record<string, Array<{ key: string; label: string; placeholder: string; required?: boolean }>> = {
    HOSPITAL_COMPLAINT: [
      { key: 'patient_address', label: 'Your full address', placeholder: 'House/flat, street, city, PIN', required: true },
      { key: 'patient_city', label: 'Your city', placeholder: 'City name', required: true },
      { key: 'hospital_address', label: 'Hospital full address', placeholder: 'Hospital address' },
    ],
    ANTI_DETENTION: [
      { key: 'patient_address', label: 'Your full address', placeholder: 'House/flat, street, city, PIN', required: true },
      { key: 'patient_city', label: 'City', placeholder: 'City name', required: true },
      { key: 'relationship', label: 'Your relationship to the patient', placeholder: 'e.g. Son, Daughter, Spouse', required: true },
    ],
    INSURANCE_DISPUTE: [
      { key: 'insurer_name', label: 'Insurance company name', placeholder: 'e.g. Star Health, HDFC Ergo', required: true },
      { key: 'policy_number', label: 'Policy number', placeholder: 'Your policy number', required: true },
      { key: 'claim_number', label: 'Claim number (if available)', placeholder: 'Leave blank if not assigned yet' },
      { key: 'patient_address', label: 'Your address', placeholder: 'Full address', required: true },
      { key: 'patient_city', label: 'City', placeholder: 'City name', required: true },
    ],
    OMBUDSMAN_PETITION: [
      { key: 'insurer_name', label: 'Insurance company name', placeholder: 'e.g. Star Health', required: true },
      { key: 'policy_number', label: 'Policy number', placeholder: 'Your policy number', required: true },
      { key: 'claim_number', label: 'Claim number', placeholder: 'From insurer' },
      { key: 'ombudsman_jurisdiction', label: 'Your state (for Ombudsman office)', placeholder: 'e.g. Maharashtra', required: true },
      { key: 'patient_address', label: 'Your address', placeholder: 'Full address', required: true },
      { key: 'patient_city', label: 'City', placeholder: 'City name', required: true },
      { key: 'diagnosis', label: 'Main diagnosis / reason for hospitalisation', placeholder: 'e.g. Cardiac bypass surgery' },
    ],
    CONSUMER_COURT: [
      { key: 'patient_address', label: 'Your full address', placeholder: 'Full address', required: true },
      { key: 'patient_city', label: 'City (District Consumer Forum location)', placeholder: 'City', required: true },
      { key: 'hospital_address', label: 'Hospital address', placeholder: 'Hospital full address' },
    ],
    CGHS_GRIEVANCE: [
      { key: 'cghs_card_number', label: 'CGHS Card Number', placeholder: 'Your CGHS card number', required: true },
      { key: 'cghs_office_city', label: 'City of CGHS Wellness Centre', placeholder: 'City', required: true },
      { key: 'office_name', label: 'Your Ministry / Department', placeholder: 'e.g. Ministry of Railways', required: true },
      { key: 'employee_id', label: 'Employee ID', placeholder: 'Your employee ID', required: true },
      { key: 'patient_address', label: 'Your address', placeholder: 'Full address', required: true },
      { key: 'patient_city', label: 'City', placeholder: 'City', required: true },
    ],
  }

  const currentFields = fields[docType] || fields['HOSPITAL_COMPLAINT']

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-ink-secondary">
        We need a few details to complete your document. All other information
        is automatically taken from your bill and audit.
      </p>
      {currentFields.map(field => (
        <div key={field.key}>
          <label className="font-body text-xs font-medium text-ink-secondary block mb-1.5">
            {field.label}
            {field.required && <span className="text-danger ml-1">*</span>}
          </label>
          <input
            type="text"
            value={inputs[field.key] || ''}
            onChange={e => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full h-10 px-3 bg-surface border border-line-default rounded font-body text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-line-focus focus:ring-[3px] focus:ring-rzp-blue/10 transition-all duration-120"
          />
        </div>
      ))}
      <button
        onClick={() => onSubmit(inputs)}
        disabled={isLoading}
        className="w-full h-11 bg-rzp-blue text-white font-body font-semibold text-sm rounded transition-all duration-120 hover:bg-rzp-blue-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating your document...
          </>
        ) : (
          <>
            <FileText size={16} strokeWidth={1.75} />
            Create This Letter
          </>
        )}
      </button>
    </div>
  )
}

export default function LegalDocumentsPage({ params }: PageProps) {
  const { id: billId } = use(params)
  const queryClient = useQueryClient()
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [generatingType, setGeneratingType] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['legal-docs', billId],
    queryFn: () => legalDocsApi.list(billId),
  })

  const generateMutation = useMutation({
    mutationFn: ({ docType, inputs }: { docType: string; inputs: Record<string, string> }) =>
      legalDocsApi.generate(billId, { document_type: docType, ...inputs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-docs', billId] })
      setGeneratingType(null)
      setExpandedType(null)
    },
    onError: () => {
      setGeneratingType(null)
    },
  })

  const downloadMutation = useMutation({
    mutationFn: (docId: string) => legalDocsApi.getDownloadUrl(docId),
    onSuccess: (data) => {
      window.open(data.download_url, '_blank')
    },
  })

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-surface border border-line-subtle rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const documents = data?.documents || []

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-ink-primary">
          Complaint Letters & Notices
        </h1>
        <p className="font-body text-base text-ink-secondary mt-2">
          These documents are generated from your audit results and are ready to send.
          Start with the hospital complaint letter before escalating.
        </p>
      </div>

      <div className="space-y-3">
        {documents.map((doc: any) => {
          const isExpanded = expandedType === doc.document_type
          const isReady = doc.status === 'READY' || doc.status === 'DOWNLOADED'
          const isGenerating = generatingType === doc.document_type && generateMutation.isPending

          return (
            <div
              key={doc.document_type}
              className="bg-surface border border-line-subtle rounded-lg shadow-card overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isReady ? 'bg-success-bg' : 'bg-subtle'
                    }`}>
                      {isReady ? (
                        <CheckCircle size={20} strokeWidth={1.75} className="text-success" />
                      ) : (
                        <FileText size={20} strokeWidth={1.75} className="text-ink-tertiary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-base text-ink-primary">
                        {doc.display_name}
                      </p>
                      <p className="font-body text-sm text-ink-secondary mt-0.5 leading-relaxed">
                        {DOC_DESCRIPTIONS[doc.document_type]}
                      </p>
                      {doc.generated_at && (
                        <p className="font-body text-xs text-ink-tertiary mt-1">
                          Created {formatDate(doc.generated_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isReady && doc.document_id ? (
                      <button
                        onClick={() => downloadMutation.mutate(doc.document_id)}
                        disabled={downloadMutation.isPending}
                        className="flex items-center gap-1.5 h-9 px-4 bg-success text-white font-body font-semibold text-sm rounded transition-all hover:bg-green-700 disabled:opacity-50"
                      >
                        <Download size={14} strokeWidth={2} />
                        Download
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setExpandedType(isExpanded ? null : doc.document_type)
                        }}
                        className="flex items-center gap-1.5 h-9 px-4 bg-rzp-blue text-white font-body font-semibold text-sm rounded transition-all hover:bg-rzp-blue-dark"
                      >
                        <Plus size={14} strokeWidth={2} />
                        Create
                        {isExpanded ? (
                          <ChevronUp size={14} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={14} strokeWidth={2} />
                        )}
                      </button>
                    )}

                    {isReady && doc.document_id && (
                      <button
                        onClick={() => setExpandedType(isExpanded ? null : doc.document_type)}
                        className="h-9 w-9 flex items-center justify-center bg-subtle rounded hover:bg-canvas transition-all text-ink-secondary"
                        title="Create new version"
                      >
                        <Plus size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                {WHEN_TO_USE[doc.document_type] && (
                  <div className="mt-3 ml-13 pl-0">
                    <p className="font-body text-xs text-ink-tertiary">
                      <span className="font-medium text-ink-secondary">When to use: </span>
                      {WHEN_TO_USE[doc.document_type]}
                    </p>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-line-subtle p-5 bg-subtle">
                  <ExtraInputsForm
                    docType={doc.document_type}
                    isLoading={isGenerating}
                    billData={null}
                    onSubmit={(inputs) => {
                      setGeneratingType(doc.document_type)
                      generateMutation.mutate({
                        docType: doc.document_type,
                        inputs,
                      })
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-subtle rounded-lg border border-line-subtle">
        <p className="font-body text-xs text-ink-tertiary leading-relaxed">
          These letters are based on your CuraVeris audit and are ready to send.
          They are not a substitute for legal advice. Consumer court complaints
          are free for disputes up to ₹5 lakhs. For complex cases, a free legal
          aid clinic or patient rights organisation can help you.
        </p>
      </div>
    </div>
  )
}
