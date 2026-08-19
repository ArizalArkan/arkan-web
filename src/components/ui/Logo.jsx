/**
 * `compact` — the navbar wordmark: monogram chip + name, sized for a
 *   header row.
 * `full` — the full badge (monogram, underline, wordmark, tagline,
 *   dots) used as a signature stamp, e.g. in the About section.
 * `mark` — just the bordered monogram square, no wordmark. Sizable via
 *   className (e.g. `h-16 w-16`) — for slots where a small icon/avatar
 *   is expected rather than the whole wordmark.
 */
const Logo = ({ variant = 'compact', className = '' }) => {
  if (variant === 'mark') {
    return (
      <span className={`nb-border flex shrink-0 items-center justify-center bg-white shadow-nb ${className}`}>
        <span className="flex items-center gap-px font-display leading-none">
          <span className="text-nb-lime">A</span>
          <span className="text-nb-pink">D</span>
        </span>
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`nb-border inline-flex w-fit flex-col gap-2.5 bg-white p-4 shadow-nb-lg ${className}`}>
        <div className="flex items-center gap-0.5 font-display text-3xl leading-none">
          <span className="text-nb-lime">A</span>
          <span className="text-nb-pink">D</span>
        </div>
        <div className="h-[2px] w-full bg-ink" />
        <span className="w-fit bg-nb-lime px-2 py-0.5 font-display text-base leading-none text-ink">
          ArkDev
        </span>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wide text-ink/70">
            Code. Solve. Build.
          </span>
          <div className="flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 bg-ink" />
            <span className="h-1.5 w-1.5 bg-ink" />
            <span className="h-1.5 w-1.5 bg-ink" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <a href="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="nb-border flex h-9 w-9 shrink-0 items-center justify-center bg-white shadow-nb">
        <span className="flex items-center gap-px font-display text-base leading-none">
          <span className="text-nb-lime">A</span>
          <span className="text-nb-pink">D</span>
        </span>
      </span>
      <span className="nb-border bg-ink px-2.5 py-1.5 font-display text-sm text-nb-yellow">
        ArkDev
      </span>
    </a>
  );
};

export default Logo;
