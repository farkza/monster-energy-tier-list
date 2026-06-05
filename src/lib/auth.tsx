import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  pseudo: string | null;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({ session: null, user: null, pseudo: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const pseudo =
    (user?.user_metadata?.pseudo as string | undefined) ??
    user?.email?.split("@")[0] ??
    null;

  return <Ctx.Provider value={{ session, user, pseudo, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
