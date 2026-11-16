import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { FIELD_CLASS, INPUT_CLASS } from './control-class';
import { FormField } from './FormField';
import { useScrollbar } from './use-scrollbar';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
}

export function TextField({ label, id: suppliedId, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return (
    <FormField htmlFor={id} label={label}>
      <input id={id} className={INPUT_CLASS} {...inputProps} />
    </FormField>
  );
}

/** For machine strings (URLs, IDs, paths): monospace, no spellcheck or auto-capitalization. */
export function MonoTextField({ label, id: suppliedId, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
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

export function TextAreaField({ label, id: suppliedId, onScroll, ...textAreaProps }: TextAreaFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const scrollbar = useScrollbar();
  return (
    <FormField htmlFor={id} label={label}>
      <textarea
        {...scrollbar}
        id={id}
        className={`${FIELD_CLASS} scrollbar-subtle resize-none px-3 py-2 leading-relaxed`}
        {...textAreaProps}
        onScroll={event => {
          scrollbar.onScroll();
          onScroll?.(event);
        }}
      />
    </FormField>
  );
}
