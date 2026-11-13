import type { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

/** Bordered surface for collection items. It is a Tailwind `group`, so children can react to card hover/focus. */
export function Card({ className = '', children }: CardProps) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 ease-out-expo focus-within:border-line-strong hover:border-line-strong ${className}`}>
      {children}
    </article>
  );
}
