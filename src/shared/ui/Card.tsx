import type { ReactNode } from 'react';

/** Surface shell shared by cards and their skeletons, so swapping one for the other never shifts layout. */
export const CARD_SHELL_CLASS = 'relative overflow-hidden rounded-card border border-line bg-surface shadow-rest';

interface CardProps {
  /** Layout only (flex direction, padding). */
  className?: string;
  children: ReactNode;
}

/**
 * Collection item surface. Hover lifts it a step (border + shadow + slight rise).
 * It is a Tailwind `group`, so children can react to card hover/focus.
 */
export function Card({ className = '', children }: CardProps) {
  return (
    <article
      className={`group ${CARD_SHELL_CLASS} transition-[translate,border-color,box-shadow] duration-medium focus-within:border-line-strong hover:-translate-y-0.5 hover:border-line-strong hover:shadow-hover ${className}`}
    >
      {children}
    </article>
  );
}
