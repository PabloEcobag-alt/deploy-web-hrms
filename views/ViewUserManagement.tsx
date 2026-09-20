"use client";

import { useAuth } from "@/context/AuthContext";
import {
  useDarkMode,
  useColors,
} from "@/components/features/user-management/utils";
import { useUserManagement } from "@/components/features/user-management/useUserManagement";
import { UserListSection } from "@/components/features/user-management/UserListSection";
import { UserManagementHeader } from "@/components/features/user-management/UserManagementHeader";
import { RegistrationModal } from "@/components/features/user-management/RegistrationModal";
import { EditUserModal } from "@/components/features/user-management/EditUserModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function ViewUserManagement() {
  const isDark = useDarkMode();
  const c = useColors(isDark);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Super Admin") || user?.isSuperUser === true;

  const vm = useUserManagement(isAdmin);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 max-w-7xl mx-auto bg-background flex flex-col gap-6">
      <UserManagementHeader
        c={c}
        isAdmin={isAdmin}
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        onOpenRegister={() => vm.setShowModal(true)}
        users={vm.users}
        activeUsers={vm.activeUsers}
        inactiveUsers={vm.inactiveUsers}
        activeTab={vm.activeTab}
        onTabChange={vm.setActiveTab}
        errorMsg={vm.errorMsg}
      />

      <UserListSection
        c={c}
        loading={vm.loading}
        users={vm.users}
        activeTab={vm.activeTab}
        title={vm.title}
        subtitle={vm.subtitle}
        usersByRole={vm.usersByRole}
        usersByStatus={vm.usersByStatus}
        paginatedUsers={vm.paginatedUsers}
        onEdit={vm.handleEdit}
        totalItems={vm.totalItems}
        pageSize={vm.pageSize}
        safePage={vm.safePage}
        totalPages={vm.totalPages}
        startIndex={vm.startIndex}
        onPageSizeChange={vm.setPageSize}
        onPageChange={vm.setCurrentPage}
      />

      {/* Employee Registration Modal */}
      {vm.showModal && (
        <RegistrationModal
          isDark={isDark}
          c={c}
          submitting={vm.submitting}
          selectedEmployee={vm.selectedEmployee}
          unregisteredEmployees={vm.unregisteredEmployees}
          role={vm.role}
          selectedApps={vm.selectedApps}
          userType={vm.userType}
          roleAssignments={vm.roleAssignments}
          editStatus={vm.editStatus}
          onClose={() => { vm.setShowModal(false); vm.resetForm(); }}
          onSelectEmployee={vm.setSelectedEmployee}
          onRoleChange={vm.handleRoleChange}
          onSelectAllApps={vm.handleSelectAllApps}
          onToggleApp={vm.toggleApp}
          onUserTypeChange={vm.setUserType}
          onRoleAssignmentsChange={vm.setRoleAssignments}
          onSubmit={vm.handleRegister}
          onRequestConfirm={() => vm.setPendingConfirm("register")}
        />
      )}

      {/* Edit User Modal */}
      {vm.showEditModal && vm.editingUser && (
        <EditUserModal
          isDark={isDark}
          c={c}
          editingUser={vm.editingUser}
          hrmsEmployeeData={vm.hrmsEmployeeData}
          editFirstName={vm.editFirstName}
          editLastName={vm.editLastName}
          editEmail={vm.editEmail}
          editStatus={vm.editStatus}
          editApps={vm.editApps}
          editRole={vm.editRole}
          editSubmitting={vm.editSubmitting}
          editRoleAssignments={vm.editRoleAssignments}
          onClose={() => { vm.setShowEditModal(false); vm.setEditingUser(null); vm.setHrmsEmployeeData(null); }}
          onFirstNameChange={vm.setEditFirstName}
          onLastNameChange={vm.setEditLastName}
          onEmailChange={vm.setEditEmail}
          onStatusChange={vm.setEditStatus}
          onRoleChange={vm.setEditRole}
          onAppsChange={vm.setEditApps}
          onToggleApp={vm.toggleEditApp}
          onRoleAssignmentsChange={vm.setEditRoleAssignments}
          onRequestConfirm={() => vm.setPendingConfirm("update")}
        />
      )}

      {/* Register / Update confirmation */}
      <ConfirmDialog
        open={vm.pendingConfirm !== null}
        title={vm.pendingConfirm === "register" ? "Register this employee?" : "Save changes?"}
        description={
          vm.pendingConfirm === "register"
            ? "This will create a new user account with the selected access."
            : "This will update the user's details and access."
        }
        confirmLabel={vm.pendingConfirm === "register" ? "Register Employee" : "Save Changes"}
        cancelLabel="Cancel"
        onCancel={() => vm.setPendingConfirm(null)}
        onConfirm={() => {
          const action = vm.pendingConfirm;
          vm.setPendingConfirm(null);
          if (action === "register") void vm.handleRegister();
          else if (action === "update") void vm.handleEditSubmit();
        }}
      />
    </div>
  );
}
