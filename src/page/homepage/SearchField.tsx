'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchField } from '@/hooks/video.hooks';
import ArtComboBox, { type ArtComboBoxOption } from '@/components/ui/ArtComboBox';

export default function SearchField({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ArtComboBoxOption | null>(
    initialQuery ? { label: initialQuery, value: initialQuery } : null
  );
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const { data: suggestions = [], isLoading } = useSearchField(debouncedQuery);
  const options: ArtComboBoxOption[] = (suggestions ?? []).map((s: string) => ({ label: s, value: s }));

  const navigate = (q: string) => {
    const trimmed = q.trim();
    router.push(trimmed ? `/?freeText=${encodeURIComponent(trimmed)}` : '/');
  };

  return (
    <ArtComboBox
      icon={{ name: 'Search', size: 18 }}
      placeholder="Search"
      clearable
      options={options}
      selected={selected}
      onChange={(opt) => { setSelected(opt); if (opt) navigate(opt.value); }}
      debounceMs={300}
      onDebouncedChange={setDebouncedQuery}
      onSubmit={navigate}
      noOptionsMessage="No suggestions — press Enter to search"
      isLoading={isLoading}
    />
  );
}
