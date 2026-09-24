"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getEmployeeByErpUserId, type EmployeeProfileDto } from "@/lib/services";

import type { Employee, PendingHire, AdminEmployeeListDto } from "./types";
import { mapAdminDtoToEmployee } from "./utils";
import { MOCK_EMPLOYEES } from "./mockData";

interface AuthUserLike {
  id?: string | number;
  role?: string;
}

/**
 * Encapsulates all state, effects, and handlers for ViewDigital201File.
 */
export function useDigital201(user: AuthUserLike | null | undefined) {
  const role = (user?.role === "Administrator" ? "Admin" : user?.role) || (user as any)?.roles?.[0];

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchName, setSearchName] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSupervisor, setFilterSupervisor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedPendingHire, setSelectedPendingHire] = useState<PendingHire | null>(null);
  const [probationModalOpen, setProbationModalOpen] = useState(false);
  const [pendingDocsModalOpen, setPendingDocsModalOpen] = useState(false);
  const [pendingOnboardingModalOpen, setPendingOnboardingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [adminEmployees, setAdminEmployees] = useState<AdminEmployeeListDto[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [expiringDocuments, setExpiringDocuments] = useState<any[]>([]);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const [contactInfo, setContactInfo] = useState({
    address: "123 Main St, City, State",
    email: "john.doe@company.com",
    phone: "+1-555-0123",
    emergencyContact: {
      firstName: "Jane",
      lastName: "Doe",
      relationship: "Spouse",
      phone: "+1-555-0456",
      address: "123 Main St, City, State",
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfileDto | null>(null);
  const [isLoadingEmployeeProfile, setIsLoadingEmployeeProfile] = useState(false);
  const [employeeProfileError, setEmployeeProfileError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");

  // Load employee profile + contact info
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!user?.id) return;
      setIsLoadingEmployeeProfile(true);
      setEmployeeProfileError(null);
      try {
        const profileData = await getEmployeeByErpUserId(user.id.toString());
        if (profileData) {
          setEmployeeProfile(profileData);
          setContactInfo({
            address: profileData.EmergencyContactAddress || "",
            email: profileData.Email || "",
            phone: profileData.PhoneNumber || "",
            emergencyContact: {
              firstName: profileData.EmergencyContactName?.split(' ')[0] || "",
              lastName: profileData.EmergencyContactName?.split(' ').slice(1).join(' ') || "",
              relationship: profileData.EmergencyContactRelationship || "",
              phone: profileData.EmergencyContactPhone || "",
              address: profileData.EmergencyContactAddress || "",
            },
          });
        } else {
          setEmployeeProfileError("No employee record found for this account");
        }
      } catch (error) {
        console.warn('Failed to load employee profile:', error);
        setEmployeeProfileError("No employee record found for this account");
      } finally {
        setIsLoadingEmployeeProfile(false);
      }
    };
    loadEmployeeData();
  }, [user?.id]);

  const loadAdminEmployees = async () => {
    if (role !== "Admin") {
      setIsLoadingEmployees(false);
      return;
    }
    try {
      setIsLoadingEmployees(true);
      setEmployeeError(null);
      const response = await api.get('/api/admin/digital201/employees');
      setAdminEmployees(response.data);
      try {
        const expiringResponse = await api.get('/api/admin/digital201/documents/expiring?days=30');
        setExpiringDocuments(expiringResponse.data);
      } catch (expiringError) {
        console.warn('Failed to load expiring documents:', expiringError);
        setExpiringDocuments([]);
      }
    } catch (error) {
      console.error('Failed to load admin employees:', error);
      setEmployeeError('Failed to load employee data');
      setAdminEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadAdminEmployees();
  }, [role]);

  const dataSource: Employee[] = role === "Admin" ? adminEmployees.map(mapAdminDtoToEmployee) : MOCK_EMPLOYEES;

  const regularEmployees = dataSource.filter(e => e.status === "Regular").length;
  const probationaryEmployees = dataSource.filter(e => e.status === "Probationary").length;

  const pendingDocuments = dataSource.filter(e =>
    !e.documents.personal.completed ||
    !e.documents.government.completed ||
    !e.documents.company.completed ||
    !e.documents.performance.completed
  ).length;

  const handleViewFile = async (employee: Employee) => {
    try {
      if (role === "Admin") {
        const response = await api.get(`/api/admin/digital201/employees/${employee.id}`);
        const fullEmployee = mapAdminDtoToEmployee(response.data);
        setSelectedEmployee(fullEmployee);
      } else {
        setSelectedEmployee(employee);
      }
      setProfileModalOpen(true);
    } catch (error) {
      console.error("Failed to load full employee profile:", error);
      toast.error("Failed to load employee profile");
      setSelectedEmployee(employee);
      setProfileModalOpen(true);
    }
  };

  const handleEditFile = async (employee: Employee) => {
    try {
      if (role === "Admin") {
        const response = await api.get(`/api/admin/digital201/employees/${employee.id}`);
        const fullEmployee = mapAdminDtoToEmployee(response.data);
        setSelectedEmployee(fullEmployee);
      } else {
        setSelectedEmployee(employee);
      }
      setEditModalOpen(true);
    } catch (error) {
      console.error("Failed to load full employee profile for edit:", error);
      toast.error("Failed to load employee data for edit");
      setSelectedEmployee(employee);
      setEditModalOpen(true);
    }
  };

  const expiringDocs = expiringDocuments.map(doc => ({
    employeeName: doc.employeeName,
    documentType: doc.documentType,
    documentName: doc.documentName,
    daysLeft: doc.daysUntilExpiration,
    expirationDate: doc.expirationDate,
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  const filteredEmployees = dataSource.filter(emp => {
    if (filterPosition && emp.position !== filterPosition) return false;
    if (filterStatus && emp.status !== filterStatus) return false;
    if (filterLocation && emp.assignedLocation !== filterLocation) return false;
    if (filterSupervisor && emp.supervisor !== filterSupervisor) return false;
    if (searchName && !emp.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  });

  const uniqueStatuses = Array.from(new Set(dataSource.map(e => e.status)));

  const tabs = [
    { key: "all", label: "All Employees", count: filteredEmployees.length },
    ...uniqueStatuses.map((status) => ({
      key: status.toLowerCase(),
      label: status,
      count: filteredEmployees.filter((e) => e.status === status).length,
    })),
  ];

  const employees: Employee[] = activeTab === "all"
    ? filteredEmployees
    : filteredEmployees.filter(e => e.status.toLowerCase() === activeTab);

  // Pagination: reset to first page when filters, tab, or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterPosition, filterLocation, filterSupervisor, filterStatus, activeTab, pageSize, searchName]);

  const totalItems = employees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize;
  const paginatedEmployees = employees.slice(startIndex, startIndex + pageSize);

  const handleAddModalClose = () => {
    setAddModalOpen(false);
    setSelectedPendingHire(null);
  };

  const handleReviewHire = (hire: PendingHire) => {
    setSelectedPendingHire(hire);
    setAddModalOpen(true);
  };

  const handleEmployeeCreated = () => {
    if (role === "Admin") loadAdminEmployees();
  };

  const handleSaveContactInfo = async () => {
    setIsSaving(true);
    try {
      await api.patch('/api/digital201/contact-info', contactInfo);
      toast.success('Contact information updated successfully!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update contact information');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    role,
    // modals
    profileModalOpen, setProfileModalOpen, editModalOpen, setEditModalOpen,
    addModalOpen, setAddModalOpen, selectedEmployee, setSelectedEmployee,
    selectedPendingHire, setSelectedPendingHire,
    probationModalOpen, setProbationModalOpen, pendingDocsModalOpen, setPendingDocsModalOpen,
    pendingOnboardingModalOpen, setPendingOnboardingModalOpen,
    // filters + tabs
    searchName, setSearchName, activeTab, setActiveTab, tabs,
    // data
    adminEmployees, isLoadingEmployees, employeeError, expiringDocs,
    regularEmployees, probationaryEmployees, pendingDocuments,
    employees, paginatedEmployees,
    // pagination
    pageSize, setPageSize, currentPage, setCurrentPage, totalItems, totalPages, safePage, startIndex,
    // self-service
    contactInfo, setContactInfo, hasChanges, setHasChanges, isSaving,
    employeeProfile, isLoadingEmployeeProfile, employeeProfileError,
    profilePictureUrl, setProfilePicture, setProfilePictureUrl,
    // handlers
    loadAdminEmployees, handleViewFile, handleEditFile, handleAddModalClose,
    handleReviewHire, handleEmployeeCreated, handleSaveContactInfo,
  };
}
