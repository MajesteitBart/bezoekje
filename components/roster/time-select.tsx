"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMin } from "@/lib/dates";

export function TimeSelect({
  id,
  value,
  onChange,
  from,
  to,
  step,
}: {
  id?: string;
  value: number;
  onChange: (min: number) => void;
  from: number;
  to: number;
  step: number;
}) {
  const options: number[] = [];
  for (let m = from; m <= to; m += step) options.push(m);
  if (!options.includes(value)) options.push(value);
  options.sort((a, b) => a - b);

  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{(v) => (v == null ? "" : formatMin(Number(v)))}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {formatMin(m)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
