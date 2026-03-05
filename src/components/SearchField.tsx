"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ArtComboBox, { ArtComboBoxOption } from "./ui/ArtComboBox";

export default function SearchField({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<ArtComboBoxOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const navigate = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      router.push(trimmed ? `/?freeText=${encodeURIComponent(trimmed)}` : "/");
    },
    [router],
  );

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setSuggestions([]);
    setIsLoading(value.trim().length > 0);
  }, []);

  const fetchSuggestions = useCallback(async (value: string) => {
    abortRef.current?.abort();
    const q = value.trim();
    if (!q) { setSuggestions([]); setIsLoading(false); return; }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`/api/videos/suggestions?freeText=${encodeURIComponent(q)}`, { signal: ctrl.signal });
      setSuggestions(((await res.json()) as string[]).map((s) => ({ label: s, value: s })));
    } catch (e) {
      if ((e as Error).name !== "AbortError") setSuggestions([]);
      else return;
    }
    if (!ctrl.signal.aborted) setIsLoading(false);
  }, []);

  return (
    <ArtComboBox
      icon={{ name: "Search", size: 18 }}
      placeholder="Search"
      clearable
      debounceMs={300}
      options={suggestions}
      value={query}
      onChange={handleChange}
      onDebouncedChange={fetchSuggestions}
      onSubmit={navigate}
      noOptionsMessage="No suggestions — press Enter to search"
      isLoading={isLoading}
    />
  );
}
