"use client";

import React from "react";
import Link from "next/link";
import { Users, UserCheck, Clock, DollarSign, ArrowRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { BarChartCard, PieChartCard, type ChartDatum } from "@/components/features/dashboard/DashboardCharts";

import { MOCK_EMPLOYEES } from "@/components/features/digital-201-file/mockData";
import { MOCK_APPLICANTS } from "@/components/features/recruitment-hiring/mockData";
import { MOCK_ATTENDANCE } from "@/components/features/attendance-biometrics/mockData";
import { MOCK_PAYROLL } from "@/components/features/payroll-deduction/mockData";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount);
}

import { getHrmsDashboardSummary, HrmsDashboardSummary } from "@/lib/services/analyticsService";

// Pastel pill styles for the recent-applicants stage column.
const STAGE_STYLES: Record<string, string> = {
  Hired: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Probationary: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  "Job Offer": "bg-violet-50 text-violet-700 border-violet-200/60",
  "Final Interview": "bg-sky-50 text-sky-700 border-sky-200/60",
  "Initial Interview": "bg-teal-50 text-teal-700 border-teal-200/60",
  Failed: "bg-rose-50 text-rose-700 border-rose-200/60",
};

import { getAllApplicants } from "@/lib/services/applicantService";
import apiClient from "@/lib/services/apiClient";

