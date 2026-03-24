"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must be used within <Popover />");
  }

  return context;
}

function Popover({
  children,
  defaultOpen = false,
}: React.PropsWithChildren<{ defaultOpen?: boolean }>) {
  const [open, setOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) {
        return;
      }

      if (contentRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative w-full">{children}</div>
    </PopoverContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, type = "button", ...props }, ref) => {
  const { open, setOpen, triggerRef } = usePopoverContext();

  return (
    <button
      ref={(node) => {
        triggerRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      type={type}
      aria-expanded={open}
      onClick={(event) => {
        setOpen((current) => !current);
        onClick?.(event);
      }}
      className={className}
      {...props}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open, contentRef } = usePopoverContext();

  if (!open) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        contentRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        "absolute left-0 top-full z-50 mt-2 rounded-2xl border border-outline-variant bg-card shadow-[0_18px_50px_rgba(58,48,42,0.22)]",
        className,
      )}
      role="dialog"
      aria-label="Popover content"
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverContent, PopoverTrigger };
