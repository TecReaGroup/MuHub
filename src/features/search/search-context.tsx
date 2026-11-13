import { createContext, useContext, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  submitRef: MutableRefObject<() => void>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/** One query per page: remount (via `key`) on route change so each page starts with an empty search. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const submitRef = useRef<() => void>(() => {});
  return <SearchContext.Provider value={{ query, setQuery, submitRef }}>{children}</SearchContext.Provider>;
}

export function useSearchContext(): SearchContextValue {
  const contextValue = useContext(SearchContext);
  if (!contextValue) throw new Error('Search hooks must be used inside SearchProvider');
  return contextValue;
}

/**
 * For the page that owns the results shown under the global search box.
 * Returns the current query; `onSubmit` runs when Enter is pressed in the box.
 */
export function usePageSearch(onSubmit: () => void): string {
  const { query, submitRef } = useSearchContext();
  // Latest closure every render, so Enter always sees the current results.
  useEffect(() => {
    submitRef.current = onSubmit;
  });
  return query;
}
