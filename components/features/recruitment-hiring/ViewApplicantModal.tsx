"use client";

import { useState } from "react";
import type { Applicant } from "./types";
import {
  GOVERNMENT_IDS,
  HIRING_REQUIREMENTS,
  EMPLOYMENT_DOCUMENTS,
  HEALTH_CHECKLIST,
  DEFAULT_ROLE_SALARIES,
} from "./constants";
import { useColors, getFullName, formatDate, getDaysUntil, countCompleted } from "./utils";
import { StatusBadge, StageBadge } from "./badges";
import { Check, X, Calendar, Trash2, Pencil, MoreVertical, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type ModalTab = "info" | "govids" | "requirements" | "other";

function ChecklistRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3",
        checked
          ? "border-emerald-500/50 bg-emerald-50"
          : "border-border bg-muted/40"
      )}
    >
      {checked ? (
        <Check className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <X className="h-5 w-5 shrink-0 text-gray-400" />
      )}
      <span className="text-base font-normal text-black">{label}</span>
    </div>
  );
}

export function ViewApplicantModal({ applicant, onClose, onEdit, onSchedule, onDelete, onEmail, c, isDark }: {
  applicant: Applicant; onClose: () => void; onEdit: () => void;
  onSchedule?: (a: Applicant) => void;
  onDelete?: (a: Applicant) => void;
  onEmail?: (a: Applicant) => void;
  c: ReturnType<typeof useColors>; isDark: boolean;
}) {
  const [tab, setTab] = useState<ModalTab>("info");
  const govCompleted = countCompleted(applicant.govIds);
  const reqCompleted = countCompleted(applicant.requirements);
  const healthCompleted = countCompleted(applicant.healthDocs);

  const TABS: { key: ModalTab; label: string }[] = [
    { key: "info", label: "Basic Info" },
    { key: "govids", label: `Gov't IDs (${govCompleted}/${GOVERNMENT_IDS.length})` },
    { key: "requirements", label: `Requirements (${reqCompleted}/${HIRING_REQUIREMENTS.length})` },
    { key: "other", label: `Other Requirements (${healthCompleted}/${HEALTH_CHECKLIST.length})` },
  ];

  const dateWithDays = (date: string) => {
    if (!date) return "-";
    const days = getDaysUntil(date);
    if (isNaN(days)) return formatDate(date);
    const suffix = days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`;
    return `${formatDate(date)} (${suffix})`;
  };

  const targetSalaryVal = applicant.targetSalary || DEFAULT_ROLE_SALARIES[applicant.position];
  const approvedSalaryVal = applicant.approvedSalary ?? targetSalaryVal;

  const infoRows: [string, string][] = [
    ...(applicant.referenceNumber ? [["Reference No.", applicant.referenceNumber] as [string, string]] : []),
    ["Position", applicant.position],
    ["Target Salary", targetSalaryVal ? `₱${targetSalaryVal.toLocaleString()}` : "-"],
    ["Approved / Offered", approvedSalaryVal ? `₱${approvedSalaryVal.toLocaleString()}` : "-"],
    ["Interviewer / Evaluator", applicant.interviewer || "-"],
    ["Email", applicant.email],
    ["Phone", applicant.phone],
    ["Source", applicant.source],
    ["Applied", dateWithDays(applicant.appliedDate)],
    ["Interview", dateWithDays(applicant.interviewDate)],
    ["Expected Start", formatDate(applicant.expectedStart)],
    ["Resume", applicant.resumeFileName || "-"],
  ];

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      {/* Force all dialog text to black regardless of theme */}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 text-black sm:max-w-[560px]">
        <DialogHeader className="space-y-3 border-b px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-xl font-medium text-black">{getFullName(applicant)}</DialogTitle>
              {applicant.referenceNumber && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-violet-100 text-violet-800 border border-violet-200">
                  {applicant.referenceNumber}
                </span>
              )}
            </div>
            <div className="mr-6 flex shrink-0 items-center gap-2">
              {onSchedule && (
                <button
                  onClick={() => onSchedule(applicant)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-normal text-black shadow-xs transition-colors hover:bg-accent"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-black shadow-xs transition-colors hover:bg-accent"
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-lg border border-border bg-white p-1.5 shadow-md">
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-normal text-black hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    <span>Edit Applicant</span>
                  </DropdownMenuItem>
                  {onEmail && (
                    <DropdownMenuItem
                      onClick={() => onEmail(applicant)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-normal text-indigo-700 hover:bg-indigo-50"
                    >
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <span>Send Email Update</span>
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(applicant)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-normal text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            <div className="flex flex-col gap-1">
              {infoRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-border/60 py-3 text-base"
                >
                  <span className="font-normal text-black">{label}</span>
                  <span className="font-normal text-black">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-b border-border/60 py-3 text-base">
                <span className="font-normal text-black">Status</span>
                <StatusBadge status={applicant.status} c={c} className="px-3 py-1 text-sm font-normal" />
              </div>
              <div className="flex items-center justify-between py-3 text-base">
                <span className="font-normal text-black">Stage</span>
                <StageBadge stage={applicant.stage} c={c} className="px-3 py-1 text-sm font-normal" />
              </div>
            </div>
          )}

          {tab === "govids" && (
            <div className="flex flex-col gap-2.5">
              {GOVERNMENT_IDS.map((g) => (
                <ChecklistRow key={g.key} label={g.label} checked={Boolean(applicant.govIds?.[g.key])} />
              ))}
            </div>
          )}

          {tab === "requirements" && (
            <div className="flex flex-col gap-2.5">
              {HIRING_REQUIREMENTS.map((r) => (
                <ChecklistRow key={r.key} label={r.label} checked={Boolean(applicant.requirements?.[r.key])} />
              ))}
            </div>
          )}

          {tab === "other" && (
            <div>
              <p className="mb-3 mt-0 text-sm font-medium uppercase tracking-wider text-black">
                Employment Documents
              </p>
              <div className="flex flex-col gap-2.5">
                {EMPLOYMENT_DOCUMENTS.map((d) => (
                  <ChecklistRow key={d.key} label={d.label} checked={Boolean(applicant.employmentDocs?.[d.key])} />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center gap-2 border-t px-5 py-3 sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-base font-normal text-black shadow-xs transition-colors hover:bg-accent"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
