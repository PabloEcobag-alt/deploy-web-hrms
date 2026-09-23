import axios from "axios";

const userManagementClient = axios.create({
  baseURL: "https://dicing-saxophone-food.ngrok-free.dev",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to suppress 404 toasts for expected 404s
userManagementClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // For expected 404s in user management, suppress the error
    // The service methods handle these gracefully by returning empty/null
    if (error.response?.status === 404) {
      // Don't show toast for expected 404s
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export interface UpdateUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: string[];
  appAccesses: AppAccessRequest[];
}

export interface AppAccessRequest {
  appName: string;
  modules: ModuleAccessRequest[];
  locationId?: number;
  subRole?: string;
}

export interface ModuleAccessRequest {
  moduleName: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// Full HRMS employee profile returned by getEmployeeByErpUserId.
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

export interface CreateUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  appAccesses: AppAccessRequest[];
}

export const updateUserComprehensive = async (
  id: string,
  dto: UpdateUserRequestDto
): Promise<void> => {
  await userManagementClient.patch(`/api/erp-auth/users/${id}`, dto);
};

export const createUserComprehensive = async (
  dto: CreateUserRequestDto
): Promise<void> => {
  await userManagementClient.post("/api/erp-auth/register", dto);
};

export const getUserById = async (id: string): Promise<any> => {
  const response = await userManagementClient.get(`/api/erp-auth/users/${id}`);
  return response.data;
};

export const getAllUsers = async (): Promise<any[]> => {
  const response = await userManagementClient.get("/api/erp-auth/users");
  return response.data;
};

export const getUnregisteredEmployees = async (): Promise<any[]> => {
  try {
    const response = await userManagementClient.get("/api/admin/digital201/employees/unregistered");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Unregistered employees endpoint not found, returning empty array");
      return [];
    }
    throw error;
  }
};

export const getEmployeeByErpUserId = async (erpUserId: string): Promise<any> => {
  try {
    const response = await userManagementClient.get(`/api/admin/digital201/employees/by-erp-user/${erpUserId}`);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 404 || status === 400) {
      console.warn(`No employee record found for ErpUserId: ${erpUserId} (status: ${status})`);
      return null;
    }
    throw error;
  }
};

export const linkErpUser = async (employeeId: number, erpUserId: string): Promise<void> => {
  try {
    await userManagementClient.patch("/api/admin/digital201/employees/link-erp-user", {
      employeeId,
      erpUserId
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Link ERP user endpoint not found");
      throw new Error("Unable to link ERP user - endpoint not available");
    }
    throw error;
  }
};
