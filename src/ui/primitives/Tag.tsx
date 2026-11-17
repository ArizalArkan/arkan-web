import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import type { IconName } from './iconData';

type Tone = 'neutral' | 'gold' | 'mana' | 'herb' | 'hp';

const tones: Record<Tone, string> = {
  neutral: 'ptag-neutral',
  gold: 'ptag-gold',
  mana: 'ptag-mana',
  herb: 'ptag-herb',
  hp: 'ptag-hp',
};

type TagProps = ComponentProps<'span'> & { tone?: Tone; icon?: IconName };

/** Non-interactive label for stack, years and status (COMPONENTS.md §2.4). */
export function Tag({ tone = 'neutral', icon, className, children, ...rest }: TagProps) {
  return (
    <span className={cn('ptag', tones[tone], className)} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}
