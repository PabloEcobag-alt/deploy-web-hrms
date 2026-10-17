// Form initialization / mapping helpers for the applicant add/edit modal.

import type { Applicant, ApplicantFormData } from "./types";
import {
  POSITIONS,
  DEFAULT_ROLE_SALARIES,
  EMPLOYMENT_DOCUMENTS,
  HEALTH_CHECKLIST,
  initGovIds,
  initRequirements,
} from "./constants";

export function emptyForm(): ApplicantFormData {
  const defaultPos = POSITIONS[0];
  const target = DEFAULT_ROLE_SALARIES[defaultPos] || 15000;
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    position: defaultPos,
    source: "Walk-In",
    stage: "Initial Interview",
    email: "",
    phone: "",
    appliedDate: new Date().toISOString().split("T")[0],
    interviewDate: "",
    govIds: initGovIds(),
    requirements: initRequirements(),
    employmentDocs: Object.fromEntries(EMPLOYMENT_DOCUMENTS.map((d) => [d.key, false])),
    healthDocs: Object.fromEntries(HEALTH_CHECKLIST.map((h) => [h.key, false])),
    resumeFileName: "",
    startDate: "",
    probationaryEndDate: "",
    targetSalary: target,
    expectedSalary: target,
    approvedSalary: target,
    interviewer: "",
  };
}

export function applicantToForm(a: Applicant): ApplicantFormData {
  const target = a.targetSalary || DEFAULT_ROLE_SALARIES[a.position] || 15000;
  return {
    firstName: a.firstName,
    middleName: a.middleName ?? "",
    lastName: a.lastName,
    position: a.position,
    source: a.source,
    stage: a.stage,
    email: a.email,
    phone: a.phone,
    appliedDate: a.appliedDate,
    interviewDate: a.interviewDate,
    govIds: { ...a.govIds },
    requirements: { ...a.requirements },
    employmentDocs: {
      ...(a.employmentDocs ??
        Object.fromEntries(EMPLOYMENT_DOCUMENTS.map((d) => [d.key, false]))),
    },
    healthDocs: {
      ...(a.healthDocs ??
        Object.fromEntries(HEALTH_CHECKLIST.map((h) => [h.key, false]))),
    },
    resumeFileName: a.resumeFileName ?? "",
    startDate: (a as any).startDate ?? (a as any).expectedStart ?? "",
    probationaryEndDate: (a as any).probationaryEndDate ?? "",
    targetSalary: target,
    expectedSalary: a.expectedSalary ?? a.approvedSalary ?? target,
    approvedSalary: a.approvedSalary ?? target,
    interviewer: a.interviewer ?? "",
  };
}
