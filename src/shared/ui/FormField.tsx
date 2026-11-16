import type { ReactNode } from 'react';
import { TEXT_ROLE } from './text-class';

interface FormFieldProps {
  htmlFor: string;
  label: string;
  children: ReactNode;
}

/** Keeps label association and field spacing consistent across controls. */
export function FormField({ htmlFor, label, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={`block ${TEXT_ROLE.label}`}>{label}</label>
      {children}
    </div>
  );
}
