/**
 * Reusable service division card component
 */

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
  items: string[];
  href?: string;
  className?: string;
  onHoverChange?: (isHovering: boolean) => void;
}

export function ServiceCard({
  number,
  title,
  description,
  items,
  href = "/services",
  className,
  onHoverChange,
}: ServiceCardProps) {
  return (
    <div
      className={cn(
        "bg-onyx p-10 md:p-12 group hover:bg-forest transition-colors duration-500 flex flex-col",
        className,
      )}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <div className="flex items-baseline justify-between">
        <div className="font-mono text-xs text-gold tracking-widest">
          {number} · DIVISION
        </div>
        <div className="font-display text-5xl font-light text-white/15 group-hover:text-gold/40 transition-colors">
          {number}
        </div>
      </div>
      <h3 className="font-display text-3xl mt-6 text-white">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-white/65">{description}</p>
      <ul className="mt-6 space-y-2 text-sm text-white/80">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="h-1 w-3 bg-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        to={href}
        className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-white transition-colors"
      >
        Learn more <span aria-hidden>→</span>
      </Link>
    </div>
  );
}