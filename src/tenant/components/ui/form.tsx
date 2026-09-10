import * as SelectPrimitive from '@radix-ui/react-select';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus, ChevronDown, Search, X } from 'lucide-react';
import {
  createContext, useContext, useId, isValidElement, forwardRef, type ComponentPropsWithoutRef, type ElementRef, type InputHTMLAttributes,
  type ReactNode, type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';

/** Field context associates native and Radix controls without cloning their children. */
const FieldContext = createContext<{ id?: string; describedBy?: string; invalid?: boolean; required?: boolean }>({});
function useFieldControl(props: { id?: string; invalid?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' }) {
  const field = useContext(FieldContext);
  return { id: props.id ?? field.id, 'aria-describedby': [field.describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined,
    'aria-invalid': props.invalid || field.invalid || props['aria-invalid'] || undefined, 'aria-required': field.required || undefined };
}

/* ------------------------------------------------------------------ Input */

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => { const field = useFieldControl({ ...props, invalid }); return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-[var(--radius-control)] border bg-surface px-3 text-[14px] text-foreground transition-colors',
        'placeholder:text-subtle outline-none',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        field['aria-invalid'] ? 'border-critical' : 'border-border',
        className,
      )}
      {...props}
      {...field}
    />
  ); },
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => { const field = useFieldControl({ ...props, invalid }); return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2.5 text-[14px] text-foreground',
        'placeholder:text-subtle outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
        field['aria-invalid'] ? 'border-critical' : 'border-border',
        className,
      )}
      {...props}
      {...field}
    />
  ); },
);
Textarea.displayName = 'Textarea';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  autoFocus,
  size = 'md',
  label = placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const field = useFieldControl({});
  const heights = { sm: 'h-8 text-[13px]', md: 'h-9 text-[14px]', lg: 'h-12 text-[15px]' };
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className={cn('pointer-events-none absolute left-3.5 text-subtle', size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
      <input
        {...field}
        aria-label={label}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-[var(--radius-control)] border border-border bg-surface pl-9 pr-9 text-foreground',
          'placeholder:text-subtle outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
          heights[size],
        )}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-3 rounded p-0.5 text-subtle transition-colors hover:text-foreground" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Select */

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'md' }
>(({ className, children, size = 'md', ...props }, ref) => { const field = useFieldControl(props); return (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-border bg-surface px-3',
      'text-[13px] text-foreground outline-none transition-colors',
      'hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20 data-[placeholder]:text-subtle disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-critical',
      size === 'sm' ? 'h-8 text-[13px]' : 'h-9',
      className,
    )}
    {...props}
    {...field}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-subtle" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
); });
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={6}
      className={cn(
        'z-[80] max-h-72 min-w-[9rem] overflow-hidden rounded-[var(--radius-surface)] border border-border bg-surface-overlay p-1',
        'shadow-[var(--shadow-lg)] data-[state=open]:animate-[fade-up_0.16s_cubic-bezier(0.22,1,0.36,1)]',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-0">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-8 text-[13px] text-muted outline-none',
      'data-[highlighted]:bg-surface-raised data-[highlighted]:text-foreground data-[state=checked]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-2.5">
      <Check className="h-3.5 w-3.5 text-primary" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

/** Convenience wrapper: value + options in, controlled select out. */
export function SimpleSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  size,
  className,
  label, disabled, invalid, id,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: ReactNode; disabled?: boolean }>;
  label?: string; disabled?: boolean; invalid?: boolean; id?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <Select disabled={disabled} value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger size={size} className={className} aria-label={label} aria-invalid={invalid || undefined} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ Switch */

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => { const field = useFieldControl(props); return (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border border-transparent',
      'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface data-[state=unchecked]:border-border',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
    {...field}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-[16px] w-[16px] rounded-full bg-primary-foreground shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[3px]" />
  </SwitchPrimitive.Root>
); });
Switch.displayName = 'Switch';

/* ---------------------------------------------------------------- Checkbox */

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => { const field = useFieldControl(props); return (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-surface',
      'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40',
      'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
      className,
    )}
    {...props}
    {...field}
  >
    <CheckboxPrimitive.Indicator>
      {props.checked === 'indeterminate' ? <Minus className="h-3 w-3 text-primary-foreground" /> : <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
); });
Checkbox.displayName = 'Checkbox';

/* ------------------------------------------------------------------- Field */

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

/** Native radios retain platform keyboard/arrow behavior and form semantics. */
export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Radio({ className, ...props }, ref) {
  return <input {...props} ref={ref} type="radio" className={cn('size-4 accent-primary disabled:opacity-50', className)} />;
});
export function RadioGroup<T extends string>({ value, onChange, options, label, disabled, className }: {
  value: T; onChange: (value: T) => void; options: Array<{ value: T; label: ReactNode; disabled?: boolean }>;
  label?: string; disabled?: boolean; className?: string;
}) {
  const name = useId(); const field = useFieldControl({});
  return <div {...field} role="radiogroup" aria-label={label} aria-labelledby={!label && field.id ? `${field.id}-label` : undefined} className={cn('flex flex-wrap gap-4', className)}>
    {options.map((option) => <label key={option.value} className="inline-flex items-center gap-2 text-sm text-muted">
      <Radio name={name} value={option.value} checked={value === option.value} disabled={disabled || option.disabled} onChange={() => onChange(option.value)} />{option.label}
    </label>)}
  </div>;
}

/** Label + control row, used throughout Settings and configuration. */
export function SettingRow({
  title,
  description,
  control,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-6 py-3.5', className)}>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-[12px] leading-relaxed text-subtle">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