export default function ViewDashboard() {
  // ── Stat card metrics ────────────────────────────────────────────────
  const [summary, setSummary] = React.useState<HrmsDashboardSummary | null>(null);
  const [applicants, setApplicants] = React.useState<any[] | null>(null);
  const [employees, setEmployees] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    getHrmsDashboardSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error("Failed to load HRMS summary", err));
      
    getAllApplicants()
      .then((data) => setApplicants(data))
      .catch((err) => console.error("Failed to load applicants", err));
      
    apiClient.get('/api/admin/digital201/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Failed to load employees", err));
  }, []);

  const totalEmployees = summary ? summary.totalEmployees : MOCK_EMPLOYEES.length;
  const regularEmployees = summary ? summary.regularEmployees : MOCK_EMPLOYEES.filter((e) => e.status === "Regular").length;
  const totalApplicants = summary ? summary.totalApplicants : MOCK_APPLICANTS.length;
  const activeApplicants = summary ? summary.activeApplicants : MOCK_APPLICANTS.filter((a) => a.stage !== "Hired" && a.stage !== "Failed").length;
  const onTimeCount = summary ? summary.onTimeCount : MOCK_ATTENDANCE.filter((r) => r.late.frequency === 0 && r.absences === 0).length;
  const totalAttendanceRecords = summary ? summary.totalAttendanceRecords : MOCK_ATTENDANCE.length;
  const attendanceRate = totalAttendanceRecords > 0 ? Math.round((onTimeCount / totalAttendanceRecords) * 100) : 0;
  const totalPayroll = summary ? summary.totalPayroll : MOCK_PAYROLL.reduce((sum, r) => sum + r.realPay, 0);

  // Use dynamic arrays if available, else fallback to MOCK
  const applicantsList = applicants || MOCK_APPLICANTS;
  const employeesList = employees || MOCK_EMPLOYEES;

  // ── Chart data ───────────────────────────────────────────────────────
  const applicantsByStage: ChartDatum[] = Object.entries(
    applicantsList.reduce((acc, a) => {
      // Map API fields (hiring_Stage or stage)
      const stage = a.hiring_Stage || a.stage || "Initial Interview";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const attendanceStatus: ChartDatum[] = [
    { name: "On Time", value: onTimeCount },
    { name: "Late", value: MOCK_ATTENDANCE.filter((r) => r.late.frequency > 0).length },
    { name: "Early Out", value: MOCK_ATTENDANCE.filter((r) => r.early.frequency > 0).length },
    { name: "Absent", value: MOCK_ATTENDANCE.filter((r) => r.absences > 0).length },
  ].filter((d) => d.value > 0);

  const employeesByStatus: ChartDatum[] = Object.entries(
    employeesList.reduce((acc, e) => {
      const status = e.status || "Probationary";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // ── Recent activity ──────────────────────────────────────────────────
  const recentApplicants = [...applicantsList]
    .sort((a, b) => {
      const aId = a.applicant_Id || a.id;
      const bId = b.applicant_Id || b.id;
      return Number(bId) - Number(aId);
    })
    .slice(0, 5);

  const topEarners = [...MOCK_PAYROLL].sort((a, b) => b.realPay - a.realPay).slice(0, 5);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 max-w-7xl mx-auto bg-background flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground m-0">HR Management Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Overview of employees, recruitment, attendance, and payroll
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Employees" value={totalEmployees} icon={Users} description={`${regularEmployees} regular`} />
        <StatCard label="Applicants" value={totalApplicants} icon={UserCheck} description={`${activeApplicants} active`} />
        <StatCard label="On-Time Rate" value={`${attendanceRate}%`} icon={Clock} description={`${onTimeCount}/${MOCK_ATTENDANCE.length}`} />
        <StatCard label="Payroll (Net)" value={formatCurrency(totalPayroll)} icon={DollarSign} description={`${MOCK_PAYROLL.length} employees`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="lg:col-span-2">
          <BarChartCard
            title="Applicants by Hiring Stage"
            subtitle="Current recruitment pipeline"
            data={applicantsByStage}
          />
        </div>
        <PieChartCard
          title="Attendance Status"
          subtitle="Today's breakdown"
          data={attendanceStatus}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <PieChartCard
          title="Employees by Status"
          subtitle="Workforce composition"
          data={employeesByStatus}
        />
        <div className="lg:col-span-2">
          <BarChartCard
            title="Top Net Pay (Employee Payroll)"
            subtitle="Highest net pay this period"
            data={topEarners.map((r) => ({ name: r.employeeName.split(" ")[0], value: Math.round(r.realPay) }))}
            barColor="#0ea5e9"
          />
        </div>
      </div>

      {/* Recent Applicants */}
      <div className="border border-border rounded-lg bg-white shadow-xs overflow-hidden">
        <div className="p-3 md:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold m-0 text-foreground">Recent Applicants</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Latest candidates in the pipeline</p>
          </div>
          <Link href="/recruitment-hiring" className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-background">
              <TableRow className="border-b border-border">
                <TableHead className="w-[280px] min-w-[280px] text-base font-medium text-muted-foreground px-5 py-4">Name</TableHead>
                <TableHead className="w-[220px] min-w-[220px] text-base font-medium text-muted-foreground px-5 py-4">Position</TableHead>
                <TableHead className="w-[180px] min-w-[180px] text-base font-medium text-muted-foreground px-5 py-4">Stage</TableHead>
                <TableHead className="w-[160px] min-w-[160px] text-base font-medium text-muted-foreground px-5 py-4">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplicants.map((a) => (
                <TableRow key={a.applicant_Id || a.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                  <TableCell className="w-[280px] min-w-[280px] px-5 py-4">
                    <span className="font-medium text-base text-foreground">{a.first_Name || a.firstName} {a.last_Name || a.lastName}</span>
                  </TableCell>
                  <TableCell className="w-[220px] min-w-[220px] px-5 py-4 text-base font-normal text-muted-foreground">{a.position}</TableCell>
                  <TableCell className="w-[180px] min-w-[180px] px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STAGE_STYLES[a.hiring_Stage || a.stage] || "bg-slate-50 text-slate-700 border-slate-200/60"}`}>
                      {a.hiring_Stage || a.stage || "Initial Interview"}
                    </span>
                  </TableCell>
                  <TableCell className="w-[160px] min-w-[160px] px-5 py-4 text-base font-normal text-muted-foreground">{a.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}
