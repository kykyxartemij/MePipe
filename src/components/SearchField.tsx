"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ArtComboBox, { ArtComboBoxOption } from "./ui/ArtComboBox";

interface SearchFieldProps {
  initialQuery?: string;
}

export default function SearchField({ initialQuery = "" }: SearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<ArtComboBoxOption[]>([]);

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      router.push(trimmed ? `/?freeText=${encodeURIComponent(trimmed)}` : "/");
    },
    [router],
  );

  const fetchSuggestions = useCallback(async (value: string) => {
    const q = value.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/videos/suggestions?freeText=${encodeURIComponent(q)}`);
      const data: string[] = await res.json();
      setSuggestions(data.map((s) => ({ label: s, value: s })));
    } catch {
      setSuggestions([]);
    }
  }, []);

  return (
    <ArtComboBox
      icon={{ name: "Search", size: 18 }}
      placeholder="Search"
      clearable
      debounceMs={250}
      options={suggestions}
      value={query}
      onChange={setQuery}
      onDebouncedChange={fetchSuggestions}
      onSubmit={navigate}
    />
  );
}
