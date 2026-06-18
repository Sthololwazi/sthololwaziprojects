const WHATSAPP_NUMBER = "27646204247"; // +27 64 620 4247
const DEFAULT_MESSAGE =
  "Hello Sthololwazi Projects, I'd like to enquire about a construction project.";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-3 rounded-full bg-[#25D366] text-white pl-4 pr-5 py-3 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-60 animate-ping" />
        <svg viewBox="0 0 32 32" className="relative h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.39c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.18.28-.72.9-.88 1.08-.16.18-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.38-.82-.73-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.62-1.49-.85-2.04-.22-.54-.45-.46-.62-.47-.16-.01-.35-.01-.53-.01s-.49.07-.74.35c-.25.28-.97.95-.97 2.32 0 1.37.99 2.69 1.13 2.88.14.18 1.95 2.98 4.73 4.18.66.28 1.18.45 1.58.58.66.21 1.27.18 1.75.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32zM16.05 5.33c-5.92 0-10.73 4.81-10.73 10.72 0 1.89.5 3.74 1.44 5.36L5 27l5.74-1.5a10.7 10.7 0 005.31 1.43h.01c5.91 0 10.72-4.81 10.72-10.72 0-2.86-1.11-5.55-3.14-7.58a10.66 10.66 0 00-7.59-3.3zm0 19.62h-.01a8.92 8.92 0 01-4.55-1.24l-.33-.19-3.41.89.91-3.32-.21-.34a8.91 8.91 0 01-1.37-4.76c0-4.92 4.01-8.93 8.94-8.93 2.39 0 4.63.93 6.32 2.62a8.88 8.88 0 012.62 6.32c0 4.93-4 8.95-8.91 8.95z" />
        </svg>
      </span>
      <span className="hidden sm:inline text-sm font-medium tracking-wide">Chat on WhatsApp</span>
    </a>
  );
}
