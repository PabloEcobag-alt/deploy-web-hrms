"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getUsers,
  registerUser,
  updateUserComprehensive,
  getUnregisteredEmployees,
  getEmployeeByErpUserId,
  linkErpUser,
  apiClient,
  type UserReadDto,
  type RegisterRequestDto,
  type UpdateUserRequestDto,
  type AppAccessRequest,
} from "@/lib/services";
import type {
  TabKey,
  UnregisteredEmployeeDto,
  RoleAssignments,
  EmployeeProfileDto,
} from "./types";
import { APP_OPTIONS } from "./constants";
import { buildAppAccesses, buildHrmsFormData, getAppRestrictions, getTabData, parseRoleAssignments } from "./logic";
// import { MOCK_USERS } from "./mockData";

/**
 * Encapsulates all state, effects, and handlers for the User Management view.
 * Keeps ViewUserManagement a thin presentational shell.
 */
export function useUserManagement(isAdmin: boolean) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [users, setUsers] = useState<UserReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<null | "register" | "update">(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Registration form state
  const [selectedEmployee, setSelectedEmployee] = useState<UnregisteredEmployeeDto | null>(null);
  const [unregisteredEmployees, setUnregisteredEmployees] = useState<UnregisteredEmployeeDto[]>([]);
  const [role, setRole] = useState("Employee");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [userType, setUserType] = useState("Internal");
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignments>({});

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserReadDto | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Deactivated">("Active");
  const [editApps, setEditApps] = useState<string[]>([]);
  const [editRole, setEditRole] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [hrmsEmployeeData, setHrmsEmployeeData] = useState<EmployeeProfileDto | null>(null);
  const [loadingHrmsData, setLoadingHrmsData] = useState(false);
  const [editRoleAssignments, setEditRoleAssignments] = useState<RoleAssignments>({});

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(`Failed to load users: ${msg}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnregisteredEmployees = async () => {
    try {
      const data = await getUnregisteredEmployees();
      setUnregisteredEmployees(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`Failed to load unregistered employees: ${msg}`);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUnregisteredEmployees();
  }, []);

  const resetForm = () => {
    setSelectedEmployee(null);
    setRole("Employee");
    setSelectedApps([]);
    setUserType("Internal");
    setRoleAssignments({});
  };

  const handleRegister = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!selectedEmployee || selectedApps.length === 0) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const appAccesses: AppAccessRequest[] = buildAppAccesses(
        selectedApps,
        role,
        selectedApps,
        roleAssignments
      );

      const payload: RegisterRequestDto = {
        Email: selectedEmployee.emailAddress ?? "",
        Username: `${selectedEmployee.firstName.toLowerCase()}.${selectedEmployee.lastName.toLowerCase()}`,
        FirstName: selectedEmployee.firstName,
        LastName: selectedEmployee.lastName,
        Role: role,
        Apps: selectedApps,
        Type: userType,
      };

      const registerResult = await registerUser(payload);
      console.log("Registration result:", registerResult);

      if (registerResult.Id) {
        console.log("Linking ERP user ID:", registerResult.Id, "to employee:", selectedEmployee.employeeId);
        await linkErpUser(selectedEmployee.employeeId, registerResult.Id);
        console.log("Successfully linked ERP user to employee");
      } else {
        console.error("No userId returned from registration");
      }

      toast.success("Employee registered successfully!");
      setShowModal(false);
      resetForm();
      await fetchUsers();
      await fetchUnregisteredEmployees();
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("400") || msg.includes("duplicate") || msg.toLowerCase().includes("email")) {
        msg = "Duplicate Email Found - This email address is already registered to another user";
      }
      toast.error(`Registration failed: ${msg}`);
      setErrorMsg(`Registration failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setSelectedApps(getAppRestrictions(newRole));
  };

  const handleSelectAllApps = () => {
    setSelectedApps(APP_OPTIONS.map((app) => app.key));
  };

  const toggleApp = (appKey: string) => {
    setSelectedApps((prev) =>
      prev.includes(appKey) ? prev.filter((a) => a !== appKey) : [...prev, appKey]
    );
  };

  const handleEdit = async (user: UserReadDto) => {
    if (user.Status === "Pending") {
      const emp = unregisteredEmployees.find(e => e.employeeId === Math.abs(user.Id));
      if (emp) {
        setSelectedEmployee(emp);
        setShowModal(true);
      }
      return;
    }


    setEditingUser(user);
    setEditFirstName(user.FirstName);
    setEditLastName(user.LastName);
    setEditEmail(user.Email);
    setEditRole(user.Role);
    setEditStatus(user.Status === "Active" ? "Active" : "Deactivated");

    const appsAsStrings = (user.Apps || []).map((app) =>
      typeof app === "string" ? app : (app as any).appName || app
    );
    setEditApps(appsAsStrings);

    setLoadingHrmsData(true);
    try {
      const hrmsData = await getEmployeeByErpUserId(user.Id.toString());
      setHrmsEmployeeData(hrmsData);
      setEditRoleAssignments((prev) => ({ ...prev, ...parseRoleAssignments(user) }));
    } catch (error) {
      console.error("Failed to fetch HRMS data:", error);
      setHrmsEmployeeData(null);
    } finally {
      setLoadingHrmsData(false);
    }

    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingUser || !editFirstName.trim() || !editLastName.trim() || !editEmail.trim() || !editRole) return;
    setEditSubmitting(true);
    setErrorMsg("");
    try {
      const isActive = editStatus === "Active";

      const appAccesses: AppAccessRequest[] = buildAppAccesses(
        editApps,
        editingUser.Role,
        editApps,
        editRoleAssignments,
        editRole === "Employee"
      );

      const updatePayload: UpdateUserRequestDto = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        isActive,
        roles: [editRole],
        appAccesses,
      };

      // Call 1: Update Auth service
      await updateUserComprehensive(String(editingUser.Id), updatePayload);

      // Call 2: Update HRMS if user has POS/SCMS role and hrmsEmployeeData exists
      if (hrmsEmployeeData && (editApps.includes("point-of-sale") || editApps.includes("supply-chain"))) {
        try {
          const hrmsFormData = buildHrmsFormData(hrmsEmployeeData, editApps, editRoleAssignments);

          if (!hrmsEmployeeData?.EmployeeId) {
            console.error("HRMS EmployeeId is missing, skipping HRMS update");
            toast("Auth updated, but HRMS sync failed (missing EmployeeId). Please update 201 File manually.", { icon: "⚠️" });
          } else {
            await apiClient.put(`/admin/digital201/employees/${hrmsEmployeeData.EmployeeId}`, hrmsFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        } catch (hrmsError) {
          console.error("HRMS update failed:", hrmsError);
          toast("Auth updated, but HRMS sync failed. Please update 201 File manually.", { icon: "⚠️" });
        }
      }

      toast.success("User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      setHrmsEmployeeData(null);

      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Update failed: ${msg}`);
      setErrorMsg(`Update failed: ${msg}`);
    } finally {
      setEditSubmitting(false);
    }
  };

  const toggleEditApp = (appKey: string) => {
    setEditApps((prev) =>
      prev.includes(appKey) ? prev.filter((a) => a !== appKey) : [...prev, appKey]
    );
  };

  const combinedUsers: UserReadDto[] = [
    ...users,
    ...unregisteredEmployees.map((emp) => ({
      Id: -emp.employeeId, // Use negative ID to avoid collision
      FirstName: emp.firstName,
      LastName: emp.lastName,
      Username: "Unregistered",
      Email: emp.emailAddress || "",
      Role: "Pending Registration",
      Status: "Pending",
      Apps: [],
      Type: "Internal",
      SecurityStamp: "",
      IsActive: false,
    } as UserReadDto)),
  ];

  const activeUsers = combinedUsers.filter((u) => u.Status === "Active").length;
  const inactiveUsers = combinedUsers.filter((u) => u.Status === "Inactive").length;

  const { tabUsers, title, subtitle, usersByRole, usersByStatus } = getTabData(
    combinedUsers,
    searchQuery,
    activeTab
  );

  // Pagination: reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, pageSize]);

  const totalItems = tabUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize;
  const paginatedUsers = tabUsers.slice(startIndex, startIndex + pageSize);

  return {
    activeTab, setActiveTab, users, loading, errorMsg, searchQuery, setSearchQuery,
    activeUsers, inactiveUsers, title, subtitle, usersByRole, usersByStatus,
    paginatedUsers,
    pageSize, setPageSize, currentPage, setCurrentPage, totalItems, totalPages, safePage, startIndex,
    showModal, setShowModal, submitting, selectedEmployee, setSelectedEmployee,
    unregisteredEmployees, role, selectedApps, userType, setUserType, roleAssignments,
    setRoleAssignments, handleRegister, handleRoleChange, handleSelectAllApps, toggleApp, resetForm,
    showEditModal, setShowEditModal, editingUser, setEditingUser, hrmsEmployeeData, setHrmsEmployeeData,
    editFirstName, setEditFirstName, editLastName, setEditLastName, editEmail, setEditEmail,
    editStatus, setEditStatus, editApps, setEditApps, editRole, setEditRole, editSubmitting,
    editRoleAssignments, setEditRoleAssignments, handleEdit, handleEditSubmit, toggleEditApp,
    pendingConfirm, setPendingConfirm,
  };
}
