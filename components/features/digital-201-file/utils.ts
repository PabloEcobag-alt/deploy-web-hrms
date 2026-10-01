"use client";

// Hooks and pure helpers for the Digital 201 File feature.

import type { Employee, EmployeeStatus } from "./types";

export function useDarkMode() {
  // Dark theme removed — the Digital 201 File page is light-only. Always
  // report light mode so no consumer applies dark styling.
  return false;
}

export function useColors(_isDark: boolean) {
  return {
    pageBg: "#ffffff",
    cardBg: "#ffffff",
    cardBorder: "#e5e7eb",
    rowDivider: "#f3f4f6",
    headingText: "#111827",
    bodyText: "#374151",
    mutedText: "#6b7280",
    colHeader: "#6b7280",
    tableRowHover: "#f9fafb",
    bannerBg: "#f5f3ff",
    bannerBorder: "#ddd6fe",
    bannerTitle: "#7c3aed",
    bannerText: "#6d28d9",
    badgeBg: "#f5f3ff",
    badgeText: "#7c3aed",
    tabActive: "#7c3aed",
    tabInactive: "#6b7280",
    tabBorder: "#e5e7eb",
    barBg: "#e5e7eb",
    completed: "#7c3aed",
    pending: "#6b7280",
    inProgress: "#8b5cf6",
    probationary: "#7c3aed",
    regular: "#7c3aed",
    training: "#a78bfa",
    deduction: "#6b7280",
    highSalary: "#7c3aed",
    resigned: "#6b7280",
    terminated: "#111827",
    awol: "#6b7280",
    seasonal: "#8b5cf6",
  };
}

export type Colors = ReturnType<typeof useColors>;

export function getStatusColor(status: EmployeeStatus, c: Colors) {
  switch (status) {
    case "Regular": return c.regular;
    case "Probationary": return c.probationary;
    case "Training": return c.training;
    case "Resigned": return c.resigned;
    case "Terminated": return c.terminated;
    case "Seasonal": return c.seasonal;
    case "AWOL": return c.awol;
    default: return c.bodyText;
  }
}

export function getDocumentColor(completed: boolean, c: Colors) {
  return completed ? c.completed : c.pending;
}

export function getExpiryStatus(
  expiryDate: string | undefined,
): { status: "expired" | "warning" | "ok"; daysUntil: number } {
  if (!expiryDate) return { status: "ok", daysUntil: 999 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { status: "expired", daysUntil };
  if (daysUntil <= 30) return { status: "warning", daysUntil };
  return { status: "ok", daysUntil };
}

export function getRowHighlight(employee: Employee): string {
  const documents = [
    employee.documents.personal.expiryDate,
    employee.documents.government.expiryDate,
    employee.documents.company.expiryDate,
  ];
  for (const expiry of documents) {
    if (!expiry) continue;
    const status = getExpiryStatus(expiry);
    if (status.status === "expired") return "#fee2e2";
    if (status.status === "warning") return "#fef3c7";
  }
  return "transparent";
}

// Build a compact list of page numbers with ellipsis for pagination controls.
export function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export function mapAdminDtoToEmployee(adminDto: any): Employee {
  return {
    id: adminDto.employeeId?.toString() || adminDto.EmployeeId?.toString() || "0",
    name: `${adminDto.firstName || adminDto.FirstName || ""} ${adminDto.lastName || adminDto.LastName || ""}`,
    initials: `${(adminDto.firstName || adminDto.FirstName || "")[0]}${(adminDto.lastName || adminDto.LastName || "")[0]}`,
    position: adminDto.position || adminDto.Position || "Not Available",
    assignedLocation: adminDto.assignedLocation || adminDto.AssignedLocation || "",
    department: adminDto.department || adminDto.Department || "Not Available",
    supervisor: adminDto.supervisor || adminDto.Supervisor || "",
    hireDate: "",
    status: (adminDto.status || adminDto.Status || "Active") as EmployeeStatus,
    email: adminDto.emailAddress || adminDto.EmailAddress || "",
    phone: adminDto.phoneNumber || adminDto.PhoneNumber || "",
    avatarIndex: 0,
    documents: {
      personal: { completed: false, lastUpdated: "", expiryDate: "" },
      government: { completed: false, lastUpdated: "", expiryDate: "" },
      company: { completed: false, lastUpdated: "", expiryDate: "" },
      performance: { completed: false, lastUpdated: "", expiryDate: "" },
    },
    address: "",
    emergencyContact: {
      name: adminDto.emergencyContactName || adminDto.EmergencyContactName || "",
      relationship: "",
      phone: adminDto.emergencyContactPhone || adminDto.EmergencyContactPhone || "",
    },
    dateOfBirth: adminDto.dateOfBirth || adminDto.DateOfBirth || "",
    gender: "",
    civilStatus: "",
    bloodType: "",
    governmentIds: {
      sss: adminDto.sss || adminDto.SSS || "",
      philHealth: adminDto.philHealth || adminDto.PhilHealth || "",
      hdmf: adminDto.pagIbig || adminDto.PagIbig || "",
      tin: adminDto.tin || adminDto.TIN || "",
      nbiExpiration: adminDto.nbiExpiration || adminDto.NbiClearanceDate || "",
      barangayExpiration: adminDto.barangayExpiration || adminDto.BarangayClearanceDate || "",
    },
    attendanceSummary: undefined as any,
    expiringDocuments: undefined,
    companyProperty: {
      employeeId: adminDto.companyIdNumber || adminDto.CompanyIdNumber || "",
    } as any,
  };
}
