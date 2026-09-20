"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import EmployeeESS from "../components/EmployeeESS";
import ManagerBiometricDashboard from "../components/ManagerBiometricDashboard";

import {
  useDarkMode,
  useColors,
} from "@/components/features/attendance-biometrics/utils";
import { MOCK_ATTENDANCE } from "@/components/features/attendance-biometrics/mockData";
import { AttendanceStatCard } from "@/components/features/attendance-biometrics/badges";
import { AttendanceTable } from "@/components/features/attendance-biometrics/AttendanceTable";
import { TableToolbar, TablePagination } from "@/components/features/attendance-biometrics/TableControls";
import { AppSelect } from "@/components/ui/app-select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const PAGE_SIZE = 8;

interface PeriodOption {
  value: string;
  label: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Parse a "YYYY-MM-DD" string into a local Date (falls back to today on invalid). */
function parseDate(value: string): Date {
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Build "Month Year" options spanning every month between start and end (inclusive). */
function buildMonthOptions(start: string, end: string): PeriodOption[] {
  const s = parseDate(start);
  const e = parseDate(end);
  if (e < s) return [];
  const options: PeriodOption[] = [];
  const cursor = new Date(s.getFullYear(), s.getMonth(), 1);
  const last = new Date(e.getFullYear(), e.getMonth(), 1);
  while (cursor <= last && options.length < 240) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    options.push({
      value: `${y}-${String(m + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[m]} ${y}`,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return options;
}

/** ISO-8601 week number + week-numbering year for a date. */
function getIsoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // shift to Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/** Monday of the ISO week for a given date. */
function mondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Build ISO-week options spanning every week between start and end (inclusive). */
function buildWeekOptions(start: string, end: string): PeriodOption[] {
  const s = parseDate(start);
  const e = parseDate(end);
  if (e < s) return [];
  const options: PeriodOption[] = [];
  const cursor = mondayOfWeek(s);
  const lastMonday = mondayOfWeek(e);
  while (cursor <= lastMonday && options.length < 520) {
    const { year, week } = getIsoWeek(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startLabel = `${SHORT_MONTHS[cursor.getMonth()]} ${cursor.getDate()}`;
    const endLabel =
      cursor.getMonth() === weekEnd.getMonth()
        ? `${weekEnd.getDate()}`
        : `${SHORT_MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
    options.push({
      value: `${year}-W${String(week).padStart(2, "0")}`,
      label: `Week ${week} (${startLabel}–${endLabel}, ${weekEnd.getFullYear()})`,
    });
    cursor.setDate(cursor.getDate() + 7);
  }
  return options;
}

// Pastel pill styles for the pending-requests table.
const REQUEST_TYPE_STYLES: Record<string, string> = {
  "Sick Leave": "bg-sky-50 text-sky-700 border-sky-200/60",
  "Cash Advance": "bg-violet-50 text-violet-700 border-violet-200/60",
  "Vacation Leave": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
};

interface PendingRequest {
  employee: string;
  type: string;
  date: string;
  reason: string;
}

const PENDING_REQUESTS: PendingRequest[] = [
  { employee: "John Doe", type: "Sick Leave", date: "2026-05-15", reason: "Flu symptoms" },
  { employee: "Jane Smith", type: "Cash Advance", date: "2026-05-14", reason: "Medical emergency" },
  { employee: "Mike Johnson", type: "Vacation Leave", date: "2026-05-20", reason: "Family vacation" },
];

export type AttendanceSection = "live" | "requests" | "daily";

const SECTION_META: Record<AttendanceSection, { title: string; subtitle: string }> = {
  live: { title: "Live Biometrics", subtitle: "Real-time biometric attendance monitoring" },
  requests: { title: "Leave & Cash Advance", subtitle: "Review and approve employee requests" },
  daily: { title: "Daily Attendance", subtitle: "Employee attendance records and audit logs" },
};

export default function ViewAttendanceBiometrics({ section = "live" }: { section?: AttendanceSection }) {
  const isDark = useDarkMode();
  const c = useColors(isDark);
  const { user } = useAuth();
  const role = user?.roles?.[0];

  const [auditMode, setAuditMode] = useState<"week" | "month">("week");
  const [auditWeek, setAuditWeek] = useState("2026-W18");
  const [auditMonth, setAuditMonth] = useState("2026-04");
  const [periodStart, setPeriodStart] = useState("2026-04-01");
  const [periodEnd, setPeriodEnd] = useState("2026-04-25");

  // Week/Month options are derived from the selected period range.
  const monthOptions = useMemo(() => buildMonthOptions(periodStart, periodEnd), [periodStart, periodEnd]);
  const weekOptions = useMemo(() => buildWeekOptions(periodStart, periodEnd), [periodStart, periodEnd]);

  // Keep the selected week/month valid for the current range; default to the first option.
  useEffect(() => {
    if (monthOptions.length > 0 && !monthOptions.some((o) => o.value === auditMonth)) {
      setAuditMonth(monthOptions[0].value);
    }
  }, [monthOptions]);
  useEffect(() => {
    if (weekOptions.length > 0 && !weekOptions.some((o) => o.value === auditWeek)) {
      setAuditWeek(weekOptions[0].value);
    }
  }, [weekOptions]);

  // Daily Attendance filters + pagination
  const [dailySearch, setDailySearch] = useState("");
  const [dailyDept, setDailyDept] = useState("");
  const [dailyPage, setDailyPage] = useState(1);

  // Leave & Cash Advance filters + pagination
  const [reqSearch, setReqSearch] = useState("");
  const [reqType, setReqType] = useState("");
  const [reqPage, setReqPage] = useState(1);
  // Approve/Reject confirmation
  const [pendingAction, setPendingAction] = useState<{ request: PendingRequest; action: "approve" | "reject" } | null>(null);

  const confirmRequestAction = () => {
    if (!pendingAction) return;
    const { request, action } = pendingAction;
    if (action === "approve") {
      toast.success(`Approved ${request.type} request for ${request.employee}.`);
    } else {
      toast.error(`Rejected ${request.type} request for ${request.employee}.`);
    }
    setPendingAction(null);
  };

  const meta = SECTION_META[section];

  const handleExportExcel = () => {
    console.log("Downloading .xlsx");
  };

  const onTimeCount = MOCK_ATTENDANCE.filter(r => r.late.frequency === 0 && r.absences === 0).length;
  const lateCount = MOCK_ATTENDANCE.filter(r => r.late.frequency > 0).length;
  const absentCount = MOCK_ATTENDANCE.filter(r => r.absences > 0).length;
  const earlyCount = MOCK_ATTENDANCE.filter(r => r.early.frequency > 0).length;

  // ── Daily Attendance filtering + pagination ────────────────────────────
  const departments = useMemo(
    () => Array.from(new Set(MOCK_ATTENDANCE.map(r => r.department))).sort(),
    []
  );
  const filteredDaily = useMemo(() => {
    return MOCK_ATTENDANCE.filter(r => {
      const matchName = r.name.toLowerCase().includes(dailySearch.toLowerCase());
      const matchDept = dailyDept === "" || r.department === dailyDept;
      return matchName && matchDept;
    });
  }, [dailySearch, dailyDept]);
  const dailyTotal = filteredDaily.length;
  const dailyTotalPages = Math.max(1, Math.ceil(dailyTotal / PAGE_SIZE));
  const dailySafePage = Math.min(dailyPage, dailyTotalPages);
  const dailyStart = dailyTotal === 0 ? 0 : (dailySafePage - 1) * PAGE_SIZE;
  const paginatedDaily = filteredDaily.slice(dailyStart, dailyStart + PAGE_SIZE);

  // ── Leave & Cash Advance filtering + pagination ────────────────────────
  const requestTypes = useMemo(
    () => Array.from(new Set(PENDING_REQUESTS.map(r => r.type))).sort(),
    []
  );
  const filteredReq = useMemo(() => {
    return PENDING_REQUESTS.filter(r => {
      const matchName = r.employee.toLowerCase().includes(reqSearch.toLowerCase());
      const matchType = reqType === "" || r.type === reqType;
      return matchName && matchType;
    });
  }, [reqSearch, reqType]);
  const reqTotal = filteredReq.length;
  const reqTotalPages = Math.max(1, Math.ceil(reqTotal / PAGE_SIZE));
  const reqSafePage = Math.min(reqPage, reqTotalPages);
  const reqStart = reqTotal === 0 ? 0 : (reqSafePage - 1) * PAGE_SIZE;
  const paginatedReq = filteredReq.slice(reqStart, reqStart + PAGE_SIZE);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 max-w-7xl mx-auto bg-background flex flex-col gap-4 md:gap-6">

      {/* Header — shows the active sub-tab's name */}
      <div>
        <h1 className="text-2xl font-bold text-foreground m-0">{meta.title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {meta.subtitle}
        </p>
      </div>

      {role === "Employee" ? (
        <EmployeeESS c={c} isDark={isDark} />
      ) : (
        <>
          {/* Stat Cards (Live Biometrics only) */}
          {section === "live" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <AttendanceStatCard label="On Time" count={onTimeCount} issuesCount={0} />
              <AttendanceStatCard label="Late Arrivals" count={lateCount} issuesCount={lateCount} />
              <AttendanceStatCard label="Absent" count={absentCount} issuesCount={absentCount} />
              <AttendanceStatCard label="Early Out" count={earlyCount} issuesCount={0} />
            </div>
          )}

          {/* ── Live Biometrics ────────────────────────────────────────────── */}
          {section === "live" && (
            <ManagerBiometricDashboard c={c} isDark={isDark} readOnly={role !== "Admin"} />
          )}

          {/* ── Leave & Cash Advance ──────────────────────────────────────── */}
          {section === "requests" && (
            <div className="border border-border rounded-lg bg-white shadow-xs overflow-hidden p-6 space-y-6">
              <TableToolbar
                search={reqSearch}
                onSearchChange={(v) => { setReqSearch(v); setReqPage(1); }}
                searchPlaceholder="Search by employee..."
                filters={[
                  {
                    value: reqType,
                    onChange: (v) => { setReqType(v); setReqPage(1); },
                    allLabel: "All Types",
                    options: requestTypes,
                    minWidth: "min-w-[140px]",
                  },
                ]}
              />

              <div className="border border-border rounded-lg bg-white">
                {paginatedReq.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No requests match the current filters.
                  </div>
                ) : (
                  <Table className="w-full" wrapperClassName="max-h-[600px] rounded-lg">
                    <TableHeader className="bg-background sticky top-0 z-10">
                      <TableRow className="border-b border-border">
                        <TableHead className="w-[220px] min-w-[220px] text-base font-medium text-muted-foreground px-5 py-4">Employee</TableHead>
                        <TableHead className="w-[180px] min-w-[180px] text-base font-medium text-muted-foreground px-5 py-4">Type</TableHead>
                        <TableHead className="w-[150px] min-w-[150px] text-base font-medium text-muted-foreground px-5 py-4">Date</TableHead>
                        <TableHead className="w-[220px] min-w-[220px] text-base font-medium text-muted-foreground px-5 py-4">Reason</TableHead>
                        <TableHead className="w-[130px] min-w-[130px] text-base font-medium text-muted-foreground px-5 py-4">Status</TableHead>
                        <TableHead className="w-[180px] min-w-[180px] text-base font-medium text-muted-foreground px-5 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReq.map((req) => (
                        <TableRow
                          key={req.employee}
                          className="hover:bg-muted/50 transition-colors border-b border-border"
                        >
                          <TableCell className="w-[220px] min-w-[220px] px-5 py-4 font-medium text-base text-foreground">{req.employee}</TableCell>
                          <TableCell className="w-[180px] min-w-[180px] px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${REQUEST_TYPE_STYLES[req.type] || "bg-slate-50 text-slate-700 border-slate-200/60"}`}>
                              {req.type}
                            </span>
                          </TableCell>
                          <TableCell className="w-[150px] min-w-[150px] px-5 py-4 text-base font-normal text-muted-foreground">{req.date}</TableCell>
                          <TableCell className="w-[220px] min-w-[220px] px-5 py-4 text-base font-normal text-muted-foreground">{req.reason}</TableCell>
                          <TableCell className="w-[130px] min-w-[130px] px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200/60">Pending</span>
                          </TableCell>
                          <TableCell className="w-[180px] min-w-[180px] px-5 py-4">
                            <div className="flex gap-1.5">
                              <button onClick={() => setPendingAction({ request: req, action: "approve" })} className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Approve</button>
                              <button onClick={() => setPendingAction({ request: req, action: "reject" })} className="px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-white text-foreground hover:bg-muted transition-colors">Reject</button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <TablePagination
                totalItems={reqTotal}
                pageSize={PAGE_SIZE}
                startIndex={reqStart}
                safePage={reqSafePage}
                totalPages={reqTotalPages}
                itemLabel="requests"
                onPrevPage={() => setReqPage((p) => Math.max(1, p - 1))}
                onNextPage={() => setReqPage((p) => Math.min(reqTotalPages, p + 1))}
              />
            </div>
          )}

          {/* ── Daily Attendance ──────────────────────────────────────────── */}
          {section === "daily" && (
            <>
              {/* Period + Audit controls + Export (single row) */}
              <div className="p-3 md:p-4 rounded-xl border border-border bg-white shadow-xs flex flex-wrap items-center gap-3 md:gap-4">
                {/* Period (selectable date range) */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-foreground shrink-0 whitespace-nowrap">Period</label>
                  <input
                    type="date"
                    value={periodStart}
                    max={periodEnd || undefined}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-white text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="date"
                    value={periodEnd}
                    min={periodStart || undefined}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-white text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Audit controls + Export (right-aligned group) */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 md:ml-auto">
                  {/* Audit By + Select Week/Month — only shown once a period is selected */}
                  {periodStart && periodEnd && (
                    <>
                      {/* Audit By */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-foreground shrink-0 whitespace-nowrap">Audit By</label>
                        <AppSelect
                          value={auditMode}
                          onValueChange={(v) => setAuditMode(v as "week" | "month")}
                          options={[
                            { value: "week", label: "Week" },
                            { value: "month", label: "Month" },
                          ]}
                          className="w-[110px]"
                        />
                      </div>

                      {/* Select Week / Month */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-foreground shrink-0 whitespace-nowrap">
                          {auditMode === "week" ? "Select Week" : "Select Month"}
                        </label>
                        {auditMode === "week" ? (
                          <AppSelect
                            value={auditWeek}
                            options={weekOptions}
                            onValueChange={setAuditWeek}
                            className="w-[220px]"
                            placeholder="Select week"
                          />
                        ) : (
                          <AppSelect
                            value={auditMonth}
                            options={monthOptions}
                            onValueChange={setAuditMonth}
                            className="w-[180px]"
                            placeholder="Select month"
                          />
                        )}
                      </div>
                    </>
                  )}

                  {/* Export to Excel */}
                  <div>
                    <button
                      onClick={handleExportExcel}
                      className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export to Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Table card: toolbar + scroll container + pagination */}
              <div className="border border-border rounded-lg bg-white shadow-xs overflow-hidden p-6 space-y-6">
                <TableToolbar
                  search={dailySearch}
                  onSearchChange={(v) => { setDailySearch(v); setDailyPage(1); }}
                  searchPlaceholder="Search by name..."
                  filters={[
                    {
                      value: dailyDept,
                      onChange: (v) => { setDailyDept(v); setDailyPage(1); },
                      allLabel: "All Departments",
                      options: departments,
                      minWidth: "min-w-[160px]",
                    },
                  ]}
                />

                <div className="border border-border rounded-lg bg-white">
                  <AttendanceTable attendance={paginatedDaily} wrapperClassName="max-h-[600px] rounded-lg" />
                </div>

                <TablePagination
                  totalItems={dailyTotal}
                  pageSize={PAGE_SIZE}
                  startIndex={dailyStart}
                  safePage={dailySafePage}
                  totalPages={dailyTotalPages}
                  itemLabel="employees"
                  onPrevPage={() => setDailyPage((p) => Math.max(1, p - 1))}
                  onNextPage={() => setDailyPage((p) => Math.min(dailyTotalPages, p + 1))}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Approve / Reject confirmation */}
      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.action === "approve" ? "Approve request?" : "Reject request?"}
        description={
          pendingAction
            ? `This will ${pendingAction.action} the ${pendingAction.request.type} request for ${pendingAction.request.employee}.`
            : undefined
        }
        confirmLabel={pendingAction?.action === "approve" ? "Approve" : "Reject"}
        cancelLabel="Cancel"
        destructive={pendingAction?.action === "reject"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmRequestAction}
      />

    </div>
  );
}
