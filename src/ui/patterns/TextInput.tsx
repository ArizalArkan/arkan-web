import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { inputClass } from './inputClass';

export function TextInput({ className, ...rest }: ComponentProps<'input'>) {
  return <input className={cn(inputClass, className)} {...rest} />;
}
