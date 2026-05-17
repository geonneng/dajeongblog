"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within Sheet");
  return ctx;
}

function Sheet({
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (value: boolean) => {
      onOpenChange?.(value);
      if (controlledOpen === undefined) setUncontrolledOpen(value);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
  );
}

function SheetTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheet();
  return (
    <button type="button" className={className} onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
}

function SheetContent({
  children,
  className,
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "right" | "bottom";
}) {
  const { open, setOpen } = useSheet();

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const sideClasses =
    side === "bottom"
      ? "inset-x-0 bottom-0 top-auto max-h-[88vh] rounded-t-2xl border-t"
      : "inset-y-0 right-0 w-full max-w-sm border-l h-full";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="배경 닫기"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow-xl transition-transform",
          sideClasses,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-4 pr-12 border-b border-gray-100", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-bold text-gray-800", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500", className)} {...props} />;
}

function SheetClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheet();
  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className={cn(
        "absolute right-3 top-3 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        className
      )}
      {...props}
    >
      <X className="h-5 w-5" />
      <span className="sr-only">닫기</span>
    </button>
  );
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose };
