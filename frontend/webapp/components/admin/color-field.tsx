'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function normalizeHex(value: string): string {
  const cleaned = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) return cleaned;
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) return `#${cleaned}`;
  return value;
}

export function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  const safeColor = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3 rounded-lg border p-2">
        <input
          id={`${id}-picker`}
          type="color"
          value={safeColor}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
          aria-label={`${label} picker`}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(normalizeHex(e.target.value))}
            placeholder="#b45309"
            className="font-mono uppercase"
          />
          <p className="text-xs text-muted-foreground">
            Preview swatch updates as you type a valid hex code.
          </p>
        </div>
        <div
          className="size-10 shrink-0 rounded-md border shadow-inner"
          style={{ backgroundColor: safeColor }}
          title={value}
        />
      </div>
    </div>
  );
}
