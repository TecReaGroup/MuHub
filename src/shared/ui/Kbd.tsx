export function Kbd({ children, className = '' }: { children: string; className?: string }) {
  return (
    <kbd className={`rounded-md border border-line px-1.5 font-sans text-[10px] leading-4 text-fg-subtle ${className}`}>
      {children}
    </kbd>
  );
}
