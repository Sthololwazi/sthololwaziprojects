import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-onyx text-white/80 mt-32">
      <div className="container-page py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="" width={56} height={56} className="h-14 w-14 rounded-full bg-white/5 p-1" />
              <div>
                <div className="font-display text-xl text-white">Sthololwazi Projects</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Building · Empowering · Mending</div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">
              A proudly South African, 100% black-owned civil and building construction company
              based in Mbombela, Mpumalanga. We build infrastructure, and we build people.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 px-4 py-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold text-onyx text-xs font-semibold">1</span>
              <span className="text-xs tracking-wide text-white/80">B-BBEE Level 1 · 135% Procurement Recognition</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Navigate</div>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Services</Link></li>
              <li><Link to="/projects" className="hover:text-gold transition-colors">Projects</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Get in touch</div>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="leading-relaxed text-white/70">
                K01041 Hilaria, Msogwaba<br />
                Mbombela 1215, Mpumalanga, South Africa
              </li>
              <li><a href="tel:+27646204247" className="hover:text-gold">064 620 4247</a></li>
              <li><a href="mailto:projectsithololwazi@gmail.com" className="hover:text-gold break-all">projectsithololwazi@gmail.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 grid gap-4 md:grid-cols-2 text-xs text-white/45">
          <div>© {new Date().getFullYear()} Sthololwazi Projects (Pty) Ltd. All rights reserved.</div>
          <div className="md:text-right font-mono">
            Reg 2017/135433/07 · NHBRC 3000190954 · CIDB 10127071 · CSD MAAA0446751
          </div>
        </div>
      </div>
    </footer>
  );
}
