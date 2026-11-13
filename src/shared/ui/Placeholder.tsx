export function EmptyNotice({ children }: { children: string }) {
  return <div className="col-span-full py-20 text-center text-sm font-light text-zinc-400">{children}</div>;
}

/** Pulsing card-shaped block; `className` sets its height. */
export function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl border border-zinc-200/70 bg-card dark:border-zinc-800/70 ${className}`} />;
}
