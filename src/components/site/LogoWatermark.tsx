import logo from "@/assets/logo.png.asset.json";

interface Props {
  className?: string;
  /** opacity 0-1 */
  opacity?: number;
}

/** Decorative oversized logo watermark — used to weave the brand mark into section backgrounds. */
export function LogoWatermark({ className = "", opacity = 0.05 }: Props) {
  return (
    <img
      src={logo.url}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    />
  );
}
