/** Form controls — the preset's Input/Textarea/Select/Switch/Checkbox. */
import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input as UIInput } from '../ui/input';
import { Textarea as UITextarea } from '../ui/textarea';
import { Switch as UISwitch } from '../ui/switch';
import { Checkbox as UICheckbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Select as S, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ invalid, ...props }, ref) => <UIInput ref={ref} aria-invalid={invalid || undefined} {...props} />,
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ invalid, ...props }, ref) => <UITextarea ref={ref} aria-invalid={invalid || undefined} {...props} />,
);
Textarea.displayName = 'Textarea';

export const Switch = UISwitch;
export const Checkbox = UICheckbox;
export { S as Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

export function SearchInput({ value, onChange, placeholder = 'Search…', className, autoFocus, size = 'md' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocus?: boolean; size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <UIInput
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        className={cn('pl-9', size === 'sm' && 'h-8', size === 'lg' && 'h-11')}
      />
    </div>
  );
}

export function SimpleSelect<T extends string>({ value, onChange, options, placeholder, size, className }: {
  value: T; onChange: (v: T) => void; options: Array<{ value: T; label: ReactNode }>; placeholder?: string; size?: 'sm' | 'md'; className?: string;
}) {
  return (
    <S value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger size={size === 'sm' ? 'sm' : 'default'} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </S>
  );
}

export function Field({ label, hint, error, required, optional, children, className }: {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; optional?: boolean; children: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label className="gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="text-muted-foreground font-normal">(optional)</span>}
      </Label>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

export function SettingRow({ title, description, control, className }: { title: ReactNode; description?: ReactNode; control: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-6 border-b py-4 last:border-b-0', className)}>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
