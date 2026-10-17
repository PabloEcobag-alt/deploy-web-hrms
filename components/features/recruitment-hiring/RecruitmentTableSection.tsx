"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import type { Applicant, ApplicantSource, HiringStage } from "./types";
import type { Colors } from "./utils";
import { POSITIONS, APPLICANT_SOURCES, HIRING_STAGES } from "./constants";
import { ApplicantTable, VPReadOnlyTable } from "./ApplicantTable";

type UserRole = "manager" | "vp" | "employee";
type MainTableTab = "all" | "upcoming";
type VpSortBy = "name" | "position" | "source";

interface RecruitmentTableSectionProps {
  c: Colors;
  isDark: boolean;
  userRole: UserRole;
  mainTableTab: MainTableTab;
  onMainTableTabChange: (tab: MainTableTab) => void;
  vpApplicantsCount: number;
  filteredCount: number;
  upcomingCount: number;
  tabFilteredCount: number;
  // filters
  searchName: string;
  onSearchNameChange: (v: string) => void;
  filterPosition: string;
  onFilterPositionChange: (v: string) => void;
  filterSource: ApplicantSource | "";
  onFilterSourceChange: (v: ApplicantSource | "") => void;
  filterStage: HiringStage | "";
  onFilterStageChange: (v: HiringStage | "") => void;
  vpSortBy: VpSortBy;
  onVpSortByChange: (v: VpSortBy) => void;
  // table data
  paginatedApplicants: Applicant[];
  onView: (a: Applicant) => void;
  onEdit: (a: Applicant) => void;
  onStageChange: (id: string, stage: HiringStage) => void;
  onDelete: (a: Applicant) => void;
  onSchedule: (a: Applicant) => void;
  onEmail?: (a: Applicant) => void;
  // pagination
  totalItems: number;
  pageSize: number;
  startIndex: number;
  safePage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

/**
 * The main recruitment table card: tab switcher, search + filters,
 * applicant table (manager or VP), and pagination.
 */
export function RecruitmentTableSection({
  c,
  isDark,
  userRole,
  mainTableTab,
  onMainTableTabChange,
  vpApplicantsCount,
  filteredCount,
  upcomingCount,
  tabFilteredCount,
  searchName,
  onSearchNameChange,
  filterPosition,
  onFilterPositionChange,
  filterSource,
  onFilterSourceChange,
  filterStage,
  onFilterStageChange,
  vpSortBy,
  onVpSortByChange,
  paginatedApplicants,
  onView,
  onEdit,
  onStageChange,
  onDelete,
  onSchedule,
  onEmail,
  totalItems,
  pageSize,
  startIndex,
  safePage,
  totalPages,
  onPrevPage,
  onNextPage,
}: RecruitmentTableSectionProps) {
  return (
    <div className="border border-border rounded-lg bg-white shadow-xs overflow-hidden p-6 space-y-6">
      {/* Container Header & Tab Switcher Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-1">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onMainTableTabChange("all")}
              className={`pb-3 text-base font-medium transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                mainTableTab === "all"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              All Applicants
              <span className={`px-2 py-0.5 text-xs rounded-full font-normal ${
                mainTableTab === "all" ? "bg-slate-900 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {userRole === "vp" ? vpApplicantsCount : filteredCount}
              </span>
            </button>
            {userRole === "manager" && (
              <button
                onClick={() => onMainTableTabChange("upcoming")}
                className={`pb-3 text-base font-medium transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                  mainTableTab === "upcoming"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Upcoming Interviews
                <span className={`px-2 py-0.5 text-xs rounded-full font-normal ${
                  mainTableTab === "upcoming" ? "bg-slate-900 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {upcomingCount}
                </span>
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-normal pb-3 m-0">
            {tabFilteredCount} applicant{tabFilteredCount !== 1 ? "s" : ""} registered
          </p>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 pt-2">
          <div className="relative w-full md:flex-1 min-w-[140px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={e => onSearchNameChange(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm sm:text-base border border-border rounded-lg bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-row items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
            <AppSelect
              value={filterPosition}
              onValueChange={onFilterPositionChange}
              options={[{ value: "", label: "All Positions" }, ...POSITIONS.map(p => ({ value: p, label: p }))]}
              className="min-w-[115px] shrink-0"
              triggerClassName="text-xs sm:text-sm md:px-3.5 md:py-2"
            />
            <AppSelect
              value={filterSource}
              onValueChange={v => onFilterSourceChange(v as ApplicantSource | "")}
              options={[{ value: "", label: "All Sources" }, ...APPLICANT_SOURCES.map(s => ({ value: s, label: s }))]}
              className="min-w-[105px] shrink-0"
              triggerClassName="text-xs sm:text-sm md:px-3.5 md:py-2"
            />
            <AppSelect
              value={filterStage}
              onValueChange={v => onFilterStageChange(v as HiringStage | "")}
              options={[{ value: "", label: "All Stages" }, ...HIRING_STAGES.map(s => ({ value: s, label: s }))]}
              className="min-w-[105px] shrink-0"
              triggerClassName="text-xs sm:text-sm md:px-3.5 md:py-2"
            />
            {userRole === "vp" && (
              <AppSelect
                value={vpSortBy}
                onValueChange={v => onVpSortByChange(v as VpSortBy)}
                options={[
                  { value: "name", label: "Sort by Name" },
                  { value: "position", label: "Sort by Role" },
                  { value: "source", label: "Sort by Source" },
                ]}
                className="min-w-[115px] shrink-0"
                triggerClassName="text-xs sm:text-sm md:px-3.5 md:py-2"
              />
            )}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div key={mainTableTab} className="animate-tab-change overflow-x-auto overflow-y-auto max-h-[600px] border border-border rounded-lg bg-white">
        {userRole === "manager" && (
          <ApplicantTable
            applicants={paginatedApplicants}
            c={c} isDark={isDark}
            onView={onView}
            onEdit={onEdit}
            onStageChange={onStageChange}
            onDelete={onDelete}
            onSchedule={onSchedule}
            onEmail={onEmail}
          />
        )}
        {userRole === "vp" && <VPReadOnlyTable applicants={paginatedApplicants} c={c} />}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-base text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} of {totalItems} applicants
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrevPage} disabled={safePage <= 1} className="h-9 px-3 text-base">
            <ChevronLeft className="w-4.5 h-4.5" />
          </Button>
          <span className="text-base font-semibold text-foreground px-2">
            {safePage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={onNextPage} disabled={safePage >= totalPages} className="h-9 px-3 text-base">
            <ChevronRight className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
