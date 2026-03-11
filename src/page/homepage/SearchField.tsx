'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchField } from '@/hooks/video.hooks';
import ArtComboBox, { ArtComboBoxOption } from '@/components/ui/ArtComboBox';

export default function SearchField({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const { data: suggestions = [], isLoading } = useSearchField(debouncedQuery);

  const options: ArtComboBoxOption[] = (suggestions ?? []).map((s: string) => ({ label: s, value: s }));

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      router.push(trimmed ? `/?freeText=${encodeURIComponent(trimmed)}` : '/');
    },
    [router]
  );

  return (
    <ArtComboBox
      icon={{ name: 'Search', size: 18 }}
      placeholder="Search"
      clearable
      options={options}
      value={query}
      onChange={setQuery}
      debounceMs={300}
      onDebouncedChange={setDebouncedQuery}
      onSubmit={navigate}
      noOptionsMessage="No suggestions — press Enter to search"
      isLoading={isLoading}
    />
  );
}
