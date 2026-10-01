// Types for the Digital 201 File feature.

export interface AdminEmployeeListDto {
  employeeId: number;
  erpUserId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  status: string;
  emailAddress: string;
}

export type EmployeeStatus =
  | "Probationary"
  | "Regular"
  | "Training"
  | "Resigned"
  | "Terminated"
  | "AWOL"
  | "Seasonal";

export interface DocumentStatus {
  completed: boolean;
  lastUpdated: string;
  expiryDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  position: string;
  role?: string;
  assignedLocation: string;
  department: string;
  supervisor?: string;
  hireDate: string;
  status: EmployeeStatus;
  email: string;
  phone: string;
  avatarIndex: number;
  documents: {
    personal: DocumentStatus;
    government: DocumentStatus;
    company: DocumentStatus;
    performance: DocumentStatus;
  };
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  bloodType: string;
  governmentIds: {
    sss: string;
    philHealth: string;
    tin: string;
    hdmf: string;
    nbiExpiration?: string;
    barangayExpiration?: string;
  };
  companyProperty: {
    employeeId: string;
    idIssueDate: string;
    uniformSize: {
      top: string;
      bottom: string;
      shoes: string;
    };
    uniformIssueDate: string;
    equipment: string[];
    returnDate?: string;
  };
  attendanceSummary: {
    attendanceRate: number;
    tardinessCount: number;
    leaveBalance: number;
    totalDaysWorked: number;
  };
  expiringDocuments?: {
    documentName: string;
    expirationDate: string;
    daysLeft: number;
  }[];
  journey?: {
    date: string;
    title: string;
    description: string;
  }[];
  auditLogs?: {
    date: string;
    user: string;
    action: string;
    details: string;
  }[];
  probationEndDate?: string;
}

export interface PendingHire {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  offerAcceptedDate: string;
}

export type ChecklistItem = {
  id: string;
  label: string;
  optional?: boolean;
  subtitle?: string;
};
