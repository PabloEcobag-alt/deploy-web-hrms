"use client";

import { useState, useEffect, type RefObject } from "react";
import type { ApplicantFormData, ApplicantSource, HiringStage } from "./types";
import { POSITIONS, DEFAULT_ROLE_SALARIES, APPLICANT_SOURCES, HIRING_STAGES, DEFAULT_INTERVIEWERS, type InterviewerOption } from "./constants";
import { AppSelect } from "@/components/ui/app-select";
import { type Colors } from "./utils";
import api from "@/lib/api";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { UserCheck, Shield, Edit3 } from "lucide-react";

export function ApplicantInfoTab({
  form, set, errors, c, inputStyle, resumeRef, appliedRef, interviewRef,
}: {
  form: ApplicantFormData;
  set: <K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) => void;
  errors: Partial<Record<keyof ApplicantFormData, string>>;
  c: Colors;
  inputStyle: React.CSSProperties;
  resumeRef: RefObject<HTMLInputElement | null>;
  appliedRef: RefObject<HTMLInputElement | null>;
  interviewRef: RefObject<HTMLInputElement | null>;
}) {
  const [interviewers, setInterviewers] = useState<InterviewerOption[]>(DEFAULT_INTERVIEWERS);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchInterviewers() {
      try {
        const res = await api.get('/api/admin/digital201/employees');
        if (active && Array.isArray(res.data) && res.data.length > 0) {
          const apiList: InterviewerOption[] = res.data
            .filter((e: any) => {
              const pos = (e.position || "").toLowerCase();
              const dept = (e.department || "").toLowerCase();
              return pos.includes("admin") || pos.includes("manager") || pos.includes("supervisor") ||
                     dept.includes("management") || dept.includes("admin") || dept.includes("hr");
            })
            .map((e: any) => ({
              id: e.employeeId?.toString() || e.erpUserId || e.emailAddress,
              name: `${e.firstName} ${e.lastName}`,
              role: (e.position?.toLowerCase().includes("admin") ? "Admin" : "Supervisor") as "Admin" | "Supervisor",
              email: e.emailAddress || "",
            }));

          if (apiList.length > 0) {
            const existingNames = new Set(apiList.map(x => x.name.toLowerCase()));
            const merged = [
              ...apiList,
              ...DEFAULT_INTERVIEWERS.filter(d => !existingNames.has(d.name.toLowerCase()))
            ];
            setInterviewers(merged);
          }
        }
      } catch {
        // Fallback to DEFAULT_INTERVIEWERS
      }
    }
    fetchInterviewers();
    return () => { active = false; };
  }, []);

  const isInterviewOrOfferStage =
    form.stage === "Initial Interview" ||
    form.stage === "Final Interview" ||
    form.stage === "Job Offer";

  const interviewerOptions = interviewers.map(i => ({
    value: i.name,
    label: `${i.name} — ${i.role}`
  }));

  if (form.interviewer && !interviewerOptions.some(o => o.value === form.interviewer)) {
    interviewerOptions.unshift({
      value: form.interviewer,
      label: `${form.interviewer} (Current Assignee)`
    });
  }

  return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    First Name *
                  </label>
                  <input value={form.firstName} onChange={e => set("firstName", e.target.value)}
                    placeholder="e.g., Juan" style={{ ...inputStyle, borderColor: errors.firstName ? "#dc2626" : c.cardBorder }} />
                  {errors.firstName && <p style={{ color: "#dc2626", fontSize: 11, margin: "3px 0 0" }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    Middle Name
                  </label>
                  <input value={(form as any).middleName} onChange={e => set("middleName" as any, e.target.value as any)}
                    placeholder="Optional" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    Last Name *
                  </label>
                  <input value={form.lastName} onChange={e => set("lastName", e.target.value)}
                    placeholder="e.g., Dela Cruz" style={{ ...inputStyle, borderColor: errors.lastName ? "#dc2626" : c.cardBorder }} />
                  {errors.lastName && <p style={{ color: "#dc2626", fontSize: 11, margin: "3px 0 0" }}>{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                  Position *
                </label>
                <AppSelect
                  value={form.position}
                  onValueChange={v => {
                    set("position", v);
                    const newTarget = DEFAULT_ROLE_SALARIES[v] || 15000;
                    set("targetSalary", newTarget);
                    if (!form.approvedSalary || form.approvedSalary === form.targetSalary) {
                      set("approvedSalary", newTarget);
                    }
                  }}
                  options={POSITIONS.map(p => ({ value: p, label: p }))}
                  className="w-full"
                />
              </div>

              {/* Customizable Mock Salary & HR Evaluation Card */}
              {(() => {
                const targetSalary = form.targetSalary ?? DEFAULT_ROLE_SALARIES[form.position] ?? 15000;
                const approvedSalary = form.approvedSalary ?? targetSalary;
                const diff = approvedSalary - targetSalary;

                return (
                  <div style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${c.cardBorder}`,
                    background: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          Monthly Compensation & HR Evaluation
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          Role baseline & HR approved salary for {form.position}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: diff > 0 ? "#dcfce7" : diff < 0 ? "#fef3c7" : "#e0f2fe",
                        color: diff > 0 ? "#166534" : diff < 0 ? "#92400e" : "#0369a1"
                      }}>
                        {diff > 0 ? `+₱${diff.toLocaleString()} (Above Target)` : diff < 0 ? `-₱${Math.abs(diff).toLocaleString()} (Below Target)` : "At Target Base"}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12, alignItems: "start" }}>
                      {/* Target Salary Display */}
                      <div style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "#ffffff",
                        border: `1px solid ${c.cardBorder}`
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "#64748b", textTransform: "uppercase" }}>
                          Target Role Salary
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
                          ₱{targetSalary.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          Standard budget for role
                        </div>
                      </div>

                      {/* Approved / Offered Salary Input with Controls */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                            Approved / Offered Salary *
                          </label>
                          {diff !== 0 && (
                            <button
                              type="button"
                              onClick={() => set("approvedSalary", targetSalary)}
                              style={{
                                fontSize: 11,
                                color: "#2563eb",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: 0
                              }}
                            >
                              Reset to Target
                            </button>
                          )}
                        </div>

                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <span style={{ position: "absolute", left: 10, fontSize: 14, fontWeight: 600, color: "#64748b" }}>
                            ₱
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={approvedSalary}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              set("approvedSalary", isNaN(val) ? 0 : val);
                            }}
                            style={{
                              ...inputStyle,
                              paddingLeft: 24,
                              fontWeight: 600,
                              borderColor: diff !== 0 ? "#3b82f6" : c.cardBorder,
                              background: "#ffffff"
                            }}
                          />
                        </div>

                        {/* Quick adjust chips */}
                        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => set("approvedSalary", Math.max(0, approvedSalary - 1000))}
                            style={{
                              padding: "2px 7px",
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: "4px",
                              border: `1px solid ${c.cardBorder}`,
                              background: "#ffffff",
                              cursor: "pointer",
                              color: "#475569"
                            }}
                          >
                            -1k
                          </button>
                          <button
                            type="button"
                            onClick={() => set("approvedSalary", Math.max(0, approvedSalary - 500))}
                            style={{
                              padding: "2px 7px",
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: "4px",
                              border: `1px solid ${c.cardBorder}`,
                              background: "#ffffff",
                              cursor: "pointer",
                              color: "#475569"
                            }}
                          >
                            -500
                          </button>
                          <button
                            type="button"
                            onClick={() => set("approvedSalary", approvedSalary + 500)}
                            style={{
                              padding: "2px 7px",
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: "4px",
                              border: `1px solid ${c.cardBorder}`,
                              background: "#ffffff",
                              cursor: "pointer",
                              color: "#166534"
                            }}
                          >
                            +500
                          </button>
                          <button
                            type="button"
                            onClick={() => set("approvedSalary", approvedSalary + 1000)}
                            style={{
                              padding: "2px 7px",
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: "4px",
                              border: `1px solid ${c.cardBorder}`,
                              background: "#ffffff",
                              cursor: "pointer",
                              color: "#166534"
                            }}
                          >
                            +1k
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", borderTop: "1px dashed #e2e8f0", paddingTop: 6 }}>
                      ℹ️ This approved compensation becomes the employee&apos;s active Base Pay once transformed into an employee.
                    </div>
                  </div>
                );
              })()}

              {/* Resume upload directly under Position (styled) */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                  Attach Resume (PDF)
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input ref={resumeRef} type="file" accept="application/pdf" onChange={e => {
                    const f = e.currentTarget.files && e.currentTarget.files[0];
                    set("resumeFileName", f ? f.name : "");
                  }} style={{ display: "none" }} />
                  <button type="button" onClick={() => resumeRef.current?.click()} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${c.cardBorder}`, background: c.cardBg, cursor: "pointer" }}>
                    Choose file
                  </button>
                  <div style={{ fontSize: 14, color: "#000000" }}>{form.resumeFileName || "No file chosen"}</div>
                  {form.resumeFileName && (
                    <button type="button" onClick={() => { set("resumeFileName", ""); if (resumeRef.current) resumeRef.current.value = ""; }} title="Remove file" style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: c.mutedText }}>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    Application Source *
                  </label>
                  <AppSelect
                    value={form.source}
                    onValueChange={v => set("source", v as ApplicantSource)}
                    options={APPLICANT_SOURCES.map(s => ({ value: s, label: s }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    Hiring Stage *
                  </label>
                  <AppSelect
                    value={form.stage}
                    onValueChange={(v) => {
                      set("stage", v as HiringStage);
                      if (v === "Probationary" && form.startDate) {
                        const start = new Date(form.startDate);
                        if (!isNaN(start.getTime())) {
                          const end = new Date(start);
                          end.setMonth(end.getMonth() + 6);
                          set("probationaryEndDate", end.toISOString().split("T")[0]);
                        }
                      } else if (v === "Hired") {
                        set("probationaryEndDate", "");
                      }
                    }}
                    options={HIRING_STAGES.map(s => ({ value: s, label: s }))}
                    className="w-full"
                  />
                </div>
              </div>

              {isInterviewOrOfferStage && (
                <div style={{
                  padding: "12px 14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      Assigned Interviewer / Evaluator (Admin & Supervisor) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomMode(!customMode)}
                      style={{
                        fontSize: 12,
                        color: "#4f46e5",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                      {customMode ? "Select from list" : "Enter custom"}
                    </button>
                  </div>

                  {customMode ? (
                    <input
                      type="text"
                      value={form.interviewer || ""}
                      onChange={e => set("interviewer", e.target.value)}
                      placeholder="e.g., Sarah Jenkins (Store Supervisor)"
                      style={{ ...inputStyle, background: "#ffffff" }}
                    />
                  ) : (
                    <AppSelect
                      value={form.interviewer || (interviewerOptions[0]?.value ?? "")}
                      onValueChange={v => set("interviewer", v)}
                      options={interviewerOptions}
                      placeholder="Select Admin or Supervisor..."
                      className="w-full"
                    />
                  )}

                  {form.interviewer && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: form.interviewer.toLowerCase().includes("admin") ? "#ede9fe" : "#e0e7ff",
                        color: form.interviewer.toLowerCase().includes("admin") ? "#5b21b6" : "#3730a3",
                        fontWeight: 600,
                        fontSize: 11
                      }}>
                        <Shield className="h-3 w-3" />
                        {form.interviewer.toLowerCase().includes("admin") ? "Admin Evaluator" : "Supervisor Evaluator"}
                      </span>
                      <span>Assigned to conduct <strong>{form.stage}</strong></span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                  Email Address *
                </label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="e.g., juan@email.com" style={{ ...inputStyle, borderColor: errors.email ? "#dc2626" : c.cardBorder }} />
                {errors.email && <p style={{ color: "#dc2626", fontSize: 11, margin: "3px 0 0" }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                  Phone Number
                </label>
                <PhoneInput
                  international
                  defaultCountry="PH"
                  value={form.phone}
                  onChange={(v) => set("phone", v as string)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    Application Date
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input ref={appliedRef} type="date" value={form.appliedDate} onChange={e => set("appliedDate", e.target.value)} style={inputStyle} />
                    <button onClick={() => { const el = appliedRef.current as any; if (el?.showPicker) el.showPicker(); else appliedRef.current?.focus(); }} style={{ marginLeft: 8, border: "none", background: "transparent", cursor: "pointer" }} title="Open calendar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.mutedText} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#000000", marginBottom: 6 }}>
                    Interview Date
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input ref={interviewRef} type="date" value={form.interviewDate} onChange={e => set("interviewDate", e.target.value)} style={inputStyle} />
                    <button onClick={() => { const el = interviewRef.current as any; if (el?.showPicker) el.showPicker(); else interviewRef.current?.focus(); }} style={{ marginLeft: 8, border: "none", background: "transparent", cursor: "pointer" }} title="Open calendar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.mutedText} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {(form.stage === "Hired" || form.stage === "Probationary") && (
                <div style={{ padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dcfce7", paddingBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
                      🎯 Employee Transformation Details
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: 4 }}>
                      Final Base Pay: ₱{(form.approvedSalary ?? DEFAULT_ROLE_SALARIES[form.position] ?? 15000).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#166534", marginBottom: 6 }}>
                        Expected Start Date *
                      </label>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input 
                          type="date" 
                          value={form.startDate || ""} 
                          onChange={e => {
                            set("startDate", e.target.value);
                            if (form.stage === "Probationary" && e.target.value) {
                              const start = new Date(e.target.value);
                              if (!isNaN(start.getTime())) {
                                const end = new Date(start);
                                end.setMonth(end.getMonth() + 6);
                                set("probationaryEndDate", end.toISOString().split("T")[0]);
                              }
                            }
                          }} 
                          style={{ ...inputStyle, borderColor: errors.startDate ? "#dc2626" : "#86efac", background: "#ffffff" }} 
                        />
                      </div>
                      {errors.startDate && <p style={{ color: "#dc2626", fontSize: 11, margin: "3px 0 0" }}>{errors.startDate}</p>}
                    </div>
                    
                    {form.stage === "Probationary" && (
                      <div>
                        <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#166534", marginBottom: 6 }}>
                          Probationary End Date (+6 months)
                        </label>
                        <input 
                          type="date" 
                          value={form.probationaryEndDate || ""} 
                          readOnly
                          style={{ ...inputStyle, borderColor: "#86efac", background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
  );
}
