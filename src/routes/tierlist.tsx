import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { TIERS, type Tier } from "../lib/tiers";
import { MonsterCard, PoolZone, TierRow, type Monster } from "../components/tierlist-pieces";

export const Route = createFileRoute("/tierlist")({
  ssr: false,
  component: TierListPage,
});

type Placement = Record<string, Tier | "pool">;

function TierListPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [placement, setPlacement] = useState<Placement>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ms } = await supabase.from("monsters").select("id, name, image_url").order("name");
      const list = (ms ?? []) as Monster[];
      setMonsters(list);

      const { data: votes } = await supabase
        .from("votes")
        .select("monster_id, tier")
        .eq("user_id", user.id);

      const init: Placement = {};
      for (const m of list) init[m.id] = "pool";
      for (const v of votes ?? []) init[v.monster_id] = v.tier as Tier;
      setPlacement(init);
      setFetching(false);
    })();
  }, [user]);

  const byZone = useMemo(() => {
    const z: Record<string, Monster[]> = { pool: [], S: [], A: [], B: [], C: [], D: [] };
    for (const m of monsters) {
      const t = placement[m.id] ?? "pool";
      z[t].push(m);
    }
    return z;
  }, [monsters, placement]);

  const onStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    if (over === "pool") setPlacement((p) => ({ ...p, [id]: "pool" }));
    else if (over.startsWith("tier-")) {
      const t = over.slice(5) as Tier;
      setPlacement((p) => ({ ...p, [id]: t }));
    }
  };

  const submit = async () => {
    if (!user) return;
    const rows = monsters
      .filter((m) => placement[m.id] && placement[m.id] !== "pool")
      .map((m) => ({ user_id: user.id, monster_id: m.id, tier: placement[m.id] as Tier }));
    if (rows.length === 0) {
      toast.error("Classe au moins une canette.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("votes").upsert(rows, { onConflict: "user_id,monster_id" });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Classement enregistré !");
    navigate({ to: "/rankings" });
  };

  const activeMonster = monsters.find((m) => m.id === activeId);

  if (loading || fetching)
    return <div className="p-10 text-center text-muted-foreground">Chargement…</div>;

  if (monsters.length === 0)
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <h2 className="text-xl font-bold">Aucune canette en base</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lance le SQL de seed depuis <code>SUPABASE_SETUP.md</code>.
        </p>
      </div>
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Ta tier list</h1>
          <p className="text-sm text-muted-foreground">Glisse les canettes du bas vers les tiers.</p>
        </div>
        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-md bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "..." : "Valider"}
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd}>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <TierRow key={t} tier={t} monsters={byZone[t]} />
          ))}
        </div>

        <div className="mt-6">
          <PoolZone monsters={byZone.pool} />
        </div>

        <DragOverlay>
          {activeMonster ? <MonsterCard monster={activeMonster} /> : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
