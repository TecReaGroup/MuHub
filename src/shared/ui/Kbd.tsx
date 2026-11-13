export function Kbd({ children, className = '' }: { children: string; className?: string }) {
  return (
    <kbd className={`rounded-tight border border-line bg-surface-sunken px-1.5 font-sans text-caption text-fg-subtle ${className}`}>
      {children}
    </kbd>
  );
}
