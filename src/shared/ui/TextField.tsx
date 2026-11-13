import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { FIELD_CLASS } from './control-class';
import { TEXT_ROLE } from './text-class';

const INPUT_CLASS = `${FIELD_CLASS} h-10 px-3`;

function FormField({ htmlFor, label, children }: { htmlFor: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={`block ${TEXT_ROLE.label}`}>{label}</label>
      {children}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
}

export function TextField({ label, ...inputProps }: TextFieldProps) {
  const id = useId();
  return (
    <FormField htmlFor={id} label={label}>
      <input id={id} className={INPUT_CLASS} {...inputProps} />
    </FormField>
  );
}

/** For machine strings (URLs, IDs, paths): monospace, no spellcheck or auto-capitalization. */
export function MonoTextField({ label, ...inputProps }: TextFieldProps) {
  const id = useId();
  return (
    <FormField htmlFor={id} label={label}>
      <input
        id={id}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`${INPUT_CLASS} font-mono`}
        {...inputProps}
      />
    </FormField>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string;
}

export function TextAreaField({ label, ...textAreaProps }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FormField htmlFor={id} label={label}>
      <textarea id={id} className={`${FIELD_CLASS} scrollbar-subtle resize-none px-3 py-2 leading-relaxed`} {...textAreaProps} />
    </FormField>
  );
}
