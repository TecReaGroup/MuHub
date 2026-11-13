import { Icon } from './Icon';

/** Page-level empty or no-match message: centered, quiet, no illustration. */
export function EmptyNotice({ children }: { children: string }) {
  return <p className="col-span-full py-20 text-center text-sm text-fg-subtle">{children}</p>;
}

/** Page-level failure: a non-blocking banner at the top of the content area. */
export function ErrorBanner({ children }: { children: string }) {
  return (
    <div role="alert" className="col-span-full flex items-center gap-2.5 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
      <Icon name="alertTriangle" className="size-4 shrink-0" />
      <span className="min-w-0 truncate" title={children}>{children}</span>
    </div>
  );
}

/** Sunken placeholder for skeletons; `className` sets its size. Hidden from screen readers. */
export function SkeletonBar({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-tight bg-surface-sunken ${className}`} />;
}
