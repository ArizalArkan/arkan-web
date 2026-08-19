import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const PATROL_RANGE = 62; // px each side of center the cat walks
const GREETING_DURATION = 1800; // ms
const GRASS_COUNT = 7;

// A genuine pixel bitmap, not a smooth vector shape — 16x12 grid, one
// character per cell. '.' empty, '#' body, 'T' tail (its own group so
// it can wag independently), 'E' eye, 'N' nose.
const CAT_CELL = 6;
const CAT_GRID = [
  '..........#...#.',
  '..........##.##.',
  '.........#######',
  '.........##E#E##',
  '..T......###N###',
  '.T.......#######',
  'T.##############',
  'T.###########...',
  '.T###########...',
  '..###########...',
  '...#..#..#..#...',
  '...#..#..#..#...',
];

const CAT_COLOR = {
  '#': '#0A0A0A',
  T: '#0A0A0A',
  E: '#A8E10C',
  N: '#FF6B9D',
};

const bodyCells = [];
const tailCells = [];
CAT_GRID.forEach((row, y) => {
  [...row].forEach((char, x) => {
    if (char === '.') return;
    const cell = { x: x * CAT_CELL, y: y * CAT_CELL, fill: CAT_COLOR[char] };
    if (char === 'T') tailCells.push(cell);
    else bodyCells.push(cell);
  });
});

const PixelCloud = ({ className }) => (
  <div className={`absolute flex items-end ${className}`} aria-hidden="true">
    <span className="h-3 w-5 border-2 border-ink bg-white" />
    <span className="-ml-1 h-4 w-6 border-2 border-ink bg-white" />
    <span className="-ml-1 h-3 w-5 border-2 border-ink bg-white" />
  </div>
);

const PixelCat = () => {
  const catRef = useRef(null);
  const tweenRef = useRef(null);
  const timeoutRef = useRef(null);
  const [greeting, setGreeting] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!catRef.current) return undefined;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(catRef.current, {
      x: PATROL_RANGE,
      duration: 3,
      ease: 'power1.inOut',
      onStart: () => gsap.set(catRef.current, { scaleX: 1 }),
    }).to(catRef.current, {
      x: -PATROL_RANGE,
      duration: 3,
      ease: 'power1.inOut',
      onStart: () => gsap.set(catRef.current, { scaleX: -1 }),
    });

    tweenRef.current = tl;
    return () => tl.kill();
  }, []);

  const handleGreet = () => {
    if (greeting) return;
    setGreeting(true);
    tweenRef.current?.pause();

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setGreeting(false);
      tweenRef.current?.play();
    }, GREETING_DURATION);
  };

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return (
    <div className="relative flex min-h-[160px] w-full flex-1 flex-col justify-end overflow-hidden">
      <PixelCloud className="nb-cloud-a left-3 top-2" />
      <PixelCloud className="nb-cloud-b right-6 top-8 opacity-70" />

      {greeting && (
        <span className="nb-badge nb-cat-bubble absolute left-1/2 top-1/3 -translate-x-1/2 whitespace-nowrap bg-white text-[10px]">
          MEOW! 👋
        </span>
      )}

      <button
        type="button"
        onClick={handleGreet}
        onMouseEnter={handleGreet}
        aria-label="Say hi to the cat"
        className="relative z-10 mx-auto -mb-1 h-[99px] w-[132px] cursor-pointer border-0 bg-transparent p-0">
        <svg
          ref={catRef}
          viewBox="0 0 96 72"
          shapeRendering="crispEdges"
          className={`h-full w-full ${greeting ? 'is-greeting' : ''}`}
          style={{ transformOrigin: '50% 100%' }}
          aria-hidden="true">
          <g className="nb-cat-body">
            {bodyCells.map((cell) => (
              <rect
                key={`${cell.x}-${cell.y}`}
                x={cell.x}
                y={cell.y}
                width={CAT_CELL}
                height={CAT_CELL}
                fill={cell.fill}
              />
            ))}

            {/* raised paw pixel, shown only while greeting */}
            <rect className="nb-cat-paw" x="54" y="36" width={CAT_CELL} height={CAT_CELL * 2} fill="#0A0A0A" />
          </g>

          <g className="nb-cat-tail">
            {tailCells.map((cell) => (
              <rect
                key={`${cell.x}-${cell.y}`}
                x={cell.x}
                y={cell.y}
                width={CAT_CELL}
                height={CAT_CELL}
                fill={cell.fill}
              />
            ))}
          </g>
        </svg>
      </button>

      {/* ground */}
      <div className="relative z-0 w-full">
        <div className="flex justify-between px-3">
          {Array.from({ length: GRASS_COUNT }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '8px solid #A8E10C',
              }}
            />
          ))}
        </div>
        <div className="border-t-3 border-dashed border-ink/50" />
      </div>
    </div>
  );
};

export default PixelCat;
