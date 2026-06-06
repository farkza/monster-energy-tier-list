import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Cette page n'existe pas.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Retour
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  useEffect(() => { reportLovableError(error, { boundary: "root" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Oups, une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function Nav() {
  const { user, pseudo } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-black tracking-tight">
          <img src="/logo_farkza.svg" alt="Farkza" className="h-7 w-auto" />
          <span className="text-lg">MONSTER<span className="text-primary">TIER</span></span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/rankings" className="rounded-md px-3 py-1.5 hover:bg-secondary">Classement</Link>
          {user ? (
            <>
              <Link to="/tierlist" className="rounded-md px-3 py-1.5 hover:bg-secondary">Mon tier</Link>
              <span className="hidden sm:inline text-muted-foreground">@{pseudo}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Nav />
        <Outlet />
        <Toaster theme="dark" position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
