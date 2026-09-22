import apiClient from "./apiClient";

export const getAllApplicants = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get("/api/hrms/applicants");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Applicants endpoint not found, returning empty array");
      return [];
    }
    throw error;
  }
};

export const createApplicant = async (dto: any): Promise<any> => {
  try {
    const response = await apiClient.post("/api/hrms/applicants", dto);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Create applicant endpoint not found");
      throw new Error("Unable to create applicant - endpoint not available");
    }
    throw error;
  }
};

export const hireApplicant = async (payload: any): Promise<any> => {
  try {
    const response = await apiClient.post("/api/hrms/applicants/hire", payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("Hire applicant endpoint not found");
      throw new Error("Unable to hire applicant - endpoint not available");
    }
    throw error;
  }
};

export const updateApplicant = async (id: number, data: any): Promise<boolean> => {
  try {
    const response = await apiClient.patch(`/api/hrms/applicants/${id}`, data);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error("Update applicant error:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.warn("Update applicant endpoint not found");
      throw new Error("Unable to update applicant - endpoint not available");
    }
    if (error.response?.status === 400) {
      console.warn("Invalid request data for update applicant");
      throw new Error("Invalid request data");
    }
    throw error;
  }
};
