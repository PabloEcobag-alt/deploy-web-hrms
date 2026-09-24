import axios from "axios";

const authApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface UserReadDto {
  Id: number;
  FirstName: string;
  LastName: string;
  Username: string;
  Email: string;
  Role: string;
  Status: string;
  Apps: string[];
  Type: string;
  SecurityStamp: string;
  IsActive: boolean;
}

export interface RegisterRequestDto {
  Email: string;
  Username: string;
  FirstName: string;
  LastName: string;
  Role: string;
  Apps: string[];
  Type: string;
}

export interface UpdateProfileRequestDto {
  Email: string;
  FirstName: string;
  LastName: string;
}

export interface UpdateAppsRequestDto {
  Apps: string[];
}

export interface RegisterResultDto {
  Id: string;
  Username: string;
  Email: string;
  TemporaryPassword?: string;
  Password?: string;
}

type CamelCaseKey<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Lowercase<First>}${Rest}`
  : S;

const getField = <T>(source: Record<string, unknown>, key: string): T => {
  const camelKey = (key.charAt(0).toLowerCase() + key.slice(1)) as CamelCaseKey<string>;
  const value = source[key] ?? source[camelKey];
  return value as T;
};

const normalizeUserRead = (data: Record<string, unknown>): UserReadDto => ({
  Id: getField<number>(data, "Id") || (data.id as string).length, // Use GUID length as fallback ID
  FirstName: getField<string>(data, "FirstName"),
  LastName: getField<string>(data, "LastName"),
  Username: getField<string>(data, "Username"),
  Email: getField<string>(data, "Email"),
  Role: getField<string>(data, "Role") || (data.roles as string[])?.[0] || "Employee",
  Status: getField<string>(data, "Status") || (getField<boolean>(data, "IsActive") === false ? "Inactive" : "Active"),
  Apps: getField<string[]>(data, "Apps") || (data.apps as Array<{appName: string}>)?.map(a => a.appName) || [],
  Type: getField<string>(data, "Type") ?? "Internal",
  SecurityStamp: getField<string>(data, "SecurityStamp") ?? "",
  IsActive: getField<boolean>(data, "IsActive") ?? true,
});

export const getUsers = async (): Promise<UserReadDto[]> => {
  const response = await authApiClient.get<Record<string, unknown>>("/api/erp-auth/users");
  const users = response.data.users as Record<string, unknown>[];
  console.log("Raw users from backend:", users);
  const normalized = users.map(normalizeUserRead);
  console.log("Normalized users:", normalized);
  return normalized;
};

export const registerUser = async (
  dto: RegisterRequestDto
): Promise<RegisterResultDto> => {
  console.log("RegisterUser called with dto:", JSON.stringify(dto, null, 2));
  
  // Convert RegisterRequestDto to backend ErpRegisterRequest format
  const apps = dto.Apps || dto.apps || [];
  const appAccesses = apps.map(app => ({
    AppName: app,
    Modules: [
      {
        ModuleName: app,
        CanRead: true,
        CanWrite: true,
        CanDelete: true,
        CanExport: true
      }
    ],
    LocationId: apps.includes("point-of-sale") ? 1 : null,
    SubRole: apps.includes("point-of-sale") ? "Manager" : null
  }));

  const backendPayload = {
    FirstName: dto.FirstName,
    LastName: dto.LastName,
    Email: dto.Email,
    AppAccesses: appAccesses
  };

  console.log("Registering user with payload:", JSON.stringify(backendPayload, null, 2));
  const response = await authApiClient.post<Record<string, unknown>>("/api/erp-auth/register", backendPayload);
  
  return {
    Id: getField<string>(response.data, "userId"),
    Username: getField<string>(response.data, "Username"),
    Email: getField<string>(response.data, "Email"),
    TemporaryPassword: getField<string>(response.data, "TemporaryPassword") || getField<string>(response.data, "Password"),
  };
};

export const updateUserProfile = async (
  id: number,
  dto: UpdateProfileRequestDto
): Promise<void> => {
  await authApiClient.put(`/api/auth/users/${id}/profile`, dto);
};

export const updateUserApps = async (
  id: number,
  dto: UpdateAppsRequestDto
): Promise<void> => {
  await authApiClient.put(`/api/auth/users/${id}/apps`, dto);
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
): Promise<void> => {
  await authApiClient.post("/api/erp-auth/reset-password", {
    Email: email,
    Token: token,
    NewPassword: newPassword
  });
};
