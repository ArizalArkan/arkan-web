import type { ComponentPropsWithoutRef, MouseEvent, ReactNode, Ref } from 'react';
import { copy } from '@/content/copy';
import { cn } from '@/lib/cn';
import { audio, type SfxId } from '@/services/audio';
import { Icon } from './Icon';
import type { IconName } from './iconData';
import { VisuallyHidden } from './VisuallyHidden';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Common = {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  sfx?: 'confirm' | 'cancel' | 'none';
  className?: string;
  children?: ReactNode;
};

type AsButton = Common &
  Omit<ComponentPropsWithoutRef<'button'>, keyof Common> & {
    href?: undefined;
    ref?: Ref<HTMLButtonElement>;
  };
type AsLink = Common &
  Omit<ComponentPropsWithoutRef<'a'>, keyof Common> & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  };

export type PixelButtonProps = AsButton | AsLink;

const variants: Record<Variant, string> = {
  primary: 'pbtn-primary',
  secondary: 'pbtn-secondary',
  ghost: 'pbtn-ghost',
  danger: 'pbtn-danger',
};

const sizes: Record<Size, string> = {
  sm: 'text-ui-sm',
  md: 'text-ui-md',
  lg: 'text-ui-lg px-6',
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** COMPONENTS.md §2.2. Renders an <a> when `href` is set. */
export function PixelButton(props: PixelButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    iconLeft,
    iconRight,
    sfx = 'confirm',
    className,
    children,
    ...rest
  } = props;

  const classes = cn('pbtn', variants[variant], sizes[size], className);
  const playSfx = () => {
    if (sfx !== 'none') audio.play(sfx satisfies SfxId);
  };

  // Loading keeps the width fixed: the label stays in place, invisible.
  const content = (
    <>
      <span className="pbtn-shadow" aria-hidden="true" />
      <span className="pbtn-border" aria-hidden="true" />
      <span className="pbtn-fill" aria-hidden="true" />
      <span className={cn('inline-flex items-center gap-2', isLoading && 'invisible')}>
        {iconLeft ? <Icon name={iconLeft} /> : null}
        {children}
        {iconRight ? <Icon name={iconRight} /> : null}
      </span>
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <LoadingDots />
        </span>
      ) : null}
    </>
  );

  if (rest.href !== undefined) {
    const { href, onClick, ...anchorRest } = rest as AsLink;
    const external = isExternal(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          playSfx();
          onClick?.(event);
        }}
        {...anchorRest}
      >
        {content}
        {external ? (
          <>
            <Icon name="external" />
            <VisuallyHidden>{copy.a11y.newTab}</VisuallyHidden>
          </>
        ) : null}
      </a>
    );
  }

  const { onClick, type = 'button', disabled, ...buttonRest } = rest as AsButton;
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      onClick={(event) => {
        if (isLoading) {
          event.preventDefault();
          return;
        }
        playSfx();
        onClick?.(event);
      }}
      {...buttonRest}
    >
      {content}
      {isLoading ? <VisuallyHidden>{copy.a11y.loading}</VisuallyHidden> : null}
    </button>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="blink-caret inline-block size-1.5 bg-current"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </span>
  );
}
