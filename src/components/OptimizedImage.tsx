/**
 * Optimized image component with lazy loading and proper dimensions
 * Prevents layout shift (CLS) and improves performance
 */

import { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  width: number;
  height: number;
  aspectRatio?: "video" | "square" | "4/5" | "3/4" | "custom";
  variant?: "cover" | "contain";
}

export function OptimizedImage({
  aspectRatio = "video",
  variant = "cover",
  className,
  width,
  height,
  alt = "",
  ...props
}: OptimizedImageProps) {
  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    "4/5": "aspect-[4/5]",
    "3/4": "aspect-[3/4]",
    custom: "",
  };

  const variantClasses = {
    cover: "object-cover",
    contain: "object-contain",
  };

  return (
    <img
      loading="lazy"
      width={width}
      height={height}
      alt={alt}
      className={cn(
        "w-full",
        aspectClasses[aspectRatio],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
