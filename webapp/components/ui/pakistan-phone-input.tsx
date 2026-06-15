'use client';

import { Input } from '@/components/ui/input';
import { normalizePakistanPhoneInput } from '@/lib/validation/pakistan-phone';
import { cn } from '@/lib/utils';

type PakistanPhoneInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'inputMode' | 'maxLength' | 'onChange' | 'value'
> & {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export function PakistanPhoneInput({
  value,
  onChange,
  invalid,
  className,
  ...props
}: PakistanPhoneInputProps) {
  return (
    <Input
      {...props}
      type="tel"
      inputMode="tel"
      maxLength={15}
      placeholder="+92-334-2112390"
      value={value}
      aria-invalid={invalid || undefined}
      className={cn(invalid && 'border-destructive', className)}
      onChange={(e) => onChange(normalizePakistanPhoneInput(e.target.value))}
    />
  );
}
