import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Tier } from "../lib/tiers";
import { TIER_COLORS } from "../lib/tiers";

export interface Monster {
  id: string;
  name: string;
  image_url: string | null;
}

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

      {/* Nom toujours visible sous l'image */}
      <div className="w-full border-t border-border/50 px-1 py-0.5">
        <p className="text-center text-[9px] leading-tight text-muted-foreground break-words hyphens-auto">
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
