"use client";

import { MoreVertical, Pencil, Trash2, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { Applicant, HiringStage } from "./types";
import { AVATAR_STYLES, GOVERNMENT_IDS, HIRING_REQUIREMENTS } from "./constants";
import {
  useColors,
  getInitials,
  getFullName,
  formatDate,
  countCompleted,
} from "./utils";
import { StatusBadge, StageBadge, DateBadge } from "./badges";

export function ApplicantTable({
  applicants, c, onView, onEdit, onStageChange, onDelete, onSchedule, onEmail,
}: {
  applicants: Applicant[];
  c: ReturnType<typeof useColors>;
  isDark: boolean;
  onView: (a: Applicant) => void;
  onEdit: (a: Applicant) => void;
  onStageChange: (id: string, stage: HiringStage) => void;
  onDelete: (a: Applicant) => void;
  onSchedule: (a: Applicant) => void;
  onEmail?: (a: Applicant) => void;
}) {
  if (!applicants.length) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No applicants match the current filters.
      </div>
    );
  }

  return (
    <Table className="w-full">
      <TableHeader className="bg-background sticky top-0 z-10">
        <TableRow className="border-b border-border">
          <TableHead className="w-[320px] min-w-[320px] text-base font-medium text-muted-foreground px-5 py-4">Name</TableHead>
          <TableHead className="w-[200px] min-w-[200px] text-base font-medium text-muted-foreground px-5 py-4">Position</TableHead>
          <TableHead className="w-[180px] min-w-[180px] text-base font-medium text-muted-foreground px-5 py-4">Stage</TableHead>
          <TableHead className="w-[150px] min-w-[150px] text-base font-medium text-muted-foreground px-5 py-4">Docs</TableHead>
          <TableHead className="w-[60px] min-w-[60px] px-2 py-4 text-center"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applicants.map((a) => {
          const govDone = countCompleted(a.govIds);
          const reqDone = countCompleted(a.requirements);
          return (
            <TableRow
              key={a.id}
              onClick={() => onView(a)}
              className="cursor-pointer hover:bg-muted/50 transition-colors border-b border-border"
            >
              <TableCell className="w-[320px] min-w-[320px] px-5 py-4">
                <div>
                  <span className="font-medium text-lg text-foreground hover:underline block">{getFullName(a)}</span>
                  <span className="text-sm text-muted-foreground block">{a.email}</span>
                </div>
              </TableCell>
              <TableCell className="w-[200px] min-w-[200px] px-5 py-4 text-base font-normal text-foreground">
                {a.position}
              </TableCell>
              <TableCell className="w-[180px] min-w-[180px] px-5 py-4">
                <StageBadge stage={a.stage} c={c} />
                {a.interviewer && (
                  <span className="mt-1 block text-xs text-muted-foreground truncate max-w-[160px]" title={`Evaluator: ${a.interviewer}`}>
                    👤 {a.interviewer}
                  </span>
                )}
              </TableCell>
              <TableCell className="w-[150px] min-w-[150px] px-5 py-4">
                <div className="flex flex-col gap-0.5 text-sm text-muted-foreground font-normal">
                  <span>IDs: {govDone}/{GOVERNMENT_IDS.length}</span>
                  <span>Docs: {reqDone}/{HIRING_REQUIREMENTS.length}</span>
                </div>
              </TableCell>
              <TableCell
                className="w-[60px] min-w-[60px] px-2 py-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Row actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-lg border border-border bg-white p-1.5 shadow-md">
                    <DropdownMenuItem
                      onClick={() => onEdit(a)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-normal text-black hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                      <span>Edit Applicant</span>
                    </DropdownMenuItem>
                    {onEmail && (
                      <DropdownMenuItem
                        onClick={() => onEmail(a)}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-normal text-indigo-700 hover:bg-indigo-50"
                      >
                        <Mail className="h-4 w-4 text-indigo-600" />
                        <span>Send Email Update</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(a)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-normal text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ─── VP Read-Only Table ───────────────────────────────────────────────────────

export function VPReadOnlyTable({ applicants, c }: { applicants: Applicant[]; c: ReturnType<typeof useColors> }) {
  return (
    <Table className="w-full">
      <TableHeader className="bg-background sticky top-0 z-10">
        <TableRow className="border-b border-border">
          <TableHead className="w-[280px] min-w-[280px] text-base font-medium text-muted-foreground px-5 py-4">Name</TableHead>
          <TableHead className="w-[220px] min-w-[220px] text-base font-medium text-muted-foreground px-5 py-4">Position</TableHead>
          <TableHead className="w-[180px] min-w-[180px] text-base font-medium text-muted-foreground px-5 py-4">Stage</TableHead>
          <TableHead className="w-[220px] min-w-[220px] text-base font-medium text-muted-foreground px-5 py-4">Interview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applicants.map((a) => (
          <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50 transition-colors border-b border-border">
            <TableCell className="w-[280px] min-w-[280px] font-medium text-lg text-foreground px-5 py-4">{getFullName(a)}</TableCell>
            <TableCell className="w-[220px] min-w-[220px] text-base text-foreground px-5 py-4 font-normal">{a.position}</TableCell>
            <TableCell className="w-[180px] min-w-[180px] px-5 py-4"><StageBadge stage={a.stage} c={c} /></TableCell>
            <TableCell className="w-[220px] min-w-[220px] px-5 py-4"><DateBadge date={a.interviewDate} c={c} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
