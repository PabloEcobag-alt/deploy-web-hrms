import apiClient from "./apiClient";
import {
  DashboardSummary,
  ScoreDistribution,
  TopCandidate,
  PositionFit,
  ApplicationTrend,
} from "@/lib/types/analytics";

const BASE_PATH = "/api/hrms/analytics";

export interface HrmsDashboardSummary {
  totalEmployees: number;
  regularEmployees: number;
  totalApplicants: number;
  activeApplicants: number;
  totalAttendanceRecords: number;
  onTimeCount: number;
  totalPayroll: number;
}

export const getHrmsDashboardSummary = async (): Promise<HrmsDashboardSummary> => {
  return (await apiClient.get<HrmsDashboardSummary>(`${BASE_PATH}/hrms-summary`)).data;
};

export const getDashboardSummary = async (startDate?: string, endDate?: string): Promise<DashboardSummary> => {
  try {
    const { data } = await apiClient.get<DashboardSummary>(`${BASE_PATH}/dashboard`, {
      params: startDate || endDate ? { startDate, endDate } : undefined,
    });
    return data;
  } catch (error) {
    console.warn("Failed to fetch dashboard summary; returning empty state", error);
    return {
      totalApplicants: 0,
      totalScored: 0,
      qualifiedCount: 0,
      reviewCount: 0,
      notQualifiedCount: 0,
      qualifiedRate: 0,
      reviewRate: 0,
      notQualifiedRate: 0,
      averageMatchScore: 0,
      lastScoredAt: null,
    };
  }
};

export const getScoreDistribution = async (startDate?: string, endDate?: string): Promise<ScoreDistribution> => {
  try {
    const { data } = await apiClient.get<ScoreDistribution>(`${BASE_PATH}/score-distribution`, {
      params: startDate || endDate ? { startDate, endDate } : undefined,
    });
    return data;
  } catch (error) {
    console.warn("Failed to fetch score distribution; returning empty state", error);
    return { buckets: [] };
  }
};

export const getTopCandidates = async (count = 10, startDate?: string, endDate?: string): Promise<TopCandidate[]> => {
  try {
    const { data } = await apiClient.get<TopCandidate[]>(`${BASE_PATH}/top-candidates`, {
      params: { count, startDate, endDate },
    });
    return data;
  } catch (error) {
    console.warn("Failed to fetch top candidates; returning empty list", error);
    return [];
  }
};

export const getPositionFit = async (startDate?: string, endDate?: string): Promise<PositionFit[]> => {
  try {
    const { data } = await apiClient.get<PositionFit[]>(`${BASE_PATH}/position-fit`, {
      params: startDate || endDate ? { startDate, endDate } : undefined,
    });
    return data;
  } catch (error) {
    console.warn("Failed to fetch position fit; returning empty list", error);
    return [];
  }
};

export const getApplicationTrends = async (startDate?: string, endDate?: string): Promise<ApplicationTrend[]> => {
  try {
    const { data } = await apiClient.get<ApplicationTrend[]>(`${BASE_PATH}/application-trends`, {
      params: startDate || endDate ? { startDate, endDate } : undefined,
    });
    return data;
  } catch (error) {
    console.warn("Failed to fetch application trends; returning empty list", error);
    return [];
  }
};

export const exportAllCandidates = async (startDate?: string, endDate?: string): Promise<TopCandidate[]> => {
  try {
    const { data } = await apiClient.get<TopCandidate[]>(`${BASE_PATH}/export-candidates`, {
      params: startDate || endDate ? { startDate, endDate } : undefined,
    });
    return data;
  } catch (error) {
    console.warn("Failed to export candidates; returning empty list", error);
    return [];
  }
};
