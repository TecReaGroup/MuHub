import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { iconControlClass, textControlClass, type ControlSize, type ControlTone } from './control-class';
import { Icon } from './Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ControlTone;
  size?: ControlSize;
}

/** `className` is for layout only; appearance comes from `tone` and `size`. */
export function Button({ tone = 'secondary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${textControlClass(tone, size)} ${className}`} {...props} />;
}

interface IconButtonProps extends ButtonProps {
  /** Accessible name; also shown as the native tooltip. */
  label: string;
}

export function IconButton({ label, tone = 'ghost', size = 'md', className = '', type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${iconControlClass(tone, size)} ${className}`}
      {...props}
    />
  );
}

interface IconLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  href: string;
  size?: ControlSize;
}

/** Icon-sized external link; always opens in a new tab without leaking the opener. */
export function IconLink({ label, size = 'md', className = '', ...props }: IconLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`${iconControlClass('ghost', size)} ${className}`}
      {...props}
    />
  );
}

interface SubmitButtonProps {
  /** While true the button is disabled and shows an inline spinner instead of blocking the screen. */
  pending: boolean;
  /** For an incomplete form; `pending` already disables it. */
  disabled?: boolean;
  /** Layout only. */
  className?: string;
  children: ReactNode;
}

export function SubmitButton({ pending, disabled = false, className = '', children }: SubmitButtonProps) {
  return (
    <button type="submit" disabled={pending || disabled} aria-busy={pending} className={`${textControlClass('primary', 'lg')} ${className}`}>
      {pending && <Icon name="spinner" className="animate-spin" />}
      {children}
    </button>
  );
}
