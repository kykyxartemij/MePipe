"use client";

import type { Genre } from "@/models/genre";

export default function GenrePopover({
  open,
  genres,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  genres: Genre[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
          minWidth: 260,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 style={{ marginBottom: 12 }}>Select Genres</h4>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {genres.map((g) => (
            <label
              key={g.id}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={selected.includes(g.id)}
                onChange={(e) => {
                  if (e.target.checked) onSelect([...selected, g.id]);
                  else onSelect(selected.filter((id) => id !== g.id));
                }}
              />
              {g.name}
            </label>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 12, width: "100%" }}>
          Done
        </button>
      </div>
    </div>
  );
}
