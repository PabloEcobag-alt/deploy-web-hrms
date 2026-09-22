"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import type {
  Applicant,
  ApplicantFormData,
} from "./types";
import {
  GOVERNMENT_IDS,
  HIRING_REQUIREMENTS,
  EMPLOYMENT_DOCUMENTS,
  HEALTH_CHECKLIST,
} from "./constants";
import { useColors, countCompleted } from "./utils";
import { emptyForm, applicantToForm } from "./form";
import { ApplicantInfoTab } from "./ApplicantInfoTab";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ModalTab = "info" | "govids" | "requirements" | "other";

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3",
        checked
          ? "border-emerald-500/50 bg-emerald-50"
          : "border-border bg-muted/40"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-emerald-600"
      />
      <span className="text-base font-normal text-black">{label}</span>
      {checked && <Check className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />}
    </label>
  );
}

export function ApplicantModal({
  mode, applicant, onClose, onSave, isDark, c,
}: {
  mode: "add" | "edit";
  applicant?: Applicant;
  onClose: () => void;
  onSave: (data: ApplicantFormData) => void;
  isDark: boolean;
  c: ReturnType<typeof useColors>;
}) {
  const [tab, setTab] = useState<ModalTab>("info");
  const [form, setForm] = useState<ApplicantFormData>(
    mode === "edit" && applicant ? applicantToForm(applicant) : emptyForm()
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicantFormData, string>>>({});

  function set<K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    
    if ((form.stage === "Hired" || form.stage === "Probationary") && !form.startDate?.trim()) {
      e.startDate = "Start Date is required for hired applicants";
      setTab("info"); // Switch to info tab if error is there
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Input style shared with the info tab — themed to match the black-text dialog.
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${c.cardBorder}`,
    background: "#ffffff",
    color: "#000000", fontSize: 15, boxSizing: "border-box" as const,
  };

  const appliedRef = useRef<HTMLInputElement | null>(null);
  const interviewRef = useRef<HTMLInputElement | null>(null);
  const resumeRef = useRef<HTMLInputElement | null>(null);

  const govCompleted = countCompleted(form.govIds);
  const reqCompleted = countCompleted(form.requirements);
  const healthCompleted = countCompleted(form.healthDocs);

  const TABS: { key: ModalTab; label: string }[] = [
    { key: "info", label: "Basic Info" },
    { key: "govids", label: `Gov't IDs (${govCompleted}/${GOVERNMENT_IDS.length})` },
    { key: "requirements", label: `Requirements (${reqCompleted}/${HIRING_REQUIREMENTS.length})` },
    { key: "other", label: `Other Requirements (${healthCompleted}/${HEALTH_CHECKLIST.length})` },
  ];

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      {/* Force all dialog text to black regardless of theme */}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 text-black sm:max-w-[560px]">
        <DialogHeader className="space-y-3 border-b px-5 py-4">
          <div>
            <DialogTitle className="text-xl font-medium text-black">
              {mode === "add"
                ? "Add Applicant"
                : applicant
                  ? `Edit — ${applicant.firstName} ${applicant.lastName}`
                  : "Edit Applicant"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-base text-black">
              Fill in the details across all tabs before saving
            </DialogDescription>
          </div>
          <div className="-mx-1 flex flex-nowrap gap-1 overflow-x-auto px-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-normal text-black transition-colors",
                  tab === t.key ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-black">
          {tab === "info" && (
            <ApplicantInfoTab
              form={form}
              set={set}
              errors={errors}
              c={c}
              inputStyle={inputStyle}
              resumeRef={resumeRef}
              appliedRef={appliedRef}
              interviewRef={interviewRef}
            />
          )}

          {tab === "govids" && (
            <div>
              <p className="mb-3 mt-0 text-sm text-black">
                Track which government IDs the applicant has submitted. Sensitive numbers are encrypted before storage (FR-06.6).
              </p>
              <div className="flex flex-col gap-2.5">
                {GOVERNMENT_IDS.map((g) => (
                  <CheckboxRow
                    key={g.key}
                    label={g.label}
                    checked={!!form.govIds[g.key]}
                    onChange={(v) => set("govIds", { ...form.govIds, [g.key]: v })}
                  />
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
                🔒 SSS, PhilHealth, Pag-IBIG, and TIN numbers are automatically encrypted before database storage per FR-06.6.
              </div>
            </div>
          )}

          {tab === "requirements" && (
            <div>
              <p className="mb-3 mt-0 text-sm text-black">
                Track submission of required documents before final hiring (FR-06.5). All must be complete before status moves to Hired.
              </p>
              <div className="flex flex-col gap-2.5">
                {HIRING_REQUIREMENTS.map((r) => (
                  <CheckboxRow
                    key={r.key}
                    label={r.label}
                    checked={!!form.requirements[r.key]}
                    onChange={(v) => set("requirements", { ...form.requirements, [r.key]: v })}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "other" && (
            <div>
              <p className="mb-3 mt-0 text-sm font-medium uppercase tracking-wider text-black">
                Employment Documents
              </p>
              <div className="flex flex-col gap-2.5">
                {EMPLOYMENT_DOCUMENTS.map((d) => (
                  <CheckboxRow
                    key={d.key}
                    label={d.label}
                    checked={!!form.employmentDocs[d.key]}
                    onChange={(v) => set("employmentDocs", { ...form.employmentDocs, [d.key]: v })}
                  />
                ))}
              </div>
              <div className="mt-4">
                <p className="mb-2 mt-0 text-sm font-medium uppercase tracking-wider text-black">
                  Health &amp; Medical Checklist
                </p>
                <div className="flex flex-col gap-2.5">
                  {HEALTH_CHECKLIST.map((h) => (
                    <CheckboxRow
                      key={h.key}
                      label={h.label}
                      checked={!!form.healthDocs[h.key]}
                      onChange={(v) => set("healthDocs", { ...form.healthDocs, [h.key]: v })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center gap-2 border-t px-5 py-3 sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-base font-normal text-black shadow-xs transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => { 
              if (validate()) {
                onSave(form); 
              } else {
                toast.error("Please fill in all required fields, including the Start Date for new hires.");
              }
            }}
            className="inline-flex h-10 items-center justify-center rounded-md bg-black px-5 text-base font-normal text-white shadow-xs transition-colors hover:bg-black/90"
          >
            {mode === "add" ? "Add Applicant" : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
