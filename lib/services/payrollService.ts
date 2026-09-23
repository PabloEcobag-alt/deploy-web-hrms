import axios from "axios";

const payrollApiClient = axios.create({
  baseURL: "https://dicing-saxophone-food.ngrok-free.dev",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface PayrollLineItemDto {
  Description: string;
  Amount: number;
}

export interface PayrollComputeRequestDto {
  Employee_Id: number;
  Cutoff_Date: string;
}

export interface PayrollComputeResultDto {
  Employee_Id: number;
  Cutoff_Date: string;
  Daily_Rate: number;
  Days_Worked: number;
  Basic_Pay: number;
  OT_Hours: number;
  OT_Pay: number;
  Sss_Deduction: number;
  PhilHealth_Deduction: number;
  PagIbig_Deduction: number;
  Total_Deductions: number;
  Net_Pay: number;
  Line_Items: PayrollLineItemDto[];
}

export interface PayrollFinalizeRequestDto {
  Employee_Id: number;
  Payroll_Run_Id: number;
  Basic_Pay: number;
  OT_Pay: number;
  Sss_Deduction: number;
  PhilHealth_Deduction: number;
  PagIbig_Deduction: number;
  Net_Pay: number;
}

export interface PayrollRecordReadDto {
  Id: number;
  Payroll_Run_Id: number;
  Employee_Id: number;
  Basic_Pay: number;
  OT_Pay: number;
  Sss_Deduction: number;
  PhilHealth_Deduction: number;
  PagIbig_Deduction: number;
  Net_Pay: number;
}

export interface PayrollRunListItemDto {
  Id: number;
  Employee_Id: number;
  Employee_Name: string;
  Position: string;
  Basic_Pay: number;
  OT_Pay: number;
  Sss_Deduction: number;
  PhilHealth_Deduction: number;
  PagIbig_Deduction: number;
  Tax: number;
  Bonus: number;
  Net_Pay: number;
  Status: string;
  Payout_Method: string;
}

export interface DisburseRequestDto {
  BatchReferenceNumber: string;
}

export interface DisburseResultDto {
  Id: number;
  Status: string;
  BatchReferenceNumber: string;
}

/**
 * api-hrms serializes responses with System.Text.Json's default camelCase
 * naming policy, which only lowercases the first character of each C#
 * property (e.g. Employee_Id -> employee_Id, OT_Pay -> oT_Pay). The helpers
 * below normalize that wire format back into our PascalCase typed contract
 * so the rest of the app reads strongly-typed, predictable fields.
 */
type CamelCaseKey<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Lowercase<First>}${Rest}`
  : S;

const getField = <T>(source: Record<string, unknown>, key: string): T => {
  const camelKey = (key.charAt(0).toLowerCase() + key.slice(1)) as CamelCaseKey<string>;
  const value = source[key] ?? source[camelKey];
  return value as T;
};

const normalizeComputeResult = (
  data: Record<string, unknown>
): PayrollComputeResultDto => ({
  Employee_Id: getField<number>(data, "Employee_Id"),
  Cutoff_Date: getField<string>(data, "Cutoff_Date"),
  Daily_Rate: getField<number>(data, "Daily_Rate"),
  Days_Worked: getField<number>(data, "Days_Worked"),
  Basic_Pay: getField<number>(data, "Basic_Pay"),
  OT_Hours: getField<number>(data, "OT_Hours"),
  OT_Pay: getField<number>(data, "OT_Pay"),
  Sss_Deduction: getField<number>(data, "Sss_Deduction"),
  PhilHealth_Deduction: getField<number>(data, "PhilHealth_Deduction"),
  PagIbig_Deduction: getField<number>(data, "PagIbig_Deduction"),
  Total_Deductions: getField<number>(data, "Total_Deductions"),
  Net_Pay: getField<number>(data, "Net_Pay"),
  Line_Items: (getField<Record<string, unknown>[]>(data, "Line_Items") ?? []).map(
    (item) => ({
      Description: getField<string>(item, "Description"),
      Amount: getField<number>(item, "Amount"),
    })
  ),
});

const normalizeRecordRead = (
  data: Record<string, unknown>
): PayrollRecordReadDto => ({
  Id: getField<number>(data, "Id"),
  Payroll_Run_Id: getField<number>(data, "Payroll_Run_Id"),
  Employee_Id: getField<number>(data, "Employee_Id"),
  Basic_Pay: getField<number>(data, "Basic_Pay"),
  OT_Pay: getField<number>(data, "OT_Pay"),
  Sss_Deduction: getField<number>(data, "Sss_Deduction"),
  PhilHealth_Deduction: getField<number>(data, "PhilHealth_Deduction"),
  PagIbig_Deduction: getField<number>(data, "PagIbig_Deduction"),
  Net_Pay: getField<number>(data, "Net_Pay"),
});

const normalizeRecordList = (
  data: Record<string, unknown>[]
): PayrollRunListItemDto[] =>
  data.map((item) => ({
    Id: getField<number>(item, "Id"),
    Employee_Id: getField<number>(item, "Employee_Id"),
    Employee_Name: getField<string>(item, "Employee_Name"),
    Position: getField<string>(item, "Position"),
    Basic_Pay: getField<number>(item, "Basic_Pay"),
    OT_Pay: getField<number>(item, "OT_Pay"),
    Sss_Deduction: getField<number>(item, "Sss_Deduction"),
    PhilHealth_Deduction: getField<number>(item, "PhilHealth_Deduction"),
    PagIbig_Deduction: getField<number>(item, "PagIbig_Deduction"),
    Tax: getField<number>(item, "Tax"),
    Bonus: getField<number>(item, "Bonus"),
    Net_Pay: getField<number>(item, "Net_Pay"),
    Status: getField<string>(item, "Status"),
    Payout_Method: getField<string>(item, "Payout_Method"),
  }));

export const computePayroll = async (
  employeeId: number,
  cutoffDate: string
): Promise<PayrollComputeResultDto> => {
  const payload: PayrollComputeRequestDto = {
    Employee_Id: employeeId,
    Cutoff_Date: cutoffDate,
  };
  const response = await payrollApiClient.post<Record<string, unknown>>(
    "/api/hrms/payroll/compute",
    payload
  );
  return normalizeComputeResult(response.data);
};

export const finalizePayroll = async (
  dto: PayrollFinalizeRequestDto
): Promise<PayrollRecordReadDto> => {
  const response = await payrollApiClient.post<Record<string, unknown>>(
    "/api/hrms/payroll/finalize",
    dto
  );
  return normalizeRecordRead(response.data);
};

export const getPayrollRuns = async (): Promise<PayrollRunListItemDto[]> => {
  const response = await payrollApiClient.get<Record<string, unknown>[]>("/api/hrms/payroll");
  return normalizeRecordList(response.data);
};

export const disbursePayroll = async (
  payrollId: number,
  batchReferenceNumber: string
): Promise<DisburseResultDto> => {
  const payload: DisburseRequestDto = { BatchReferenceNumber: batchReferenceNumber };
  const response = await payrollApiClient.put<Record<string, unknown>>(
    `/api/hrms/payroll/${payrollId}/disburse`,
    payload
  );
  return {
    Id: getField<number>(response.data, "Id"),
    Status: getField<string>(response.data, "Status"),
    BatchReferenceNumber: getField<string>(response.data, "BatchReferenceNumber"),
  };
};
