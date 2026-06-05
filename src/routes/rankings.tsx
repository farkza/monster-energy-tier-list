import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { scoreToTier, TIERS, TIER_COLORS, type Tier } from "../lib/tiers";

export const Route = createFileRoute("/rankings")({
  ssr: false,
  component: RankingsPage,
});

interface Row {
  monster_id: string;
  name: string;
  image_url: string | null;
  avg_score: number;
  vote_count: number;
}

function RankingsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("monster_rankings")
        .select("*")
        .order("avg_score", { ascending: false });
      if (error) {
        console.error(error);
        setRows([]);
        return;
      }
      setRows((data ?? []) as Row[]);
    })();
  }, []);

  if (rows === null)
    return <div className="p-10 text-center text-muted-foreground">Chargement…</div>;

  const grouped: Record<Tier, Row[]> = { S: [], A: [], B: [], C: [], D: [] };
  for (const r of rows) {
    if (r.vote_count === 0) continue;
    grouped[scoreToTier(r.avg_score)].push(r);
  }

  const unranked = rows.filter((r) => r.vote_count === 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-black">Classement communautaire</h1>
      <p className="text-sm text-muted-foreground">
        Moyenne calculée à partir des votes de tous les utilisateurs (S=5 → D=1).
      </p>

      <div className="mt-6 space-y-2">
        {TIERS.map((t) => (
          <div key={t} className="flex overflow-hidden rounded-lg border border-border">
            <div className={`flex w-16 shrink-0 items-center justify-center text-3xl font-black ${TIER_COLORS[t]}`}>
              {t}
            </div>
            <div className="flex min-h-[6rem] flex-1 flex-wrap items-center gap-3 bg-card/50 p-3">
              {grouped[t].length === 0 && (
                <span className="text-xs text-muted-foreground">Aucune canette ici pour l'instant.</span>
              )}
              {grouped[t].map((r) => (
                <div key={r.monster_id} className="group relative w-20 text-center">
                  <div className="h-24 w-20 rounded-lg border border-border bg-card p-1">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="h-full w-full object-contain" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold">
                        {r.name.slice(0, 6)}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] font-semibold">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {r.avg_score.toFixed(2)} · {r.vote_count} vote{r.vote_count > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unranked.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Pas encore notés ({unranked.length})
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 opacity-60">
            {unranked.map((r) => (
              <div key={r.monster_id} className="w-20 text-center">
                <div className="h-24 w-20 rounded-lg border border-border bg-card p-1">
                  {r.image_url && <img src={r.image_url} alt={r.name} className="h-full w-full object-contain" />}
                </div>
                <p className="mt-1 truncate text-[11px]">{r.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
