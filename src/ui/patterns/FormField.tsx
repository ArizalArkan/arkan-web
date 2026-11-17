import { cloneElement, isValidElement, useId, type ReactElement } from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';

type FieldControlProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  required?: boolean;
};

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Marks the field "(optional)" when most fields are required. */
  showOptional?: boolean;
  children: ReactElement<FieldControlProps>;
  className?: string;
};

/** Wires label, hint and error to its input (COMPONENTS.md §3.7). */
export function FormField({
  label,
  hint,
  error,
  required,
  showOptional,
  children,
  className,
}: FormFieldProps) {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required,
      })
    : children;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-ui text-ui-md font-semibold">
        {label}
        {showOptional && !required ? (
          <span className="ml-2 font-normal opacity-80">{copy.a11y.optional}</span>
        ) : null}
      </label>
      {control}
      {hint ? (
        <p id={hintId} className="font-ui text-ui-sm text-dusk-300">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 font-ui text-ui-sm text-hp-300">
          <Icon name="alert" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
