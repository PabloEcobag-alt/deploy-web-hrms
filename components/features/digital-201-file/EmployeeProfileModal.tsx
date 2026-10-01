"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getEmployeeByErpUserId } from "@/lib/services";
import type { Employee } from "./types";
import { type Colors, useColors } from "./utils";
import { NEW_TABS, AVATAR_STYLES, getMockCheckedItems } from "./constants";
import {
  IdIcon, EmailIcon, PhoneIcon, BirthdayIcon, CalendarIcon,
  BuildingIcon, MapPinIcon, FileIcon, UserIcon,
} from "./icons";
import { MetaRow, StatusBadge } from "./badges";

export function EmployeeProfileModal({ employee, isOpen, onClose, c, isDark }: {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  c: ReturnType<typeof useColors>;
  isDark: boolean;
}) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [activeTabId, setActiveTabId] = useState("personal");
  const [mounted, setMounted] = useState(false);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setActiveTabId("personal");
      setCheckedItems(getMockCheckedItems(employee.id));
      setViewingDocumentId(null);
    }
  }, [isOpen, employee.id]);

  if (!isOpen || !mounted) return null;

  const allItems = NEW_TABS.flatMap(t => t.items);
  const requiredItems = allItems.filter(i => !i.optional);
  const submittedRequiredCount = requiredItems.filter(i => checkedItems[i.id]).length;
  const progressPercent = Math.round((submittedRequiredCount / requiredItems.length) * 100) || 0;

  const activeTabObj = NEW_TABS.find(t => t.key === activeTabId);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center isolation-auto p-4 md:p-6" style={{ backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl w-[92vw] max-w-6xl h-[88vh] max-h-[88vh] flex flex-col sm:flex-row overflow-hidden shadow-2xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>

        {/* Left Sidebar */}
        <div className="w-full sm:w-[280px] flex-shrink-0 border-r flex flex-col" style={{ borderColor: c.cardBorder, background: "#f8fafc" }}>
          <div className="p-6 flex flex-col items-center border-b" style={{ borderColor: c.cardBorder }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 32,
              background: AVATAR_STYLES[employee.avatarIndex % AVATAR_STYLES.length].bg,
              color: AVATAR_STYLES[employee.avatarIndex % AVATAR_STYLES.length].color,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}>
              {employee.initials}
            </div>
            <h2 className="text-xl font-bold mt-4 mb-1 text-center leading-tight" style={{ color: c.headingText }}>{employee.name}</h2>
            <p className="text-sm mb-3 text-center" style={{ color: c.mutedText }}>{employee.position}</p>
            <StatusBadge status={employee.status} c={c} />
          </div>

          <div className="flex-1 overflow-y-auto p-6 hidden sm:block">
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: c.mutedText }}>Employee Information</h4>

              <MetaRow icon={<IdIcon />} label="Employee ID" value={employee.companyProperty.employeeId} c={c} />
              <MetaRow icon={<EmailIcon />} label="Email" value={employee.email} c={c} />
              <MetaRow icon={<PhoneIcon />} label="Phone Number" value={employee.phone} c={c} />
              <MetaRow icon={<BirthdayIcon />} label="Date of Birth" value={formatDate(employee.dateOfBirth)} c={c} />
              <MetaRow icon={<CalendarIcon />} label="Hire Date" value={formatDate(employee.hireDate)} c={c} />
              <MetaRow icon={<MapPinIcon />} label="Location" value={employee.assignedLocation} c={c} />
              <MetaRow icon={<UserIcon />} label="Supervisor" value={employee.supervisor || "None"} c={c} />
              <MetaRow icon={<PhoneIcon />} label="Emergency Contact" value={employee.emergencyContact ? `${employee.emergencyContact.name} (${employee.emergencyContact.phone})` : "None"} c={c} />
            </div>
          </div>

          <div className="p-4 border-t" style={{ borderColor: c.cardBorder, background: "#f1f5f9" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.headingText }}>File Completeness</span>
              <span className="text-[10px] font-bold text-foreground">{progressPercent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-1.5 font-medium" style={{ color: c.mutedText }}>{submittedRequiredCount} of {requiredItems.length} required documents</p>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: c.cardBorder }}>
            <h2 className="text-xl font-bold m-0" style={{ color: c.headingText }}>Document Checklist</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none text-gray-500 hover:text-gray-900">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b" style={{ borderColor: c.cardBorder, background: "#f8fafc" }}>
            <div className="flex overflow-x-auto hide-scrollbar px-4 pt-2">
              {NEW_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTabId(tab.key)}
                  className={`px-5 py-3.5 text-base border-none border-b-2 cursor-pointer whitespace-nowrap transition-colors focus:outline-none ${activeTabId === tab.key
                    ? "border-foreground text-foreground font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-700 font-medium bg-transparent"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => setActiveTabId("journey")}
                className={`px-5 py-3.5 text-base border-none border-b-2 cursor-pointer whitespace-nowrap transition-colors focus:outline-none ${activeTabId === "journey"
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-700 font-medium bg-transparent"
                  }`}
              >
                Journey & History
              </button>
              <button
                onClick={() => setActiveTabId("audit")}
                className={`px-5 py-3.5 text-base border-none border-b-2 cursor-pointer whitespace-nowrap transition-colors focus:outline-none ${activeTabId === "audit"
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-700 font-medium bg-transparent"
                  }`}
              >
                Audit Logs
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white" style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 120px)' }}>
            {activeTabId === "journey" ? (
              <div className="w-full">
                <h3 className="text-lg font-bold mb-6" style={{ color: c.headingText }}>Employment Journey</h3>
                {employee.journey && employee.journey.length > 0 ? (
                  <div className="relative border-l-2 border-border ml-3 space-y-8">
                    {employee.journey.map((j, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-white"></div>
                        <p className="text-xs font-bold text-foreground mb-1">{j.date}</p>
                        <h4 className="text-sm font-bold m-0" style={{ color: c.headingText }}>{j.title}</h4>
                        <p className="text-sm mt-1" style={{ color: c.bodyText }}>{j.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: c.mutedText }}>No journey history recorded.</p>
                )}
              </div>
            ) : activeTabId === "audit" ? (
              <div className="w-full">
                <h3 className="text-lg font-bold mb-6" style={{ color: c.headingText }}>Activity Audit Log</h3>
                {employee.auditLogs && employee.auditLogs.length > 0 ? (
                  <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: c.cardBorder }}>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b" style={{ borderColor: c.cardBorder }}>
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {employee.auditLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: c.mutedText }}>{log.date}</td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: c.headingText }}>{log.user}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-medium" style={{ color: c.bodyText }}>{log.action}</span>
                            </td>
                            <td className="px-4 py-3" style={{ color: c.bodyText }}>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: c.mutedText }}>No activity logs recorded.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-w-4xl mx-auto">
                {activeTabObj?.items.map(item => {
                  const isChecked = !!checkedItems[item.id];
                  const isViewing = viewingDocumentId === item.id;
                  let displaySubtitle = item.subtitle;

                  if (activeTabId === "government" && isChecked) {
                    const maskId = (id: string) => {
                      if (isViewing) return id;
                      const chars = id.split('');
                      let digitCount = 0;
                      const totalDigits = chars.filter(c => /[0-9]/.test(c)).length;
                      return chars.map(c => {
                        if (/[0-9]/.test(c)) {
                          digitCount++;
                          return digitCount > totalDigits - 4 ? c : '•';
                        }
                        return c;
                      }).join('');
                    };
                    if (item.id === "sss" && employee.governmentIds?.sss) {
                      displaySubtitle = `ID Number: ${maskId(employee.governmentIds.sss)}`;
                    } else if (item.id === "philhealth" && employee.governmentIds?.philHealth) {
                      displaySubtitle = `ID Number: ${maskId(employee.governmentIds.philHealth)}`;
                    } else if (item.id === "pagibig" && employee.governmentIds?.hdmf) {
                      displaySubtitle = `ID Number: ${maskId(employee.governmentIds.hdmf)}`;
                    } else if (item.id === "tin" && employee.governmentIds?.tin) {
                      displaySubtitle = `ID Number: ${maskId(employee.governmentIds.tin)}`;
                    } else if (item.id === "nbi" && employee.governmentIds?.nbiExpiration) {
                      displaySubtitle = `Expires: ${employee.governmentIds.nbiExpiration.split('T')[0]}`;
                    } else if (item.id === "brgy" && employee.governmentIds?.barangayExpiration) {
                      displaySubtitle = `Expires: ${employee.governmentIds.barangayExpiration.split('T')[0]}`;
                    }
                  }

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-2.5 rounded-xl border bg-white transition-all duration-200 hover:shadow-md" style={{ borderColor: isChecked ? '#86efac' : c.cardBorder }}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <p className="text-sm font-semibold m-0 truncate text-slate-800" style={{ color: c.headingText }}>{item.label}</p>
                            {isChecked ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700 border border-green-200">Submitted</span>
                            ) : item.optional ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">Optional</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700 border border-red-200">Missing</span>
                            )}
                          </div>
                          {displaySubtitle && <p className={`text-xs font-medium mt-0.5 text-gray-500 truncate ${activeTabId === 'government' ? 'font-mono tracking-wide text-sm' : ''}`}>{displaySubtitle}</p>}
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-4 sm:ml-0 flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        {isChecked && (
                          <button onClick={() => {
                            setViewingDocumentId(isViewing ? null : item.id);
                          }} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-accent border border-border rounded-md transition-colors w-full sm:w-auto focus:outline-none">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {isViewing ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              ) : (
                                <>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </>
                              )}
                            </svg>
                            {isViewing ? "Hide" : "View Document"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
