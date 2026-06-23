/**
 * Reusable project showcase card component
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  image: string;
  value: string;
  title: string;
  description: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
}

export function ProjectCard({
  image,
  value,
  title,
  description,
  alt = title,
  children,
  className,
}: ProjectCardProps) {
  return (
    <article className={cn("group", className)}>
      <div className="overflow-hidden rounded-xl">
        <img
          src={image}
          alt={alt}
          width={1280}
          height={896}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="mt-5">
        <div className="font-mono text-xs text-gold">{value}</div>
        <h3 className="font-display text-2xl mt-2 text-white">{title}</h3>
        <p className="text-sm text-white/60 mt-1">{description}</p>
        {children}
      </div>
    </article>
  );
}
