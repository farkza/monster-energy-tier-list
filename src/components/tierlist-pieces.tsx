import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Tier } from "../lib/tiers";
import { TIER_COLORS } from "../lib/tiers";

export interface Monster {
  id: string;
  name: string;
  image_url: string | null;
}

// ─── Mobile Tap Mode ──────────────────────────────────────────────────────────

export function MonsterCardTap({
  monster,
  selected,
  onSelect,
}: {
  monster: Monster;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(monster.id)}
      className={`group relative flex w-24 shrink-0 flex-col rounded-lg border transition-all active:scale-95 ${
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_18px_-4px] shadow-primary ring-2 ring-primary"
          : "border-border bg-card hover:border-primary/60"
      }`}
      title={monster.name}
    >
      {selected && (
        <span className="absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground">
          ✓
        </span>
      )}
      <div className="h-20 w-full p-1">
        {monster.image_url ? (
          <img
            src={monster.image_url}
            alt={monster.name}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-secondary text-[10px] font-bold">
            {monster.name.slice(0, 6)}
          </div>
        )}
      </div>
      <div className="w-full border-t border-border/50 px-1 py-0.5">
        <p className="break-words text-center text-[9px] leading-tight text-muted-foreground hyphens-auto">
          {monster.name.replace(/^Monster\s*/i, "")}
        </p>
      </div>
    </button>
  );
}

export function TierRowTap({
  tier,
  monsters,
  selectedId,
  onPlace,
}: {
  tier: Tier;
  monsters: Monster[];
  selectedId: string | null;
  onPlace: (tier: Tier) => void;
}) {
  const canPlace = selectedId !== null;

  return (
    <div
      className={`flex overflow-hidden rounded-lg border transition-all ${
        canPlace
          ? "border-primary/60 shadow-[0_0_0_1px] shadow-primary/30"
          : "border-border"
      }`}
    >
      <div
        className={`flex w-16 shrink-0 items-center justify-center text-3xl font-black ${TIER_COLORS[tier]}`}
      >
        {tier}
      </div>

      {/* Zone de monstres placés */}
      <div className="flex min-h-[6rem] flex-1 flex-wrap items-center gap-2 bg-card/50 p-2">
        {monsters.map((m) => (
          <div
            key={m.id}
            className="flex w-16 shrink-0 flex-col rounded-md border border-border bg-card"
            title={m.name}
          >
            <div className="h-14 w-full p-0.5">
              {m.image_url ? (
                <img
                  src={m.image_url}
                  alt={m.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded bg-secondary text-[9px] font-bold">
                  {m.name.slice(0, 4)}
                </div>
              )}
            </div>
            <div className="w-full border-t border-border/50 px-0.5 py-0.5">
              <p className="break-words text-center text-[8px] leading-tight text-muted-foreground hyphens-auto">
                {m.name.replace(/^Monster\s*/i, "")}
              </p>
            </div>
          </div>
        ))}

        {/* Bouton "Placer ici" visible quand une canette est sélectionnée */}
        {canPlace && (
          <button
            type="button"
            onClick={() => onPlace(tier)}
            className="flex h-14 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-primary bg-primary/10 text-primary transition-all active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            <span className="text-[8px] font-bold uppercase leading-none">Placer</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function PoolZoneTap({
  monsters,
  selectedId,
  onSelect,
}: {
  monsters: Monster[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-3">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        À classer ({monsters.length}) — touche pour sélectionner
      </p>
      <div className="flex flex-wrap gap-2">
        {monsters.map((m) => (
          <MonsterCardTap
            key={m.id}
            monster={m}
            selected={selectedId === m.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Desktop Drag Mode (inchangé) ─────────────────────────────────────────────

export function MonsterCard({ monster, dragging }: { monster: Monster; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: monster.id,
    data: { monster },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`group relative flex w-28 shrink-0 cursor-grab touch-none select-none flex-col rounded-lg border border-border bg-card transition active:cursor-grabbing ${
        isDragging || dragging
          ? "opacity-30"
          : "hover:scale-110 hover:border-primary hover:shadow-[0_0_20px_-5px] hover:shadow-primary"
      }`}
      title={monster.name}
    >
      <div className="h-24 w-full p-1">
        {monster.image_url ? (
          <img
            src={monster.image_url}
            alt={monster.name}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-secondary text-[10px] font-bold">
            {monster.name.slice(0, 6)}
          </div>
        )}
      </div>
      <div className="w-full border-t border-border/50 px-1 py-0.5">
        <p className="break-words text-center text-[9px] leading-tight text-muted-foreground hyphens-auto">
          {monster.name.replace(/^Monster\s*/i, "")}
        </p>
      </div>
    </div>
  );
}

export function TierRow({ tier, monsters }: { tier: Tier; monsters: Monster[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${tier}` });

  return (
    <div className="flex overflow-hidden rounded-lg border border-border">
      <div
        className={`flex w-16 shrink-0 items-center justify-center text-3xl font-black ${TIER_COLORS[tier]}`}
      >
        {tier}
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[6.5rem] flex-1 flex-wrap items-center gap-3 bg-card/50 p-3 transition ${
          isOver ? "bg-primary/10" : ""
        }`}
      >
        {monsters.map((m) => (
          <MonsterCard key={m.id} monster={m} />
        ))}
      </div>
    </div>
  );
}

export function PoolZone({ monsters }: { monsters: Monster[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[8rem] rounded-lg border border-dashed border-border p-3 transition ${
        isOver ? "border-primary bg-primary/5" : ""
      }`}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        À classer ({monsters.length})
      </p>
      <div className="flex flex-wrap gap-3">
        {monsters.map((m) => (
          <MonsterCard key={m.id} monster={m} />
        ))}
      </div>
    </div>
  );
}
