"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { getAllApplicants, updateApplicant, createApplicant, apiClient, hireApplicant } from "@/lib/services";
import type { Applicant, ApplicantSource, HiringStage, ApplicantFormData } from "./types";
import { getFullName, getDaysUntil } from "./utils";
import { MOCK_APPLICANTS } from "./mockData";
import { mapApplicants, buildApplicantDto } from "./logic";
import { renderNewApplicantToast } from "./NewApplicantToast";

export type ModalMode = null | "add" | "edit" | "view";
export type UserRoleMode = "manager" | "vp" | "employee";

/**
 * Encapsulates all state, effects, and handlers for the Recruitment & Hiring view.
 */
export function useRecruitment() {
  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS);
  const [searchName, setSearchName] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterSource, setFilterSource] = useState<ApplicantSource | "">("");
  const [filterStage, setFilterStage] = useState<HiringStage | "">("");
  const [mainTableTab, setMainTableTab] = useState<"all" | "upcoming">("all");
  const [vpSortBy, setVpSortBy] = useState<"name" | "position" | "source">("name");
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Applicant | null>(null);
  const [pendingSave, setPendingSave] = useState<{ form: ApplicantFormData; mode: "add" | "edit" } | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [scheduleModalFor, setScheduleModalFor] = useState<string | null>(null);
  const [interviewSchedules, setInterviewSchedules] = useState<Array<{ applicantId: string; date: string; notes?: string }>>(() => {
    try { return JSON.parse(localStorage.getItem("interviewSchedules") || "[]"); } catch (e) { return []; }
  });
  const headerHideRef = useRef<Map<Element, string>>(new Map());
  const notifiedApplicantIds = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const [userRole, setUserRole] = useState<UserRoleMode>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("userRoleMode");
      return (s === "manager" || s === "vp" || s === "employee") ? s : "manager";
    }
    return "manager";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const s = localStorage.getItem("userRoleMode");
      if (s === "manager" || s === "vp" || s === "employee") setUserRole(s);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);



  // Fetch applicants from API + poll every 10s
  useEffect(() => {
    const notifyNewApplicants = (mapped: Applicant[]) => {
      const unseen = mapped.filter(a => !notifiedApplicantIds.current.has(a.id));
      const toToast = isInitialLoadRef.current ? unseen.slice(0, 1) : unseen;
      unseen.forEach(a => notifiedApplicantIds.current.add(a.id));
      isInitialLoadRef.current = false;
      toToast.forEach(a => {
        toast.custom((t) => renderNewApplicantToast(a, t), { id: `new-applicant-${a.id}`, duration: 7000 });
      });
    };

    const fetchApplicants = async () => {
      try {
        const data = await getAllApplicants();
        const mapped = mapApplicants(data);
        if (mapped.length > 0) {
          setApplicants(mapped);
          notifyNewApplicants(mapped);
        } else {
          setApplicants(MOCK_APPLICANTS);
        }
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
        console.warn("API Error intercepted. Falling back to mock data. Error: ", err);
        setApplicants(MOCK_APPLICANTS);
      }
    };

    fetchApplicants();
    const interval = setInterval(fetchApplicants, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hide global/top header when Add Applicant modal is open
  useEffect(() => {
    const selectors = ["header", ".topbar", ".app-header", "#topbar", ".navbar", ".global-header"];
    if (modal === "add") {
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          try {
            headerHideRef.current.set(el, (el as HTMLElement).style.display || "");
            (el as HTMLElement).style.display = "none";
          } catch (e) { /* ignore */ }
        });
      });
    } else {
      headerHideRef.current.forEach((val, el) => {
        try { (el as HTMLElement).style.display = val || ""; } catch (e) { /* ignore */ }
      });
      headerHideRef.current.clear();
    }
    return () => {
      headerHideRef.current.forEach((val, el) => {
        try { (el as HTMLElement).style.display = val || ""; } catch (e) { /* ignore */ }
      });
      headerHideRef.current.clear();
    };
  }, [modal]);

  // Counts
  const trainingCount = applicants.filter(a => a.status === "Training").length;
  const urgentInterviews = useMemo(() => applicants.filter(a => {
    const d = getDaysUntil(a.interviewDate);
    return d >= 0 && d <= 3;
  }).length, [applicants]);

  const activeCandidates = applicants.filter(a => a.stage !== "Hired").length;
  const hiredCount = applicants.filter(a => a.stage === "Hired").length;
  const forInterviewCount = applicants.filter(a => a.stage === "Initial Interview" || a.stage === "Final Interview").length;
  const probationaryStageCount = applicants.filter(a => a.stage === "Probationary").length;
  const reqWalkingCount = applicants.filter(a => a.stage === "Requirement Walking").length;
  const upcomingInterviews = useMemo(() => {
    const today = new Date();
    return [...applicants]
      .filter(a => a.interviewDate)
      .map(a => ({ ...a, _d: new Date(a.interviewDate) }))
      .filter(x => !isNaN(x._d.getTime()) && x._d >= new Date(today.toISOString().split('T')[0]))
      .sort((a, b) => a._d.getTime() - b._d.getTime())
      .slice(0, 3);
  }, [applicants]);

  // Filtering
  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const fullName = getFullName(a).toLowerCase();
      const matchName = fullName.includes(searchName.toLowerCase());
      const matchPos = filterPosition === "" || a.position === filterPosition;
      const matchSource = filterSource === "" || a.source === filterSource;
      const matchStage = filterStage === "" || a.stage === filterStage;
      return matchName && matchPos && matchSource && matchStage;
    });
  }, [applicants, searchName, filterPosition, filterSource, filterStage]);

  const tabFiltered = useMemo(() => {
    if (mainTableTab === "upcoming") {
      const upcomingIds = new Set(upcomingInterviews.map(u => u.id));
      return filtered.filter(a => upcomingIds.has(a.id));
    }
    return filtered;
  }, [filtered, mainTableTab, upcomingInterviews]);

  // Pagination: reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, filterPosition, filterSource, filterStage, pageSize]);

  const totalItems = tabFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize;
  const paginatedApplicants = tabFiltered.slice(startIndex, startIndex + pageSize);

  const vpApplicants = useMemo(() => [...filtered].sort((a, b) =>
    vpSortBy === "name" ? getFullName(a).localeCompare(getFullName(b))
      : vpSortBy === "position" ? a.position.localeCompare(b.position)
        : a.source.localeCompare(b.source)
  ), [filtered, vpSortBy]);

  // Handlers
  async function doSave(form: ApplicantFormData, mode: "add" | "edit") {
    if (mode === "add") {
      try {
        const applicantDto = buildApplicantDto(form);
        await createApplicant(applicantDto);
        const updatedApplicants = await getAllApplicants();
        setApplicants(mapApplicants(updatedApplicants));
        toast.success("Applicant added successfully");
      } catch (error) {
        console.error("Failed to create applicant:", error);
        toast.error("Failed to add applicant");
        return;
      }
    } else if (mode === "edit" && selectedApplicant) {
      const isTransformationStage = (form.stage === "Hired" || form.stage === "Probationary") &&
        selectedApplicant.stage !== form.stage;
      try {
        const applicantId = parseInt(selectedApplicant.id);
        if (isTransformationStage) {
          try {
            const payload = {
              applicantId: applicantId,
              hiringStage: form.stage,
              startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
              probationaryEndDate: form.probationaryEndDate ? new Date(form.probationaryEndDate).toISOString() : undefined,
            };
            const response = await hireApplicant(payload);
            toast.success(`Applicant transformed to employee successfully! Employee ID: ${response.employeeId || response.id || 'Generated'}`);
            setApplicants(prev => prev.map(a => a.id === selectedApplicant.id ? { ...a, stage: form.stage as HiringStage } : a));
          } catch (error: any) {
            console.error("Failed to transform applicant to employee:", error);
            handleTransformError(error);
          }
        } else {
          await updateApplicant(applicantId, {
              First_Name: form.firstName || null,
              Middle_Name: form.middleName || null,
              Last_Name: form.lastName || null,
              Interview_Date: form.interviewDate || null,
              Hiring_Stage: form.stage || null,
              Position: form.position || null,
              Email: form.email || null,
              Mobile: form.phone || null,
              Requirements: { ...form.requirements, ...form.govIds }
          });
          setApplicants(prev => prev.map(a => a.id === selectedApplicant.id ? {
            ...a,
            firstName: form.firstName, middleName: form.middleName, lastName: form.lastName,
            position: form.position, source: form.source, stage: form.stage as HiringStage,
            email: form.email, phone: form.phone,
            appliedDate: form.appliedDate, interviewDate: form.interviewDate,
            govIds: form.govIds, requirements: form.requirements, employmentDocs: form.employmentDocs, resumeFileName: form.resumeFileName,
          } : a));
          toast.success("Applicant updated successfully");
        }
      } catch (error: any) {
        console.error("Failed to update applicant:", error);
        toast.error("Failed to update applicant. Please try again.");
        return;
      }
    }
    setModal(null);
    setSelectedApplicant(null);
  }

  function handleTransformError(error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.details || "Invalid request data. Please try again.";
    if (error.response?.status === 404) {
      toast.error("Transformation endpoint not available. Please contact support.");
    } else if (error.response?.status === 400) {
      toast.error(errorMsg);
    } else {
      toast.error("Failed to transform applicant to employee. Please try again.");
    }
  }

  async function handleStageChange(id: string, stage: HiringStage) {
    const prevStage = applicants.find(a => a.id === id)?.stage ?? "Initial Interview";

    if (stage === "Hired" || stage === "Probationary") {
      toast.error("Please use the Edit Applicant modal to set a Start Date before hiring.");
      return;
    }

    try {
      const applicantId = parseInt(id);
      await updateApplicant(applicantId, { Hiring_Stage: stage });
      setApplicants(prev => prev.map(a => (a.id !== id ? a : { ...a, stage })));
    } catch (error) {
      console.error("Failed to update hiring stage:", error);
      toast.error("Failed to update hiring stage");
    }
  }

  async function saveInterviewSchedule(applicantId: string, date: string, notes?: string) {
    setInterviewSchedules(prev => {
      const next = [...prev.filter(s => !(s.applicantId === applicantId && s.date === date)), { applicantId, date, notes }];
      try { localStorage.setItem("interviewSchedules", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      const id = parseInt(applicantId);
      await updateApplicant(id, { Interview_Date: date });
      setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, interviewDate: date } : a));
    } catch (error) {
      console.error("Failed to update interview date:", error);
    }
    setScheduleModalFor(null);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setApplicants(prev => prev.filter(a => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return {
    applicants, userRole,
    searchName, setSearchName, filterPosition, setFilterPosition, filterSource, setFilterSource,
    filterStage, setFilterStage, mainTableTab, setMainTableTab, vpSortBy, setVpSortBy,
    modal, setModal, selectedApplicant, setSelectedApplicant, deleteTarget, setDeleteTarget,
    pendingSave, setPendingSave, scheduleModalFor, setScheduleModalFor,
    trainingCount, urgentInterviews, activeCandidates, hiredCount, forInterviewCount,
    probationaryStageCount, reqWalkingCount, upcomingInterviews,
    filtered, tabFiltered, vpApplicants, paginatedApplicants,
    pageSize, setPageSize, currentPage, setCurrentPage, totalItems, totalPages, safePage, startIndex,
    doSave, handleStageChange, saveInterviewSchedule, handleDeleteConfirm,
  };
}
