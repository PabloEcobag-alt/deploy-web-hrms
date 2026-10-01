"use client";

import { useAuth } from "@/context/AuthContext";
import {
  useDarkMode,
  useColors,
} from "@/components/features/digital-201-file/utils";
import { MOCK_EMPLOYEES } from "@/components/features/digital-201-file/mockData";
import { EmployeeStatCard } from "@/components/features/digital-201-file/badges";
import { EmployeeProfileModal } from "@/components/features/digital-201-file/EmployeeProfileModal";
import { EmployeeEditModal } from "@/components/features/digital-201-file/EmployeeEditModal";
import { AddEmployeeModal } from "@/components/features/digital-201-file/AddEmployeeModal";
import {
  ProbationModal,
  PendingDocsModal,
  PendingOnboardingModal,
} from "@/components/features/digital-201-file/StatusModals";
import { useDigital201 } from "@/components/features/digital-201-file/useDigital201";
import { EmployeeSelfServiceView } from "@/components/features/digital-201-file/EmployeeSelfServiceView";
import { AdminEmployeeListSection } from "@/components/features/digital-201-file/AdminEmployeeListSection";

export default function ViewDigital201File() {
  const isDark = useDarkMode();
  const c = useColors(isDark);
  const { user } = useAuth();
  const vm = useDigital201(user);
  const role = vm.role;

  // Toggle to expose the employee self-service view instead of the admin list.
  const showSelfServiceView = false;

  return (
    <div className="w-full min-h-screen p-4 md:p-6 max-w-7xl mx-auto bg-background flex flex-col gap-4 md:gap-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Employee Information</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage employee digital files, documents, and compliance records
          </p>
        </div>
        {role === "Admin" && (
          <button
            onClick={() => { vm.setSelectedPendingHire(null); vm.setAddModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors shadow-xs focus:outline-none"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Add New Employee
          </button>
        )}
      </div>

      {showSelfServiceView ? (
        <EmployeeSelfServiceView
          c={c}
          isLoadingEmployeeProfile={vm.isLoadingEmployeeProfile}
          employeeProfileError={vm.employeeProfileError}
          employeeProfile={vm.employeeProfile}
          profilePictureUrl={vm.profilePictureUrl}
          contactInfo={vm.contactInfo}
          setContactInfo={vm.setContactInfo}
          setProfilePicture={vm.setProfilePicture}
          setProfilePictureUrl={vm.setProfilePictureUrl}
          hasChanges={vm.hasChanges}
          setHasChanges={vm.setHasChanges}
          isSaving={vm.isSaving}
          onSaveContactInfo={vm.handleSaveContactInfo}
        />
      ) : (
        <>
          {/* Admin View - Full Dashboard */}
          {/* Expiring Documents Notification Ribbon */}
          {vm.expiringDocs.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-amber-50/80 border-amber-200 shadow-xs overflow-x-auto w-full">
              <div className="flex items-center gap-2 flex-shrink-0 text-amber-800">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-bold text-sm">Expiring Documents:</span>
              </div>
              <div className="flex items-center gap-4 flex-nowrap whitespace-nowrap text-sm text-amber-900">
                {vm.expiringDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="font-semibold">{doc.employeeName}</span>
                    <span className="opacity-75">({doc.documentName})</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${doc.daysLeft <= 7 ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                      {doc.daysLeft} days
                    </span>
                    {idx < vm.expiringDocs.length - 1 && <span className="mx-2 opacity-30 text-amber-900">|</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <EmployeeStatCard label="Total Employees" count={role === "Admin" ? vm.adminEmployees.length : MOCK_EMPLOYEES.length} pendingCount={0} c={c} />
            <EmployeeStatCard label="Regular Employees" count={role === "Admin" ? vm.adminEmployees.filter(e => e.status === 'Regular').length : vm.regularEmployees} pendingCount={0} c={c} />
            <EmployeeStatCard label="Probationary" count={role === "Admin" ? vm.adminEmployees.filter(e => e.status === 'Probationary').length : vm.probationaryEmployees} pendingCount={0} c={c} />
            <EmployeeStatCard label="Pending Documents" count={vm.pendingDocuments} pendingCount={0} c={c} />
          </div>

          {/* Loading and Error States for Admin */}
          {role === "Admin" && vm.isLoadingEmployees && (
            <div className="flex items-center justify-center py-12" style={{ color: c.bodyText }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              Loading employee data...
            </div>
          )}

          {role === "Admin" && vm.employeeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div style={{ color: "#dc2626" }}>
                <strong>Error:</strong> {vm.employeeError}
              </div>
            </div>
          )}

          {/* Table */}
          <AdminEmployeeListSection
            c={c}
            isAdmin={role === "Admin"}
            searchName={vm.searchName}
            onSearchNameChange={vm.setSearchName}
            activeTab={vm.activeTab}
            onActiveTabChange={vm.setActiveTab}
            tabs={vm.tabs}
            paginatedEmployees={vm.paginatedEmployees}
            onViewFile={vm.handleViewFile}
            onEditFile={vm.handleEditFile}
            totalItems={vm.totalItems}
            pageSize={vm.pageSize}
            startIndex={vm.startIndex}
            safePage={vm.safePage}
            totalPages={vm.totalPages}
            onPrevPage={() => vm.setCurrentPage((p) => Math.max(1, p - 1))}
            onNextPage={() => vm.setCurrentPage((p) => Math.min(vm.totalPages, p + 1))}
          />
        </>
      )}

      {/* Employee Profile Modal */}
      {vm.selectedEmployee && (
        <EmployeeProfileModal
          employee={vm.selectedEmployee}
          isOpen={vm.profileModalOpen}
          onClose={() => vm.setProfileModalOpen(false)}
          c={c}
          isDark={isDark}
        />
      )}

      {/* Employee Edit Modal (Upload/Replace) */}
      {vm.selectedEmployee && (
        <EmployeeEditModal
          employee={vm.selectedEmployee}
          isOpen={vm.editModalOpen}
          onClose={() => vm.setEditModalOpen(false)}
          c={c}
          isDark={isDark}
          onEmployeeUpdated={() => vm.loadAdminEmployees()}
        />
      )}

      {/* Add New Employee Wizard Modal */}
      <AddEmployeeModal
        isOpen={vm.addModalOpen}
        onClose={vm.handleAddModalClose}
        c={c}
        isDark={isDark}
        initialData={vm.selectedPendingHire}
        onEmployeeCreated={vm.handleEmployeeCreated}
        adminEmployees={vm.employees}
      />

      {/* Action Modals */}
      <ProbationModal isOpen={vm.probationModalOpen} onClose={() => vm.setProbationModalOpen(false)} c={c} />
      <PendingDocsModal isOpen={vm.pendingDocsModalOpen} onClose={() => vm.setPendingDocsModalOpen(false)} c={c} />
      <PendingOnboardingModal
        isOpen={vm.pendingOnboardingModalOpen}
        onClose={() => vm.setPendingOnboardingModalOpen(false)}
        c={c}
        onReview={vm.handleReviewHire}
      />

    </div>
  );
}
