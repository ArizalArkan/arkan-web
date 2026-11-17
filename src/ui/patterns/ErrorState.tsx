import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';
import { PixelButton } from '../primitives/PixelButton';
import type { StateProps } from './EmptyState';

/** What happened, what it means, what to do next (UX-GUIDELINES.md §4). */
export function ErrorState({
  illustration,
  title,
  description,
  action,
  children,
  className,
}: StateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 px-4 py-8 text-center', className)}
    >
      <span className="text-hp-300">
        <Icon name={illustration} size={3} />
      </span>
      <p className="font-ui text-ui-lg font-semibold">{title}</p>
      {description ? (
        <p className="max-w-prose font-body text-body-md opacity-85">{description}</p>
      ) : null}
      {children}
      {action ? (
        <PixelButton variant="primary" onClick={action.onClick}>
          {action.label}
        </PixelButton>
      ) : null}
    </div>
  );
}
