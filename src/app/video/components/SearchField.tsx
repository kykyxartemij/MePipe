"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchField } from "@/hooks/useSearchField";
import ArtComboBox, { ArtComboBoxOption } from "@/components/ui/ArtComboBox";

export default function SearchField({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const { suggestions, isLoading } = useSearchField(debouncedQuery);

  const options = suggestions.map((s: string) => ({ label: s, value: s }));

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      router.push(trimmed ? `/?freeText=${encodeURIComponent(trimmed)}` : "/");
    },
    [router],
  );

  const handleChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleDebouncedChange = useCallback((value: string) => {
    setDebouncedQuery(value);
  }, []);

  return (
    <ArtComboBox
      icon={{ name: "Search", size: 18 }}
      placeholder="Search"
      clearable
      debounceMs={300}
      options={options}
      value={query}
      onChange={handleChange}
      onDebouncedChange={handleDebouncedChange}
      onSubmit={navigate}
      noOptionsMessage="No suggestions — press Enter to search"
      isLoading={isLoading}
    />
  );
}
