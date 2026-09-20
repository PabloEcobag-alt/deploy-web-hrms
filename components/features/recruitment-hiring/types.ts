// Types for the Recruitment & Hiring feature.

export type ApplicantStatus = "Training" | "Probationary" | "Regular";
export type HiringStage =
  | "Initial Interview"
  | "Final Interview"
  | "Job Offer"
  | "Hired"
  | "Probationary"
  | "Failed";
export type ApplicantSource =
  | "Summer Job"
  | "Walk-In"
  | "Gmail Submission"
  | "Website Portal";

export type GovernmentIds = Record<string, boolean>;
export type HiringRequirements = Record<string, boolean>;
export type EmploymentDocs = Record<string, boolean>;
export type HealthDocs = Record<string, boolean>;

export interface Applicant {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  position: string;
  status: ApplicantStatus;
  stage: HiringStage;
  source: ApplicantSource;
  govIds: GovernmentIds;
  requirements: HiringRequirements;
  email: string;
  phone: string;
  avatarIndex: number;
  appliedDate: string;
  interviewDate: string;
  expectedStart: string;
  employmentDocs?: EmploymentDocs;
  healthDocs?: HealthDocs;
  resumeFileName?: string;
  aiMatchScore?: number;
}

export interface ApplicantFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  position: string;
  source: ApplicantSource;
  stage: HiringStage;
  email: string;
  phone: string;
  appliedDate: string;
  interviewDate: string;
  govIds: GovernmentIds;
  requirements: HiringRequirements;
  employmentDocs: EmploymentDocs;
  healthDocs: HealthDocs;
  resumeFileName: string;
  startDate?: string;
  probationaryEndDate?: string;
}
