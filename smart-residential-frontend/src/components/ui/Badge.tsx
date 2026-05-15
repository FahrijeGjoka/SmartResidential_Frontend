import { cn } from "@/utils/cn";

const tones: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  primary: "bg-blue-50 text-primary",
  accent: "bg-teal-50 text-accent",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone] ?? tones.default,
        className
      )}
    >
      {children}
    </span>
  );
}
