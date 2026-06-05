import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, pseudoToEmail } from "../lib/supabase";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/tierlist" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pseudo.trim();
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(clean)) {
      toast.error("Pseudo : 3-20 caractères (lettres, chiffres, _ ou -)");
      return;
    }
    if (password.length < 6) {
      toast.error("Mot de passe : 6 caractères minimum");
      return;
    }
    setBusy(true);
    const email = pseudoToEmail(clean);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { pseudo: clean }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Compte créé !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté !");
      }
      navigate({ to: "/tierlist" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <form onSubmit={submit} className="w-full rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="text-3xl font-black">
          {mode === "signup" ? "Crée ton compte" : "Connexion"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aucun email requis, juste un pseudo.
        </p>

        <label className="mt-6 block text-sm font-semibold">Pseudo</label>
        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          autoComplete="username"
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
          placeholder="ton_pseudo"
        />

        <label className="mt-4 block text-sm font-semibold">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
          placeholder="••••••"
        />

        <button
          disabled={busy}
          className="mt-6 w-full rounded-md bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "..." : mode === "signup" ? "Créer le compte" : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signup" ? "Déjà un compte ? Connexion" : "Pas encore inscrit ? Créer un compte"}
        </button>
      </form>
    </main>
  );
}
