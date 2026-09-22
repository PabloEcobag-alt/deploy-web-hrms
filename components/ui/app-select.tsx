"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MenuRect {
  left: number;
  top: number;
  width: number;
}

/**
 * Shared custom dropdown used across web-hrms in place of native <select>.
 * - Fixed-width trigger (via className/triggerClassName)
 * - Fixed-height, scrollable options panel (max-h + overflow-y-auto)
 * - Panel is portaled to <body> with fixed positioning so it is never clipped
 *   by parent containers that use overflow-hidden / overflow-auto.
 * - Closes on outside-click / Escape / scroll, shows a check on the selected option.
 */
export function AppSelect({
  value,
  options,
  onValueChange,
  placeholder = "Select…",
  disabled = false,
  id,
  ariaLabel,
  className,
  triggerClassName,
  menuClassName,
}: {
  value: string;
  options: AppSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<MenuRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const updateRect = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.bottom + 4, width: r.width });
  };

  // Position the menu the moment it opens (before paint) and on resize/scroll.
  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
    const onReposition = () => updateRect();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true); // capture nested scrolls
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  // Close on outside-click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        menuRef.current && !menuRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-white text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
          triggerClassName
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {mounted && open && rect &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{ position: "fixed", left: rect.left, top: rect.top, width: rect.width }}
            className={cn(
              "z-[99999] pointer-events-auto min-w-[8rem] rounded-lg border border-border bg-white shadow-md p-1 max-h-[220px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150",
              menuClassName
            )}
          >
            {options.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-muted-foreground">No options</div>
            ) : (
              options.map((o) => {
                const isSelected = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={o.disabled}
                    onPointerDown={(e) => { 
                      e.preventDefault(); // Prevent focus loss
                      if (!o.disabled) { 
                        onValueChange(o.value); 
                        setOpen(false); 
                      } 
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      o.disabled
                        ? "text-muted-foreground opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-muted text-foreground font-medium"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-foreground" />}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
