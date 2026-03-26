'use client';

import { useState, useRef } from 'react';
import { ArtDialog } from '@/components/ui/ArtDialog';
import ArtInput from '@/components/ui/ArtInput';
import ArtBadge from '@/components/ui/ArtBadge';
import ArtListbox from '@/components/ui/ArtListbox';
import ArtComboBox from '@/components/ui/ArtComboBox';
import { useGenres, useCreateGenre } from '@/hooks/genre.hooks';
import type { GenreModel } from '@/models/genre.models';

// ==== GenreContent ====
// Self-contained draft state — owns selected + search internally.
// onDraftChange fires on every toggle so GenreDialog's draftRef stays current.
// Remounts on each dialog open (portal mounts when config becomes non-null).

function GenreContent({
  initialSelected,
  onDraftChange,
}: {
  initialSelected: string[];
  onDraftChange: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState(initialSelected);
  const [search, setSearch] = useState('');

  const genres = useGenres().data ?? [];
  const createGenre = useCreateGenre();

  const query = search.trim();
  const options = genres
    .filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    .map((g) => ({ label: g.name, value: g.id }));

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      // Deselect — always allowed.
      const next = selected.filter((g) => g !== id);
      setSelected(next);
      onDraftChange(next);
    } else {
      // Guard: skip the update entirely when the cap is reached so no
      // rerender fires. Without this, slice(0,5) would return an equal
      // array but a new reference, causing a pointless state update.
      if (selected.length >= 5) return;
      const next = [...selected, id];
      setSelected(next);
      onDraftChange(next);
    }
  };

  const handleCreate = (name: string) => {
    if (!name) return;
    createGenre.mutate(name, {
      onSuccess: (genre) => {
        setSearch('');
        if (selected.length < 5) {
          const next = [...selected, genre.id];
          setSelected(next);
          onDraftChange(next);
        }
      },
    });
  };

  const selectedGenres = genres.filter((g) => selected.includes(g.id));

  return (
    <div className="flex flex-col gap-3">
      <ArtInput
        placeholder="Search genres…"
        icon={{ name: 'Search' }}
        clearable
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
      />

      <ArtListbox
        className="art-listbox--inline"
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

      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1.5 flex-1 min-h-7">
          {selectedGenres.length === 0 ? (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No genres selected
            </span>
          ) : (
            selectedGenres.map((g) => (
              <ArtBadge key={g.id} size="sm" variant="outlined" onRemove={() => toggle(g.id)}>
                {g.name}
              </ArtBadge>
            ))
          )}
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
          {selected.length}/5
        </span>
      </div>
    </div>
  );
}

// ==== GenreDialog ====
// Opens via ArtDialog (provider mode when ArtDialogProvider is in tree).
//
// Draft bridge pattern:
//   draftRef is a stable object created once. GenreContent writes to it on every
//   toggle via onDraftChange. The Apply button's onClick closes over draftRef and
//   reads .current at call time — so it always gets the latest selection even
//   though the config was snapshotted at open time.
//
// Cancel: just closes — draftRef is never committed, parent state unchanged.

interface GenreDialogProps {
  selected: string[];
  onSelect: (ids: string[]) => void;
}

export default function GenreDialog({ selected, onSelect }: GenreDialogProps) {
  const draftRef = useRef<string[]>(selected);
  const genres = useGenres().data ?? [];

  const options = selected
    .map((id) => genres.find((g) => g.id === id))
    .filter((g): g is GenreModel => !!g)
    .map((g) => ({ label: g.name, value: g.id }));

  return (
    <ArtDialog
      title="Genres"
      size="md"
      content={
        <GenreContent
          initialSelected={selected}
          onDraftChange={(ids) => { draftRef.current = ids; }}
        />
      }
      buttons={[{
        label: 'Apply',
        color: 'primary',
        onClick: () => onSelect(draftRef.current),
      }]}
      cancelButton={true}
    >
      <ArtComboBox
        className="cursor-pointer"
        label="Genres"
        multiple
        readOnly
        options={options}
        selected={options}
        placeholder="Add genres…"
      />
    </ArtDialog>
  );
}

// ==== GenreComboBox ====
// Read-only summary of the committed selection — used outside the dialog.

export function GenreComboBox({ selected }: { selected: string[] }) {
  const genres = useGenres().data ?? [];

  const options = selected
    .map((id) => genres.find((g) => g.id === id))
    .filter((g): g is GenreModel => !!g)
    .map((g) => ({ label: g.name, value: g.id }));

  return (
    <div>
      <ArtComboBox
        placeholder="No genres"
        label="Genres"
        multiple
        readOnly
        options={options}
        selected={options}
      />
    </div>
  );
}
