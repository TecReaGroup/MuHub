import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const SOLID_BUTTON_CLASS_NAME = 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50';
const ICON_CONTROL_CLASS_NAME = 'inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-hover hover:text-fg';

export function PrimaryButton({ className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${SOLID_BUTTON_CLASS_NAME} bg-accent text-on-accent hover:bg-accent-hover ${className}`} {...props} />;
}

export function DangerButton({ className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${SOLID_BUTTON_CLASS_NAME} bg-danger text-white hover:bg-danger-hover ${className}`} {...props} />;
}

export function GhostButton({ className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-xl px-4 py-2 text-sm text-fg-muted transition-colors duration-150 hover:text-fg ${className}`}
      {...props}
    />
  );
}

interface IconButtonProps extends ButtonProps {
  /** Accessible name; also shown as the native tooltip. */
  label: string;
}

export function IconButton({ label, className = '', type = 'button', ...props }: IconButtonProps) {
  return <button type={type} aria-label={label} title={label} className={`${ICON_CONTROL_CLASS_NAME} ${className}`} {...props} />;
}

interface IconLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  href: string;
}

/** Icon-sized external link; always opens in a new tab without leaking the opener. */
export function IconLink({ label, className = '', ...props }: IconLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`${ICON_CONTROL_CLASS_NAME} ${className}`}
      {...props}
    />
  );
}
