"use client";

import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/StatCard";
import { Users, GraduationCap, UserCheck, Clock } from "lucide-react";

import {
  useDarkMode,
  useColors,
  getFullName,
} from "@/components/features/recruitment-hiring/utils";
import { useRecruitment } from "@/components/features/recruitment-hiring/useRecruitment";
import { ApplicantModal } from "@/components/features/recruitment-hiring/ApplicantModal";
import { ViewApplicantModal } from "@/components/features/recruitment-hiring/ViewApplicantModal";
import { ConfirmDialog } from "@/components/features/recruitment-hiring/ConfirmDialog";
import { RecruitmentTableSection } from "@/components/features/recruitment-hiring/RecruitmentTableSection";
import { ScheduleInterviewModal } from "@/components/features/recruitment-hiring/ScheduleInterviewModal";

export default function ViewRecruitmentHiring() {
  const isDark = useDarkMode();
  const c = useColors(isDark);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin");

  const vm = useRecruitment();

  const cardStyle = {
    background: c.cardBg,
    borderColor: c.cardBorder,
    borderRadius: 12,
    border: `1px solid ${c.cardBorder}`,
  };

  return (
    <div className="max-w-7xl mx-auto" style={{ width: "100%", minHeight: "100vh", padding: "24px", background: c.pageBg, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ margin: 0, color: c.headingText }}>Recruitment &amp; Hiring</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: c.mutedText }}>Manage job applications and interviews</p>
        </div>
        {isAdmin && (
          <button onClick={() => { vm.setModal("add"); vm.setSelectedApplicant(null); }} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 18px", background: "#000000", color: "white",
            borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Applicant
          </button>
        )}
      </div>

      {/* No access for employee */}
      {vm.userRole === "employee" && (
        <div style={{ ...cardStyle, padding: 40, textAlign: "center" }}>
          <p style={{ fontWeight: 600, color: c.headingText, margin: 0 }}>No Recruitment Access</p>
          <p style={{ fontSize: 13, color: c.mutedText, marginTop: 6 }}>
            The hiring module is available to Marketing Managers and the Vice President only.
          </p>
        </div>
      )}

      {/* Stat cards – Manager */}
      {vm.userRole === "manager" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard label="Total Applicants" value={vm.applicants.length} icon={Users} />
          <StatCard label="In Training" value={vm.trainingCount} icon={GraduationCap} />
          <StatCard label="Probationary" value={vm.probationaryStageCount} icon={UserCheck} />
          <StatCard label="Urgent Interviews" value={vm.urgentInterviews} icon={Clock} />
        </div>
      )}

      {/* Stat cards – VP */}
      {vm.userRole === "vp" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard label="Active Candidates" value={vm.activeCandidates} icon={Users} />
          <StatCard label="For Interview" value={vm.forInterviewCount} icon={Clock} />
          <StatCard label="Requirement Walking" value={vm.reqWalkingCount} icon={GraduationCap} />
          <StatCard label="Hired" value={vm.hiredCount} icon={UserCheck} />
        </div>
      )}

      {/* Main table card */}
      {vm.userRole !== "employee" && (
        <RecruitmentTableSection
          c={c}
          isDark={isDark}
          userRole={vm.userRole}
          mainTableTab={vm.mainTableTab}
          onMainTableTabChange={vm.setMainTableTab}
          vpApplicantsCount={vm.vpApplicants.length}
          filteredCount={vm.filtered.length}
          upcomingCount={vm.upcomingInterviews.length}
          tabFilteredCount={vm.tabFiltered.length}
          searchName={vm.searchName}
          onSearchNameChange={vm.setSearchName}
          filterPosition={vm.filterPosition}
          onFilterPositionChange={vm.setFilterPosition}
          filterSource={vm.filterSource}
          onFilterSourceChange={vm.setFilterSource}
          filterStage={vm.filterStage}
          onFilterStageChange={vm.setFilterStage}
          vpSortBy={vm.vpSortBy}
          onVpSortByChange={vm.setVpSortBy}
          paginatedApplicants={vm.paginatedApplicants}
          onView={a => { vm.setSelectedApplicant(a); vm.setModal("view"); }}
          onEdit={a => { vm.setSelectedApplicant(a); vm.setModal("edit"); }}
          onStageChange={vm.handleStageChange}
          onDelete={a => vm.setDeleteTarget(a)}
          onSchedule={a => vm.setScheduleModalFor(a.id)}
          totalItems={vm.totalItems}
          pageSize={vm.pageSize}
          startIndex={vm.startIndex}
          safePage={vm.safePage}
          totalPages={vm.totalPages}
          onPrevPage={() => vm.setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => vm.setCurrentPage((p) => Math.min(vm.totalPages, p + 1))}
        />
      )}

      {/* Modals */}
      {(vm.modal === "add" || vm.modal === "edit") && (
        <ApplicantModal
          mode={vm.modal}
          applicant={vm.selectedApplicant ?? undefined}
          onClose={() => {
            if (vm.modal === "edit" && vm.selectedApplicant) {
              vm.setModal("view");
            } else {
              vm.setModal(null);
              vm.setSelectedApplicant(null);
            }
          }}
          onSave={(form) => vm.setPendingSave({ form, mode: vm.modal === "add" ? "add" : "edit" })}
          isDark={isDark} c={c}
        />
      )}

      {/* Create / Save confirmation */}
      <ConfirmDialog
        open={!!vm.pendingSave}
        title={vm.pendingSave?.mode === "add" ? "Add this applicant?" : "Save changes?"}
        description={
          vm.pendingSave?.mode === "add"
            ? "This will create a new applicant record."
            : "This will update the applicant's details."
        }
        confirmLabel={vm.pendingSave?.mode === "add" ? "Add Applicant" : "Save Changes"}
        cancelLabel="Cancel"
        onCancel={() => vm.setPendingSave(null)}
        onConfirm={() => {
          if (vm.pendingSave) {
            const { form, mode } = vm.pendingSave;
            vm.setPendingSave(null);
            void vm.doSave(form, mode);
          }
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!vm.deleteTarget}
        title="Delete applicant?"
        description={
          vm.deleteTarget
            ? `This will permanently remove ${getFullName(vm.deleteTarget)} from the list. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => vm.setDeleteTarget(null)}
        onConfirm={vm.handleDeleteConfirm}
      />

      {vm.modal === "view" && vm.selectedApplicant && (
        <ViewApplicantModal
          applicant={vm.selectedApplicant}
          onClose={() => { vm.setModal(null); vm.setSelectedApplicant(null); }}
          onEdit={() => vm.setModal("edit")}
          onSchedule={(a) => { vm.setModal(null); vm.setScheduleModalFor(a.id); }}
          onDelete={(a) => { vm.setModal(null); vm.setSelectedApplicant(null); vm.setDeleteTarget(a); }}
          c={c} isDark={isDark}
        />
      )}

      {/* Schedule modal */}
      {vm.scheduleModalFor && (() => {
        const ap = vm.applicants.find(a => a.id === vm.scheduleModalFor);
        if (!ap) return null;
        return (
          <ScheduleInterviewModal
            applicant={ap}
            c={c}
            onCancel={() => { vm.setScheduleModalFor(null); vm.setSelectedApplicant(ap); vm.setModal("view"); }}
            onSave={vm.saveInterviewSchedule}
          />
        );
      })()}
    </div>
  );
}
