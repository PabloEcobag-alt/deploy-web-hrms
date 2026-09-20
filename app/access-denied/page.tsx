"use client";

import { ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-6">
        <ShieldAlert className="w-16 h-16" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Your account does not have permission to access the Human Resource Management System (HRMS) or the requested module.
      </p>
      <a
        href="/api/logout"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
      >
        Sign Out / Switch Account
      </a>
    </div>
  );
}
