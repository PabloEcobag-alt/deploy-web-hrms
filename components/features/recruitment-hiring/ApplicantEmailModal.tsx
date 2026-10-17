"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Copy, ExternalLink, Check, Send } from "lucide-react";
import type { Applicant } from "./types";
import { getFullName, formatDate } from "./utils";

interface ApplicantEmailModalProps {
  applicant: Applicant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicantEmailModal({
  applicant,
  isOpen,
  onClose,
}: ApplicantEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!applicant) return;

    const fullName = getFullName(applicant);
    const pos = applicant.position;
    const stage = applicant.stage;
    const salary = applicant.approvedSalary ?? applicant.targetSalary;
    const salaryFormatted = salary ? `₱${salary.toLocaleString()}` : "To be confirmed";
    const dateFormatted = applicant.interviewDate ? formatDate(applicant.interviewDate) : "To be scheduled";
    const startFormatted = applicant.expectedStart ? formatDate(applicant.expectedStart) : "To be determined";
    const interviewerName = applicant.interviewer || "HR Interview Panel";

    let initialSubject = "";
    let initialBody = "";

    switch (stage) {
      case "Initial Interview":
        initialSubject = `Initial Interview Invitation: ${pos} at R3B2P Enterprise`;
        initialBody = `Dear ${applicant.firstName},

Thank you for your application for the ${pos} position at R3B2P Enterprise.

We have reviewed your credentials and would like to invite you for an Initial Interview.

Details:
• Position: ${pos}
• Scheduled Date: ${dateFormatted}
• Interviewer / Evaluator: ${interviewerName}

Please reply to this email to confirm your availability or to request an alternate schedule if needed.

Best regards,
HR Recruitment Team
R3B2P Enterprise`;
        break;

      case "Final Interview":
        initialSubject = `Final Interview Schedule: ${pos} at R3B2P Enterprise`;
        initialBody = `Dear ${applicant.firstName},

Congratulations on completing the initial stages of our evaluation process for the ${pos} position!

We are pleased to invite you to the Final Interview.

Details:
• Position: ${pos}
• Scheduled Date: ${dateFormatted}
• Interviewer / Evaluator: ${interviewerName}

Please be prepared to discuss your practical experience and expectations. Reply to confirm your attendance.

Best regards,
Management Evaluation Team
R3B2P Enterprise`;
        break;

      case "Job Offer":
        initialSubject = `Formal Job Offer: ${pos} - R3B2P Enterprise`;
        initialBody = `Dear ${applicant.firstName},

We are thrilled to formally extend a Job Offer for the ${pos} position at R3B2P Enterprise!

Offer Summary:
• Position: ${pos}
• Approved Starting Base Pay: ${salaryFormatted}
• Expected Start Date: ${startFormatted}
• Managing Evaluator: ${interviewerName}

We look forward to having you join our growing team. Please review this offer and let us know your confirmation by replying to this email.

Warm regards,
HR & Operations Management
R3B2P Enterprise`;
        break;

      case "Hired":
      case "Probationary":
        initialSubject = `Welcome to the Team: ${pos} at R3B2P Enterprise`;
        initialBody = `Dear ${applicant.firstName},

Welcome to R3B2P Enterprise!

Your profile has been successfully processed in our Human Resources Management System.

Onboarding Information:
• Position: ${pos}
• Employment Status: ${stage}
• Starting Base Pay: ${salaryFormatted}
• First Day / Expected Start: ${startFormatted}

Please report to your assigned location with any remaining required documents. We look forward to working with you!

Warm regards,
People Operations
R3B2P Enterprise`;
        break;

      case "Failed":
        initialSubject = `Update regarding your application for ${pos} at R3B2P Enterprise`;
        initialBody = `Dear ${applicant.firstName},

Thank you for taking the time to meet with our team and for your interest in the ${pos} position at R3B2P Enterprise.

After careful consideration of all applicants, we have decided to proceed with other candidates whose background more closely matches our immediate requirements for this role.

We appreciate the time you invested in our process and wish you all the best in your career pursuits.

Sincerely,
HR Recruitment Team
R3B2P Enterprise`;
        break;

      default:
        initialSubject = `Application Status Update: ${pos} at R3B2P Enterprise`;
        initialBody = `Dear ${applicant.firstName},

We are writing to provide an update on your application for the ${pos} position at R3B2P Enterprise.

Your application is currently at the "${stage}" stage. We will keep you updated as our team proceeds with candidate evaluations.

Best regards,
HR Recruitment Team
R3B2P Enterprise`;
        break;
    }

    setSubject(initialSubject);
    setBody(initialBody);
    setCopied(false);
  }, [applicant]);

  if (!applicant) return null;

  const handleOpenMailto = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${applicant.email}?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailtoUrl, "_blank");
    toast.success("Opened email client with pre-filled message");
  };

  const handleCopy = async () => {
    try {
      const textToCopy = `Subject: ${subject}\n\n${body}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Email subject and content copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 text-black sm:max-w-[620px]">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Email Notification — {getFullName(applicant)}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Human-in-the-loop email composer for <strong>{applicant.stage}</strong> stage
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-xs border border-gray-200">
            <div>
              <span className="text-gray-500">Recipient:</span>{" "}
              <strong className="text-gray-900">{applicant.email}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Stage:</span>
              <span className="rounded bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700">
                {applicant.stage}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Message Body (Editable)
            </label>
            <textarea
              rows={11}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-xs leading-relaxed text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-md bg-blue-50 p-2.5 text-xs text-blue-700 border border-blue-200">
            💡 <strong>Human-in-the-Loop Workflow:</strong> Review and tailor the template above. You can either open it directly in your default email client (Gmail, Outlook, Apple Mail) or copy the text to send manually.
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between border-t bg-gray-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
              {copied ? "Copied" : "Copy Message"}
            </button>

            <button
              type="button"
              onClick={handleOpenMailto}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Mail App
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
