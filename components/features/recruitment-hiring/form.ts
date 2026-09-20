// Form initialization / mapping helpers for the applicant add/edit modal.

import type { Applicant, ApplicantFormData } from "./types";
import {
  POSITIONS,
  EMPLOYMENT_DOCUMENTS,
  HEALTH_CHECKLIST,
  initGovIds,
  initRequirements,
} from "./constants";

export function emptyForm(): ApplicantFormData {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    position: POSITIONS[0],
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
  };
}

export function applicantToForm(a: Applicant): ApplicantFormData {
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
    startDate: a.startDate ?? "",
    probationaryEndDate: a.probationaryEndDate ?? "",
  };
}
