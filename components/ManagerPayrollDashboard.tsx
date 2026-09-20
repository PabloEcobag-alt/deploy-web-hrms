"use client";

import { useAuth } from "@/context/AuthContext";
import { AppSelect } from "@/components/ui/app-select";
import { TableToolbar, TablePagination } from "@/components/features/attendance-biometrics/TableControls";
import { type ManagerPayrollDashboardProps, type CutoffType } from "./features/manager-payroll/types";
import { usePayroll } from "./features/manager-payroll/usePayroll";
import { PayrollTable } from "./features/manager-payroll/PayrollTable";
import { PayoutSummaryCards } from "./features/manager-payroll/PayoutSummaryCards";
import { FinalizeModal, DisburseModal } from "./features/manager-payroll/PayrollModals";

export default function ManagerPayrollDashboard({ c, isDark, readOnly = false }: ManagerPayrollDashboardProps) {
  const { user } = useAuth();
  const isMaker = user?.roles?.includes("SystemAdmin");
  const vm = usePayroll(readOnly);

  return (
    <div className="space-y-4">
      {/* Payout Summary Cards */}
      <PayoutSummaryCards c={c} payrollData={vm.payrollData} payoutSummary={vm.payoutSummary} />

      {vm.loading && (
        <div className="rounded-xl border p-8 text-center" style={{ background: c.cardBg, borderColor: c.cardBorder }}>
          <p className="text-sm font-medium" style={{ color: c.mutedText }}>Loading payroll data…</p>
        </div>
      )}

      {!vm.loading && vm.payrollData.length === 0 && (
        <div className="rounded-xl border p-8 text-center" style={{ background: c.cardBg, borderColor: c.cardBorder }}>
          <p className="text-sm font-medium" style={{ color: c.mutedText }}>No payroll data found</p>
        </div>
      )}

      {/* Payroll Computation Table with search + filter + pagination */}
      {!vm.loading && vm.payrollData.length > 0 && (
        <div className="border border-border rounded-lg bg-white shadow-xs overflow-hidden p-6 space-y-6">
          <TableToolbar
            search={vm.search}
            onSearchChange={(v) => { vm.setSearch(v); vm.setPage(1); }}
            searchPlaceholder="Search by employee..."
            filters={[
              {
                value: vm.statusFilter,
                onChange: (v) => { vm.setStatusFilter(v); vm.setPage(1); },
                allLabel: "All Statuses",
                options: vm.statusOptions,
                minWidth: "min-w-[150px]",
              },
            ]}
            trailing={
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-medium text-foreground whitespace-nowrap">Cut-off Period:</label>
                <AppSelect
                  value={vm.cutoff}
                  onValueChange={(v) => vm.setCutoff(v as CutoffType)}
                  options={[
                    { value: "26th-10th", label: "26th - 10th" },
                    { value: "11th-25th", label: "11th - 25th" },
                  ]}
                  className="w-[140px]"
                />
              </div>
            }
          />

          <div className="border border-border rounded-lg bg-white">
            <PayrollTable
              c={c}
              isDark={isDark}
              readOnly={readOnly}
              isMaker={isMaker}
              loading={vm.loading}
              payrollData={vm.paginatedData}
              onUpdateBonus={vm.updateBonus}
              onCompute={vm.handleComputeRow}
              onFinalize={vm.handleFinalizeRow}
              onOpenDisburse={vm.handleOpenDisburse}
              wrapperClassName="max-h-[600px] rounded-lg"
            />
          </div>

          <TablePagination
            totalItems={vm.total}
            pageSize={vm.pageSize}
            startIndex={vm.startIndex}
            safePage={vm.safePage}
            totalPages={vm.totalPages}
            itemLabel="employees"
            onPrevPage={() => vm.setPage((p) => Math.max(1, p - 1))}
            onNextPage={() => vm.setPage((p) => Math.min(vm.totalPages, p + 1))}
          />
        </div>
      )}

      {/* Action Buttons */}
      {isMaker && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => vm.setShowFinalizeModal(true)}
            className="px-4 py-2 bg-black hover:bg-black/90 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Finalize Payroll
          </button>
        </div>
      )}

      {/* Finalize Confirmation Modal */}
      {vm.showFinalizeModal && isMaker && (
        <FinalizeModal
          c={c}
          isDark={isDark}
          cutoff={vm.cutoff}
          grandTotal={vm.payoutSummary.grandTotal}
          headcount={vm.payrollData.length}
          onClose={() => vm.setShowFinalizeModal(false)}
          onConfirm={vm.handleFinalize}
        />
      )}

      {/* Disburse via GCash Modal */}
      {vm.showDisburseModal && isMaker && (
        <DisburseModal
          c={c}
          isDark={isDark}
          batchRef={vm.batchRef}
          onBatchRefChange={vm.setBatchRef}
          loadingDisburse={vm.loadingDisburse}
          onClose={() => vm.setShowDisburseModal(false)}
          onConfirm={vm.handleDisburse}
        />
      )}
    </div>
  );
}
