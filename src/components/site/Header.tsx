import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-page flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3" aria-label="Sthololwazi Projects home">
          <img src={logo.url} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-[15px] tracking-tight text-foreground">
              Sthololwazi
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Projects (Pty) Ltd
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[13px] text-foreground/80 hover:text-forest transition-colors"
              activeProps={{ className: "text-[13px] text-forest font-medium" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/contact" className="btn-primary hidden md:inline-flex">
            Request a quote
          </Link>
          <button
            aria-label="Toggle menu"
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-border"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block w-4 h-3">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-current transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[6px] h-px w-full bg-current transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 bottom-0 h-px w-full bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-page py-6 flex flex-col gap-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-base text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary self-start mt-2"
            >
              Request a quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
