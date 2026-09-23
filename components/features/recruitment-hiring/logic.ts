// Pure helpers for the Recruitment & Hiring feature.

import type { Applicant, ApplicantFormData } from "./types";
import {
  POSITIONS,
  AVATAR_STYLES,
  initGovIds,
  initRequirements,
  initEmploymentDocs,
  initHealthDocs,
} from "./constants";

/**
 * Map raw applicant DTOs from the API into the client Applicant model,
 * newest first (applicant IDs are sequential).
 */
export function mapApplicants(data: any): Applicant[] {
  if (!data) return [];
  // Extract the array if the backend wrapped it in an object
  const dataArray = Array.isArray(data) ? data : (data.data || data.items || []);

  return dataArray
    .map((a: any, idx: number): Applicant => ({
      id: a.applicant_Id?.toString() || idx.toString(),
      firstName: a.first_Name || a.firstName || "",
      middleName: a.middle_Name || a.middleName || "",
      lastName: a.last_Name || a.lastName || "",
      position: a.position || POSITIONS[0],
      status: a.status || "Training",
      stage: a.hiring_Stage || "Initial Interview",
      source: a.source || "Walk-In",
      govIds: { 
        sss: !!a.checklist?.has_SSS, 
        pagibig: !!a.checklist?.has_PAGIBIG, 
        philhealth: !!a.checklist?.has_PhilHealth, 
        tin: !!a.checklist?.has_TIN 
      },
      requirements: { 
        nbi: !!a.checklist?.has_NBI, 
        medical: !!a.checklist?.has_Medical, 
        xray: !!a.checklist?.has_Xray 
      },
      employmentDocs: initEmploymentDocs(),
      healthDocs: initHealthDocs(),
      email: a.email || "",
      phone: a.mobile || a.phone || "",
      avatarIndex: idx % AVATAR_STYLES.length,
      appliedDate: a.application_Date || new Date().toISOString().split("T")[0],
      interviewDate: a.interview_Date || "",
      expectedStart: a.expected_Start_Date || a.expectedStartDate || "",
      aiMatchScore: a.ai_Match_Score ?? a.aiMatchScore ?? undefined,
    }))
    .sort((x, y) => Number(y.id) - Number(x.id));
}

/**
 * Build the create-applicant DTO from the modal form data.
 */
export function buildApplicantDto(form: ApplicantFormData) {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    position: form.position,
    source: form.source,
    hiringStage: form.stage || "Initial Interview",
    interviewDate: form.interviewDate || form.appliedDate,
    expectedStart: (form as any).expectedStart || form.appliedDate,
    resume_URL: form.resumeFileName || "",
    contact_Details: form.middleName || "",
    status: "Training",
  };
}
