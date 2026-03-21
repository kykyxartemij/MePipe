'use client';

import ArtButton from '@/components/ui/ArtButton';
import type { GenreModel } from '@/models/genre.models';

export default function GenrePopover({
  open,
  genres,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  genres: GenreModel[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000" onClick={onClose}>
      <div className="rounded-lg p-5 min-w-65 bg-muted border border-muted" onClick={(e) => e.stopPropagation()}>
        <h4 className="mb-3">Select Genres</h4>
        <div className="max-h-75 overflow-y-auto">
          {genres.map((g) => (
            <label key={g.id} className="flex items-center gap-2 mb-1.5 cursor-pointer">
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
        <ArtButton onClick={onClose} className="mt-3 w-full">
          Done
        </ArtButton>
      </div>
    </div>
  );
}
