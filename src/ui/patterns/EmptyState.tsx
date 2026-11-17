import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/iconData';
import { PixelButton } from '../primitives/PixelButton';

export type StateProps = {
  illustration: IconName;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Extra content under the description, e.g. a mailto link. */
  children?: ReactNode;
  className?: string;
};

/** Empty is not an error: picture, what it means, what to do (UX-GUIDELINES.md §3). */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  children,
  className,
}: StateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-4 py-8 text-center', className)}>
      <span className="opacity-80">
        <Icon name={illustration} size={3} />
      </span>
      <p className="font-ui text-ui-lg font-semibold">{title}</p>
      {description ? (
        <p className="max-w-prose font-body text-body-md opacity-85">{description}</p>
      ) : null}
      {children}
      {action ? (
        <PixelButton variant="secondary" onClick={action.onClick}>
          {action.label}
        </PixelButton>
      ) : null}
    </div>
  );
}
