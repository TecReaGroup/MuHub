import { createContext, useContext, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';

const AddActionContext = createContext<MutableRefObject<() => void> | null>(null);

/** Remount (via `key`) on route change so a stale page's handler can never fire. */
export function AddActionProvider({ children }: { children: ReactNode }) {
  const addRef = useRef<() => void>(() => {});
  return <AddActionContext.Provider value={addRef}>{children}</AddActionContext.Provider>;
}

export function useAddActionRef(): MutableRefObject<() => void> {
  const addRef = useContext(AddActionContext);
  if (!addRef) throw new Error('Add action hooks must be used inside AddActionProvider');
  return addRef;
}

/** Registers what the shell's add button does while this page is shown. */
export function usePageAddAction(onAdd: () => void) {
  const addRef = useAddActionRef();
  // Latest closure every render, so the button always sees current page state.
  useEffect(() => {
    addRef.current = onAdd;
  });
}
