import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

const FIELD_CLASS_NAME = 'w-full rounded-xl border border-line bg-surface-sunken px-3.5 py-2.5 text-sm text-fg transition-colors duration-150 placeholder:text-fg-subtle focus:border-line-strong focus:outline-none';

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs text-fg-muted">{children}</label>;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, ...inputProps }, ref) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input ref={ref} id={id} className={FIELD_CLASS_NAME} {...inputProps} />
    </div>
  );
});

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextAreaField({ label, ...textAreaProps }: TextAreaFieldProps) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea id={id} className={`${FIELD_CLASS_NAME} resize-none`} {...textAreaProps} />
    </div>
  );
}
