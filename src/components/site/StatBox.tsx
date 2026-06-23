/**
 * Reusable statistic box component
 */

import { cn } from "@/lib/utils";

interface StatBoxProps {
  number: string;
  label: string;
  className?: string;
}

export function StatBox({ number, label, className }: StatBoxProps) {
  return (
    <div className={cn("", className)}>
      <div className="font-display text-3xl md:text-4xl font-light text-white">{number}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</div>
    </div>
  );
}
