import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Landing,
});

function Landing() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20">
      <section className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Unleash the beast</p>
        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Classe tes <span className="text-primary">Monster</span><br />du meilleur au pire.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Glisse chaque canette dans une tier (S à D), valide ton classement, et compare-toi à la moyenne de la communauté.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/auth"
            className="rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_0_30px_-5px] shadow-primary transition hover:scale-105"
          >
            Commencer
          </Link>
          <Link
            to="/rankings"
            className="rounded-md border border-border px-6 py-3 font-bold hover:bg-secondary"
          >
            Voir le classement
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-4 md:grid-cols-3">
        {[
          { t: "1. Crée ton compte", d: "Pseudo + mot de passe, c'est tout." },
          { t: "2. Drag & drop", d: "Glisse les canettes dans les tiers S à D." },
          { t: "3. Classement live", d: "Ta note s'ajoute à la moyenne globale." },
        ].map((s) => (
          <div key={s.t} className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-bold text-primary">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
