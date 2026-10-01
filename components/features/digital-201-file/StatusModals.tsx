"use client";

import { createPortal } from "react-dom";
import { type Colors } from "./utils";
import { MOCK_EMPLOYEES } from "./mockData";
import { MOCK_PENDING_HIRES } from "./constants";
import { PendingHireTable } from "./EmployeeTables";

export function ProbationModal({ isOpen, onClose, c }: any) {
  if (!isOpen) return null;
  const probationaryEmployees = MOCK_EMPLOYEES.filter(e => e.status === "Probationary");

  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[999999] flex items-center justify-center isolation-auto" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyCenter: 'center', backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl max-w-6xl w-[92vw] overflow-hidden shadow-2xl bg-white" style={{ border: `1px solid ${c.cardBorder}` }}>
        <div className="flex items-center justify-between p-6 border-b bg-white" style={{ borderColor: c.cardBorder }}>
          <h2 className="text-xl font-bold" style={{ color: c.headingText }}>Probationary Evaluation Schedule</h2>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-gray-200 text-gray-500 hover:text-gray-900 focus:outline-none">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-white">
          {probationaryEmployees.length > 0 ? (
            <div className="space-y-4">
              {probationaryEmployees.map(emp => {
                const daysLeft = getDaysRemaining(emp.probationEndDate || new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString());
                const isUrgent = daysLeft < 30;

                // Timeline progress logic
                const hireDateObj = new Date(emp.hireDate);
                const now = new Date();
                const monthsPassed = Math.max(0, (now.getFullYear() - hireDateObj.getFullYear()) * 12 + now.getMonth() - hireDateObj.getMonth());
                const progressSegments = 5;
                const activeIndex = Math.min(progressSegments, monthsPassed);
                const trackWidth = (activeIndex / progressSegments) * 100;

                return (
                  <div key={emp.id} className="p-4 rounded-xl border bg-white" style={{ borderColor: c.cardBorder }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm" style={{ color: c.headingText }}>{emp.name}</p>
                        <p className="text-xs" style={{ color: c.mutedText }}>{emp.position}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {daysLeft} days left
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${trackWidth}%` }} />
                    </div>
                    <p className="text-xs" style={{ color: c.mutedText }}>Probation started {monthsPassed} months ago</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: c.mutedText }}>No probationary employees at this time.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PendingDocsModal({ isOpen, onClose, c }: any) {
  if (!isOpen) return null;
  const docsEmployees = MOCK_EMPLOYEES.filter(e =>
    !e.documents.personal.completed ||
    !e.documents.government.completed ||
    !e.documents.company.completed ||
    !e.documents.performance.completed
  );

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
      <div className="rounded-xl w-full max-w-lg md:max-w-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
        <div className="p-3 md:p-4 border-b flex items-center justify-between" style={{ borderColor: c.cardBorder }}>
          <h2 className="text-lg md:text-xl font-bold m-0" style={{ color: c.headingText }}>Pending Documents</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={c.bodyText}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {docsEmployees.length > 0 ? (
            <div className="space-y-4">
              {docsEmployees.map(emp => (
                <div key={emp.id} className="p-4 rounded-xl border flex justify-between items-center bg-white" style={{ borderColor: c.cardBorder }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: c.headingText }}>{emp.name}</p>
                    <p className="text-xs" style={{ color: c.mutedText }}>Missing documents</p>
                  </div>
                  <button className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition-colors">
                    Remind Employee
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: c.mutedText }}>All employee documents are up to date.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PendingOnboardingModal({ isOpen, onClose, c, onReview }: any) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center isolation-auto p-4" style={{ backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: c.cardBorder }}>
          <h2 className="text-xl font-bold" style={{ color: c.headingText }}>Pending Onboarding</h2>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-900 focus:outline-none">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <PendingHireTable pendingHires={MOCK_PENDING_HIRES} c={c} onReview={onReview} />
        </div>
      </div>
    </div>,
    document.body
  );
}

// ======================== ORG CHART ========================

export function OrganizationalChart({ c }: any) {
  return (
    <div className="p-8 rounded-xl border bg-white flex flex-col items-center justify-center min-h-[400px]" style={{ borderColor: c.cardBorder }}>
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary mb-4 opacity-50">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 className="text-xl font-bold mb-2" style={{ color: c.headingText }}>Organizational Chart</h3>
      <p className="text-sm text-center max-w-md" style={{ color: c.mutedText }}>
        The visual hierarchy map of the organization is generated from the supervisor data.
        Currently displaying {MOCK_EMPLOYEES.length} interconnected nodes.
      </p>

      {/* Simple visual representation for the mockup */}
      <div className="mt-8 relative">
        <div className="w-32 p-3 bg-muted text-foreground border border-border rounded-xl text-center shadow-xs mx-auto z-10 relative">
          <p className="text-xs font-bold uppercase tracking-wider mb-1">President</p>
          <p className="text-[10px] font-medium opacity-80">Executive</p>
        </div>
        <div className="w-px h-8 bg-gray-300 mx-auto"></div>
        <div className="w-64 h-px bg-gray-300 mx-auto"></div>
        <div className="flex justify-between w-80 mx-auto">
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="w-px h-6 bg-gray-300"></div>
        </div>
        <div className="flex justify-between w-80 mx-auto -mt-px space-x-4">
          <div className="w-32 p-3 bg-white border rounded-xl text-center shadow-sm" style={{ borderColor: c.cardBorder }}>
            <p className="text-xs font-bold" style={{ color: c.headingText }}>Sarah Jenkins</p>
            <p className="text-[10px] mt-1" style={{ color: c.mutedText }}>Tech Lead</p>
          </div>
          <div className="w-32 p-3 bg-white border rounded-xl text-center shadow-sm" style={{ borderColor: c.cardBorder }}>
            <p className="text-xs font-bold" style={{ color: c.headingText }}>Marcus Wong</p>
            <p className="text-[10px] mt-1" style={{ color: c.mutedText }}>Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
