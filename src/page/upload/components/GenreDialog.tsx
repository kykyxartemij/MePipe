'use client';

import { useState } from 'react';
import { ArtDialog, useArtDialog } from '@/components/ui/ArtDialog';
import ArtButton from '@/components/ui/ArtButton';
import ArtInput from '@/components/ui/ArtInput';
import ArtBadge from '@/components/ui/ArtBadge';
import ArtListbox from '@/components/ui/ArtListbox';
import { useGenres, useCreateGenre } from '@/hooks/genre.hooks';
import type { GenreModel } from '@/models/genre.models';

// ─── Content ─────────────────────────────────────────────────────────────────
// ArtListbox (inline variant) for the genre list — same option row design as
// ArtComboBox dropdown. Chips at the bottom show the current selection.
// State is local so Cancel naturally discards changes.
// ─────────────────────────────────────────────────────────────────────────────

function GenreContent({
  initialSelected,
  onSelect,
}: {
  initialSelected: string[];
  onSelect: (ids: string[]) => void;
}) {
  const { close } = useArtDialog();
  const [selected, setSelected] = useState(initialSelected);
  const [search, setSearch] = useState('');

  const { data: genres = [] } = useGenres();
  const createGenre = useCreateGenre();

  const query = search.trim();
  const options = (query
    ? genres.filter((g: GenreModel) => g.name.toLowerCase().includes(query.toLowerCase()))
    : genres
  ).map((g: GenreModel) => ({ label: g.name, value: g.id }));

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id].slice(0, 5),
    );

  const handleCreate = (name: string) => {
    if (!name) return;
    createGenre.mutate(name, {
      onSuccess: (genre: GenreModel) => {
        setSearch('');
        setSelected((prev) => [...prev, genre.id].slice(0, 5));
      },
    });
  };

  const handleApply = () => {
    onSelect(selected);
    close();
  };

  const selectedGenres = genres.filter((g: GenreModel) => selected.includes(g.id));

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <ArtInput
        placeholder="Search genres…"
        icon={{ name: 'Search' }}
        clearable
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
      />

      {/* Genre list — same option row design as ArtComboBox dropdown */}
      <ArtListbox
        variant="inline"
        options={options}
        selectedValues={selected}
        onSelect={(opt) => toggle(opt.value)}
        noOptionsMessage="No genres yet"
        query={query}
        extraActions={[{
          label: (q) => `Create "${q}"`,
          onAction: handleCreate,
          isLoading: createGenre.isPending,
          showOnNoExactMatch: true,
        }]}
      />

      {/* Bottom: chips + Apply */}
      <div className="flex items-start gap-3">
        <div className="flex flex-wrap gap-1.5 flex-1 min-h-7">
          {selectedGenres.length === 0 ? (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No genres selected
            </span>
          ) : (
            selectedGenres.map((g: GenreModel) => (
              <ArtBadge key={g.id} size="sm" variant="outlined" onRemove={() => toggle(g.id)}>
                {g.name}
              </ArtBadge>
            ))
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {selected.length}/5
          </span>
          <ArtButton type="button" variant="default" color="primary" onClick={handleApply}>
            Apply
          </ArtButton>
        </div>
      </div>
    </div>
  );
}

// ─── GenreDialog ──────────────────────────────────────────────────────────────

interface GenreDialogProps {
  selected: string[];
  onSelect: (ids: string[]) => void;
}

export default function GenreDialog({ selected, onSelect }: GenreDialogProps) {
  return (
    <ArtDialog
      title="Genres"
      size="md"
      content={<GenreContent initialSelected={selected} onSelect={onSelect} />}
    >
      <ArtButton type="button" variant="outlined">
        {selected.length > 0 ? `Genres (${selected.length}/5)` : 'Select genres'}
      </ArtButton>
    </ArtDialog>
  );
}
