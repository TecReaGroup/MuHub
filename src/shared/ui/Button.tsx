import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const SOLID_BUTTON_CLASS_NAME = 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50';

export function PrimaryButton({ className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${SOLID_BUTTON_CLASS_NAME} bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white ${className}`}
      {...props}
    />
  );
}

export function DangerButton({ className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${SOLID_BUTTON_CLASS_NAME} bg-red-600 text-white hover:bg-red-500 ${className}`}
      {...props}
    />
  );
}

export function GhostButton({ className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-xl px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200 ${className}`}
      {...props}
    />
  );
}

interface IconButtonProps extends ButtonProps {
  /** Accessible name; also shown as the native tooltip. */
  label: string;
}

export function IconButton({ label, className = '', type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
      {...props}
    />
  );
}
