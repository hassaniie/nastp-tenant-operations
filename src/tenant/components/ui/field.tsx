import { createContext, isValidElement, useContext, useId, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface FieldContextValue { id?: string; describedBy?: string; invalid?: boolean; required?: boolean }
const FieldContext = createContext<FieldContextValue>({});

export interface FieldControlProps {
  id?: string;
  invalid?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
}

/** Internal bridge used by canonical native and Radix controls. */
export function useFieldControl(props: FieldControlProps) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field.id,
    'aria-describedby': [field.describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined,
    'aria-invalid': props.invalid || field.invalid || props['aria-invalid'] || undefined,
    'aria-required': field.required || undefined,
  };
}

export function Field({ label, hint, error, required, optional, children, className, id }: {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; optional?: boolean;
  children: ReactNode; className?: string; id?: string;
}) {
  const generated = useId();
  const controlId = id ?? (isValidElement<{ id?: string }>(children) ? children.props.id : undefined) ?? generated;
  const descriptionId = `${controlId}-description`;
  return <FieldContext.Provider value={{ id: controlId, describedBy: error || hint ? descriptionId : undefined, invalid: Boolean(error), required }}>
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={controlId} id={`${controlId}-label`} className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
        {label}{required && <span aria-hidden className="text-critical">*</span>}{optional && <span className="text-xs font-normal text-subtle">Optional</span>}
      </label>
      {children}
      {(error || hint) && <span id={descriptionId} role={error ? 'alert' : undefined} className={cn('text-xs leading-relaxed', error ? 'text-critical' : 'text-subtle')}>{error || hint}</span>}
    </div>
  </FieldContext.Provider>;
}

export function SettingRow({ title, description, control, className }: { title: ReactNode; description?: ReactNode; control: ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between gap-6 py-3.5', className)}>
    <div className="min-w-0"><p className="text-[13px] font-medium text-foreground">{title}</p>{description && <p className="mt-0.5 text-[12px] leading-relaxed text-subtle">{description}</p>}</div>
    <div className="shrink-0">{control}</div>
  </div>;
}
