"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ManagerPayrollDashboard from "../components/ManagerPayrollDashboard";
import EmployeePayslipViewer from "../components/EmployeePayslipViewer";

import {
  useDarkMode,
  useColors,
} from "@/components/features/payroll-deduction/utils";
import { MOCK_PAYROLL } from "@/components/features/payroll-deduction/mockData";
import { PayrollStatCard } from "@/components/features/payroll-deduction/badges";
import { PayrollTable } from "@/components/features/payroll-deduction/PayrollTable";
import { TableToolbar, TablePagination } from "@/components/features/attendance-biometrics/TableControls";

export type PayrollSection = "computation" | "employee";

const PAGE_SIZE = 8;

const SECTION_META: Record<PayrollSection, { title: string; subtitle: string }> = {
  computation: {
    title: "Payroll Computation",
    subtitle: "Select cut-off period and compute, finalize, and disburse payroll",
  },
  employee: {
    title: "Employee Payroll",
    subtitle: "Complete payroll breakdown, allowances, deductions, and net pay per employee",
  },
};

export default function ViewPayrollDeduction({ section = "computation" }: { section?: PayrollSection }) {
  const isDark = useDarkMode();
  const c = useColors(isDark);
  const { user } = useAuth();
  const role = user?.roles?.[0];

  const meta = SECTION_META[section];

  const totalRealPay = MOCK_PAYROLL.reduce((sum, record) => sum + record.realPay, 0);
  const totalDeductions = MOCK_PAYROLL.reduce((sum, record) => sum + record.deductions.total, 0);
  const totalAdditionalWage = MOCK_PAYROLL.reduce((sum, record) => sum + record.additionalWage.total, 0);
  const totalReducedWage = MOCK_PAYROLL.reduce((sum, record) => sum + record.reducedWage.total, 0);

  // Employee Payroll filters + pagination
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [page, setPage] = useState(1);

  const positions = useMemo(
    () => Array.from(new Set(MOCK_PAYROLL.map((r) => r.position))).sort(),
    []
  );
  const filtered = useMemo(() => {
    return MOCK_PAYROLL.filter((r) => {
      const matchName = r.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchPos = positionFilter === "" || r.position === positionFilter;
      return matchName && matchPos;
    });
  }, [search, positionFilter]);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 max-w-7xl mx-auto bg-background flex flex-col gap-4 md:gap-6">

      {/* Header — shows the active sub-tab's name */}
      <div>
        <h1 className="text-2xl font-bold text-foreground m-0">{meta.title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
      </div>

      {role === "Employee" ? (
        <EmployeePayslipViewer c={c} isDark={isDark} />
      ) : (
        <>
          {/* ── Payroll Computation ─────────────────────────────────────────── */}
          {section === "computation" && (
            <ManagerPayrollDashboard c={c} isDark={isDark} readOnly={role !== "SystemAdmin"} />
          )}

          {/* ── Employee Payroll ────────────────────────────────────────────── */}
          {section === "employee" && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <PayrollStatCard label="Total Real Pay" amount={totalRealPay} count={MOCK_PAYROLL.length} c={c} />
                <PayrollStatCard label="Add'l Wage" amount={totalAdditionalWage} count={MOCK_PAYROLL.length} c={c} />
                <PayrollStatCard label="Reduced Wage" amount={totalReducedWage} count={MOCK_PAYROLL.length} c={c} />
                <PayrollStatCard label="Total Deductions" amount={totalDeductions} count={MOCK_PAYROLL.length} c={c} />
              </div>

              <div className="border border-border rounded-lg bg-white shadow-xs overflow-hidden p-6 space-y-6">
              <TableToolbar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                searchPlaceholder="Search by employee..."
                filters={[
                  {
                    value: positionFilter,
                    onChange: (v) => { setPositionFilter(v); setPage(1); },
                    allLabel: "All Positions",
                    options: positions,
                    minWidth: "min-w-[160px]",
                  },
                ]}
              />

              <div className="border border-border rounded-lg bg-white">
                <PayrollTable payroll={paginated} wrapperClassName="max-h-[600px] rounded-lg" />
              </div>

              <TablePagination
                totalItems={total}
                pageSize={PAGE_SIZE}
                startIndex={startIndex}
                safePage={safePage}
                totalPages={totalPages}
                itemLabel="employees"
                onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}
