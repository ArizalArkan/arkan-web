const VARIANTS = ['bg-nb-yellow', 'bg-nb-pink', 'bg-nb-lime', 'bg-nb-sky'];

const MarqueeItem = ({ text, index }) => {
  const isAvailable = text === 'AVAILABLE FOR WORK';
  const bg = isAvailable ? 'bg-white' : VARIANTS[index % VARIANTS.length];

  return (
    <span
      className={`nb-border ${bg} flex shrink-0 items-center gap-2 whitespace-nowrap
                  px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink
                  transition-transform duration-150 ease-out
                  hover:-translate-y-0.5 hover:shadow-nb
                  sm:px-3 sm:py-1.5 sm:text-xs`}>
      {isAvailable && (
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="btn-ping" />
          <span className="btn-ping_dot" />
        </span>
      )}
      {text}
    </span>
  );
};

const Marquee = ({ items, durationSeconds = 32, className = '' }) => {
  const sequence = [...items, ...items];

  return (
    <div
      className={`group overflow-hidden border-b-3 border-ink bg-ink py-2.5 sm:py-3 ${className}`}
      role="presentation"
      style={{
        maskImage:
          'linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)',
      }}>
      <div
        className="nb-marquee-track group-hover:[animation-play-state:paused]"
        style={{ '--nb-marquee-duration': `${durationSeconds}s` }}>
        {sequence.map((item, index) => (
          <MarqueeItem key={`${item}-${index}`} text={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Marquee;
