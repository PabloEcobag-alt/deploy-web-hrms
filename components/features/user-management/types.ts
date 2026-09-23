// Types for the User Management feature.

export type UserStatus = "Active" | "Inactive" | "Suspended" | "Pending";

export type TabKey = "all" | "role" | "status";

export interface ModulePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// Employee that has not yet been registered as a system user.
export interface UnregisteredEmployeeDto {
  employeeId: number;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  emailAddress?: string;
}

// Per-app role assignment configuration used by the registration/edit modals.
export interface RoleAssignments {
  pos?: {
    branchLocation?: string;
    branchRole?: string;
  };
  scms?: {
    role?: string;
  };
}

// Read-only HRMS employee profile surfaced when editing a user.
export interface EmployeeProfileDto {
  EmployeeId?: number;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DateOfBirth: string;
  DateHired: string;
  Status: string;
  Email: string;
  PhoneNumber: string;
  Position: string;
  Department: string;
  AssignedLocation: string;
  EmergencyContactName: string;
  EmergencyContactPhone: string;
  EmergencyContactAddress: string;
  EmergencyContactRelationship: string;
  SSS: string;
  PhilHealth: string;
  PagIbig: string;
  TIN: string;
  NbiClearanceDate: string;
  BarangayClearanceDate: string;
  BankDetails: string;
  UniformIssued?: boolean;
  CompanyIdIssued?: boolean;
  CompanyIdNumber: string;
  EquipmentIssued: string;
  CheckedBy: string;
  CheckedDate: string;
  Remarks: string;
}
