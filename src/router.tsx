import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Vite injects BASE_URL from `vite.config.ts#base`. Strip the trailing slash
  // so TanStack Router treats e.g. "/sthololwazi" as the app's mount point on
  // GitHub Pages, while staying at "" (root) on Lovable SSR.
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(basepath ? { basepath } : {}),
  });

  return router;
};
