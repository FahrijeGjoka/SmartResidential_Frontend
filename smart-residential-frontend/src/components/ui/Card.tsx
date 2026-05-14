import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({
  className,
  children,
  padding = "p-6",
}: {
  className?: string;
  children: ReactNode;
  padding?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100/90 bg-white shadow-card transition duration-200 hover:border-primary/15 hover:shadow-soft",
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}
