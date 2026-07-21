import { useId, type InputHTMLAttributes } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly error?: string;
  readonly hint?: string;
  readonly label: string;
}

export function TextField({
  'aria-describedby': ariaDescribedBy,
  error,
  hint,
  id,
  label,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const message = error ?? hint;
  const messageId = message === undefined ? undefined : `${controlId}-message`;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={error === undefined ? 'hn-text-field' : 'hn-text-field hn-text-field--invalid'}>
      <label className="hn-text-field__label" htmlFor={controlId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={error === undefined ? undefined : true}
        className="hn-text-field__control"
        id={controlId}
        {...props}
      />
      {message === undefined ? null : (
        <p className="hn-text-field__message" id={messageId}>
          {message}
        </p>
      )}
    </div>
  );
}
