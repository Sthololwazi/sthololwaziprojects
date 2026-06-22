import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sthololwazi Projects — Civil & Building Construction" },
      {
        name: "description",
        content:
          "100% black-owned, B-BBEE Level 1 civil and building contractor based in Mbombela, Mpumalanga. Building infrastructure. Empowering communities.",
      },
      { name: "theme-color", content: "#1A5C2A" },
      { property: "og:site_name", content: "Sthololwazi Projects" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Sthololwazi Projects — Civil & Building Construction" },
      { name: "twitter:title", content: "Sthololwazi Projects — Civil & Building Construction" },
      {
        property: "og:description",
        content:
          "100% black-owned, B-BBEE Level 1 civil and building contractor based in Mbombela, Mpumalanga. Building infrastructure. Empowering communities.",
      },
      {
        name: "twitter:description",
        content:
          "100% black-owned, B-BBEE Level 1 civil and building contractor based in Mbombela, Mpumalanga. Building infrastructure. Empowering communities.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/aPjJ3FQth5OWxFvYLVct2x9189R2/social-images/social-1781777585943-logo.webp",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/aPjJ3FQth5OWxFvYLVct2x9189R2/social-images/social-1781777585943-logo.webp",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sthololwazi Projects (Pty) Ltd",
          alternateName: "Sthololwazi Projects",
          description:
            "100% black-owned, B-BBEE Level 1 civil and building construction company in Mbombela, Mpumalanga.",
          foundingDate: "2017",
          taxID: "9071664248",
          email: "projectsithololwazi@gmail.com",
          telephone: "+27-64-620-4247",
          address: {
            "@type": "PostalAddress",
            streetAddress: "K01041 Hilaria, Msogwaba",
            addressLocality: "Mbombela",
            postalCode: "1215",
            addressRegion: "Mpumalanga",
            addressCountry: "ZA",
          },
          areaServed: { "@type": "AdministrativeArea", name: "South Africa" },
          identifier: [
            { "@type": "PropertyValue", propertyID: "CIDB", value: "10127071" },
            { "@type": "PropertyValue", propertyID: "NHBRC", value: "3000190954" },
            {
              "@type": "PropertyValue",
              propertyID: "Company Registration",
              value: "2017/135433/07",
            },
            { "@type": "PropertyValue", propertyID: "CSD Supplier", value: "MAAA0446751" },
            { "@type": "PropertyValue", propertyID: "B-BBEE Level", value: "1" },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Inline pre-hydration script. Runs before React mounts on every page —
// including the SPA fallback 404.html on GitHub Pages — to:
//   1. Upgrade http:// → https:// (defence-in-depth; GH Pages also enforces).
//   2. Redirect the GitHub Pages mirror to the canonical Lovable host so old
//      links keep working when the mirror is the entry point.
//   3. Strip trailing slashes (except "/") for canonical URLs.
const CLIENT_REDIRECTS = `
(function(){try{
  var loc = window.location;
  var canonicalHost = "sthololwaziprojects.lovable.app";
  // 1. HTTPS upgrade
  if (loc.protocol === "http:" && loc.hostname !== "localhost" && !/^127\\./.test(loc.hostname)) {
    loc.replace("https:" + loc.href.substring(loc.protocol.length));
    return;
  }
  // 2. GitHub Pages mirror -> canonical host
  if (/\\.github\\.io$/.test(loc.hostname)) {
    var path = loc.pathname.replace(/^\\/sthololwazi(\\/|$)/, "/");
    loc.replace("https://" + canonicalHost + path + loc.search + loc.hash);
    return;
  }
  // 3. Trailing-slash normalisation
  if (loc.pathname.length > 1 && loc.pathname.endsWith("/")) {
    var clean = loc.pathname.replace(/\\/+$/, "");
    history.replaceState(null, "", clean + loc.search + loc.hash);
  }
}catch(e){}})();
`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CLIENT_REDIRECTS }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
