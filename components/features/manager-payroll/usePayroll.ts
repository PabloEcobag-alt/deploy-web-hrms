"use client";

import { useState, useEffect, useMemo } from "react";
import {
  computePayroll,
  finalizePayroll,
  getPayrollRuns,
  disbursePayroll,
  type PayrollFinalizeRequestDto,
} from "@/lib/services";
import { type CutoffType, type PayrollRow, formatCurrency, getCutoffDate } from "./types";
import { MOCK_PAYROLL_ROWS } from "./mockData";

/**
 * Encapsulates state, data loading, and payroll actions for the
 * Manager Payroll Dashboard.
 */
export function usePayroll(readOnly: boolean) {
  const [cutoff, setCutoff] = useState<CutoffType>("26th-10th");
  const [payrollData, setPayrollData] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);
  const [batchRef, setBatchRef] = useState("");
  const [loadingDisburse, setLoadingDisburse] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  // Search + status filter + pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setStatusMsg("");
      setStatusType("");
      try {
        const runs = await getPayrollRuns();
        const rows: PayrollRow[] = runs.map((run) => ({
          id: String(run.Id),
          employeeId: `EMP-${String(run.Employee_Id).padStart(3, "0")}`,
          employeeIdNum: run.Employee_Id,
          name: run.Employee_Name,
          position: run.Position,
          basic: run.Basic_Pay,
          ot: run.OT_Pay,
          sss: run.Sss_Deduction,
          philHealth: run.PhilHealth_Deduction,
          pagIbig: run.PagIbig_Deduction,
          tax: run.Tax,
          bonus: run.Bonus,
          netPay: run.Net_Pay,
          payoutMethod: run.Payout_Method as "ATM" | "Cash" | "GCash",
          status: run.Status,
        }));
        // Fall back to mock data when the API returns nothing.
        setPayrollData(rows.length > 0 ? rows : MOCK_PAYROLL_ROWS);
      } catch (err: unknown) {
        // Show mock data so the dashboard is populated even when the API is unavailable.
        setPayrollData(MOCK_PAYROLL_ROWS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleComputeRow = async (row: PayrollRow) => {
    const cutoffDate = getCutoffDate(cutoff);
    setStatusMsg("");
    setStatusType("");
    try {
      const result = await computePayroll(row.employeeIdNum, cutoffDate);
      setPayrollData((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                basic: result.Basic_Pay,
                ot: result.OT_Pay,
                sss: result.Sss_Deduction,
                philHealth: result.PhilHealth_Deduction,
                pagIbig: result.PagIbig_Deduction,
                netPay: result.Net_Pay,
                status: "Computed",
              }
            : r
        )
      );
      setStatusType("success");
      setStatusMsg(`Computed: Net Pay ${formatCurrency(result.Net_Pay)} for ${row.name}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStatusType("error");
      setStatusMsg(`Compute failed for ${row.name}: ${msg}`);
    }
  };

  const handleFinalizeRow = async (row: PayrollRow) => {
    setStatusMsg("");
    setStatusType("");
    try {
      const dto: PayrollFinalizeRequestDto = {
        Employee_Id: row.employeeIdNum,
        Payroll_Run_Id: Number(row.id),
        Basic_Pay: row.basic,
        OT_Pay: row.ot,
        Sss_Deduction: row.sss,
        PhilHealth_Deduction: row.philHealth,
        PagIbig_Deduction: row.pagIbig,
        Net_Pay: row.netPay,
      };
      const record = await finalizePayroll(dto);
      setPayrollData((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "Finalized" } : r)));
      setStatusType("success");
      setStatusMsg(`Finalized: Record #${record.Id} for ${row.name}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStatusType("error");
      setStatusMsg(`Finalize failed for ${row.name}: ${msg}`);
    }
  };

  const handleOpenDisburse = (row: PayrollRow) => {
    setSelectedPayrollId(Number(row.id));
    setBatchRef("");
    setShowDisburseModal(true);
  };

  const handleDisburse = async () => {
    if (!selectedPayrollId || !batchRef.trim()) return;
    setLoadingDisburse(true);
    setStatusMsg("");
    setStatusType("");
    try {
      const result = await disbursePayroll(selectedPayrollId, batchRef.trim());
      setPayrollData((prev) =>
        prev.map((r) => (Number(r.id) === selectedPayrollId ? { ...r, status: "Disbursed" } : r))
      );
      setStatusType("success");
      setStatusMsg(`Disbursed via GCash: Ref #${result.BatchReferenceNumber}.`);
      setShowDisburseModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStatusType("error");
      setStatusMsg(`Disburse failed: ${msg}`);
    } finally {
      setLoadingDisburse(false);
    }
  };

  const updateBonus = (id: string, value: string) => {
    if (readOnly) return;
    const bonus = parseFloat(value) || 0;
    setPayrollData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const newNetPay = row.basic + row.ot + bonus - row.sss - row.philHealth - row.pagIbig - row.tax;
          return { ...row, bonus, netPay: newNetPay };
        }
        return row;
      })
    );
  };

  const payoutSummary = useMemo(() => {
    const atmTotal = payrollData.filter((r) => r.payoutMethod === "ATM").reduce((s, r) => s + r.netPay, 0);
    const cashTotal = payrollData.filter((r) => r.payoutMethod === "Cash").reduce((s, r) => s + r.netPay, 0);
    const gcashTotal = payrollData.filter((r) => r.payoutMethod === "GCash").reduce((s, r) => s + r.netPay, 0);
    const grandTotal = payrollData.reduce((s, r) => s + r.netPay, 0);
    return { atmTotal, cashTotal, gcashTotal, grandTotal };
  }, [payrollData]);

  const handleFinalize = () => {
    console.log("Finalizing payroll:", { cutoff, total: payoutSummary.grandTotal, headcount: payrollData.length });
    setShowFinalizeModal(false);
  };

  // Filtering + pagination for the computation table.
  const statusOptions = useMemo(
    () => Array.from(new Set(payrollData.map((r) => r.status ?? "Draft"))),
    [payrollData]
  );
  const filteredData = useMemo(() => {
    return payrollData.filter((r) => {
      const matchName = r.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "" || (r.status ?? "Draft") === statusFilter;
      return matchName && matchStatus;
    });
  }, [payrollData, search, statusFilter]);
  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  return {
    cutoff, setCutoff, payrollData, loading,
    showFinalizeModal, setShowFinalizeModal, showDisburseModal, setShowDisburseModal,
    batchRef, setBatchRef, loadingDisburse, statusMsg, statusType, payoutSummary,
    handleComputeRow, handleFinalizeRow, handleOpenDisburse, handleDisburse,
    updateBonus, handleFinalize,
    // search + filter + pagination
    search, setSearch, statusFilter, setStatusFilter, statusOptions,
    paginatedData, total, totalPages, safePage, startIndex, pageSize: PAGE_SIZE, setPage,
  };
}
