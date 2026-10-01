"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "@/lib/api";
import type { Employee } from "./types";
import { useColors } from "./utils";
import { NEW_TABS, getMockCheckedItems } from "./constants";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmployeeEditSidebar } from "./EmployeeEditSidebar";
import { EmployeeChecklistItem } from "./EmployeeChecklistItem";
import { buildEmployeeUpdatePayload, editDataFromProfile } from "./editEmployeeConstants";

const EMPTY_EDIT_DATA = {
  firstName: "", lastName: "", position: "", status: "", role: "", email: "", phone: "",
  dateOfBirth: "", location: "", supervisor: "", emergencyContactName: "", emergencyContactPhone: "",
  sss: "", philHealth: "", hdmf: "", tin: "", nbiExpiration: "", barangayExpiration: "", companyIdNumber: "",
};

export function EmployeeEditModal({ employee, isOpen, onClose, c, isDark, onEmployeeUpdated }: {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  c: ReturnType<typeof useColors>;
  isDark: boolean;
  onEmployeeUpdated?: () => void;
}) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [activeTabId, setActiveTabId] = useState("personal");
  const [mounted, setMounted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editData, setEditData] = useState<any>(EMPTY_EDIT_DATA);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setActiveTabId("personal");
      setCheckedItems(getMockCheckedItems(employee.id));
      setViewingDocumentId(null);

      const fetchEmployeeProfile = async () => {
        try {
          const response = await api.get(`/api/admin/digital201/employees/${employee.id}`);
          setEditData(editDataFromProfile(response.data));
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.warn('Employee profile endpoint not available, using list data as fallback');
          } else {
            console.error('Error fetching employee profile:', error);
          }
          // Fallback to list data if profile fetch fails
          const parts = employee.name.trim().split(" ");
          setEditData({
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            position: employee.position,
            status: employee.status,
            role: employee.role || "",
            email: employee.email,
            phone: employee.phone,
            dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : "",
            location: employee.assignedLocation,
            supervisor: employee.supervisor || "",
            emergencyContactName: employee.emergencyContact?.name || "",
            emergencyContactPhone: employee.emergencyContact?.phone || "",
            sss: employee.governmentIds?.sss || "",
            philHealth: employee.governmentIds?.philHealth || "",
            hdmf: employee.governmentIds?.hdmf || "",
            tin: employee.governmentIds?.tin || "",
            nbiExpiration: employee.governmentIds?.nbiExpiration ? employee.governmentIds.nbiExpiration.split('T')[0] : "",
            barangayExpiration: employee.governmentIds?.barangayExpiration ? employee.governmentIds.barangayExpiration.split('T')[0] : "",
            companyIdNumber: employee.companyProperty?.employeeId || "",
          });
        }
      };

      fetchEmployeeProfile();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const allItems = NEW_TABS.flatMap(t => t.items);
  const requiredItems = allItems.filter(i => !i.optional);
  const submittedRequiredCount = requiredItems.filter(i => checkedItems[i.id]).length;
  const progressPercent = Math.round((submittedRequiredCount / requiredItems.length) * 100) || 0;

  const handleSaveProfile = async () => {
    try {
      const response = await api.patch(`/api/admin/digital201/employees/${employee.id}`, buildEmployeeUpdatePayload(editData));
      if (response.data) {
        alert('Employee profile updated successfully!');
        if (onEmployeeUpdated) onEmployeeUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Error updating employee profile:', error);
      alert('Failed to update employee profile. Please try again.');
    }
  };

  const activeTabObj = NEW_TABS.find(t => t.key === activeTabId);
  const handleUpload = (id: string) => setCheckedItems(prev => ({ ...prev, [id]: true }));

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center isolation-auto p-4 md:p-6" style={{ backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl w-[92vw] max-w-6xl h-[88vh] max-h-[88vh] flex flex-col sm:flex-row overflow-hidden shadow-2xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>

        <EmployeeEditSidebar
          c={c}
          employee={employee}
          editData={editData}
          setEditData={setEditData}
          progressPercent={progressPercent}
          submittedRequiredCount={submittedRequiredCount}
          requiredCount={requiredItems.length}
          onSave={() => setConfirmOpen(true)}
        />

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: c.cardBorder }}>
            <h2 className="text-xl font-bold m-0" style={{ color: c.headingText }}>Edit Employee Information</h2>
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
                  className={`px-5 py-3 text-sm font-semibold border-none border-b-2 cursor-pointer whitespace-nowrap transition-colors focus:outline-none ${activeTabId === tab.key
                    ? "border-primary text-foreground font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-900 bg-transparent"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white" style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 120px)' }}>
            <div className="space-y-3 max-w-4xl mx-auto">
              {activeTabObj?.items.map(item => (
                <EmployeeChecklistItem
                  key={item.id}
                  c={c}
                  item={item}
                  activeTabId={activeTabId}
                  isChecked={!!checkedItems[item.id]}
                  isViewing={viewingDocumentId === item.id}
                  editData={editData}
                  setEditData={setEditData}
                  onToggleView={(id) => setViewingDocumentId(id || null)}
                  onUpload={handleUpload}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Save changes?"
        description="This will update the employee's 201 file details."
        confirmLabel="Save Changes"
        cancelLabel="Cancel"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); void handleSaveProfile(); }}
      />
    </div>,
    document.body
  );
}
