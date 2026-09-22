"use client";

import type { RefObject } from "react";
import type { ApplicantFormData, ApplicantSource, HiringStage } from "./types";
import { POSITIONS, APPLICANT_SOURCES, HIRING_STAGES } from "./constants";
import { AppSelect } from "@/components/ui/app-select";
import { type Colors } from "./utils";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
                  onValueChange={v => set("position", v)}
                  options={POSITIONS.map(p => ({ value: p, label: p }))}
                  className="w-full"
                />
              </div>

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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#166534", marginBottom: 6 }}>
                      Start Date *
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
              )}
            </div>
  );
}
