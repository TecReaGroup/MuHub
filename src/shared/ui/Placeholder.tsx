export function EmptyNotice({ children }: { children: string }) {
  return <div className="col-span-full py-20 text-center text-sm font-light text-fg-subtle">{children}</div>;
}

/** Pulsing card-shaped block; `className` sets its height. */
export function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl border border-line bg-surface ${className}`} />;
}
