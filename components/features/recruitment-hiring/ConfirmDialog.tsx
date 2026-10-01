"use client";

// Reusable confirmation dialog using the shadcn dialog theme.
// Consistent look & feel for create / save / delete confirmations.

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="gap-0 p-0 text-black sm:max-w-[420px]">
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-lg font-medium text-black">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-1 text-sm text-black">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-row items-center gap-2 px-5 py-4 sm:justify-end">
          <button
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-base font-normal text-black shadow-xs transition-colors hover:bg-accent"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-5 text-base font-normal text-white shadow-xs transition-colors",
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-black/90"
            )}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
