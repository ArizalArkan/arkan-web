import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { audio } from '@/services/audio';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { ICONS } from './iconData';
import { Kbd } from './Kbd';
import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { Portrait } from './Portrait';
import { RarityBadge } from './RarityBadge';
import { Spinner } from './Spinner';
import { StatBar } from './StatBar';
import { Tag } from './Tag';

describe('icon data', () => {
  it.each(Object.entries(ICONS))('%s is a 16x16 bitmap', (_, rows) => {
    expect(rows).toHaveLength(16);
    for (const row of rows) expect(row).toMatch(/^[#.]{16}$/);
  });
});

describe('Icon', () => {
  it('is hidden from assistive tech without a label', () => {
    const { container } = render(<Icon name="close" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is an image with a name when labelled, at integer sizes', () => {
    render(<Icon name="map" label="Fast Travel" size={2} />);
    const icon = screen.getByRole('img', { name: 'Fast Travel' });
    expect(icon).toHaveAttribute('width', '32');
    expect(icon.querySelectorAll('rect').length).toBeGreaterThan(0);
  });
});

describe('PixelFrame', () => {
  it('renders the requested element, variant and nameplate', () => {
    render(
      <PixelFrame as="section" variant="parchment" title="Guild Hall" aria-label="frame">
        Body
      </PixelFrame>,
    );
    const frame = screen.getByRole('region', { name: 'frame' });
    expect(frame).toHaveClass('pf', 'pf-parchment', 'surface-light');
    expect(screen.getByText('Guild Hall')).toBeInTheDocument();
  });
});

describe('PixelButton', () => {
  it('is a button by default and plays a confirm blip', () => {
    const play = vi.spyOn(audio, 'play');
    const onClick = vi.fn();
    render(<PixelButton onClick={onClick}>Send Letter</PixelButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Send Letter' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledWith('confirm');
    play.mockRestore();
  });

  it('cannot be clicked twice while loading and keeps its label for width', () => {
    const onClick = vi.fn();
    render(
      <PixelButton isLoading onClick={onClick}>
        Send Letter
      </PixelButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders external links safely with a new-tab hint', () => {
    render(
      <PixelButton href="https://example.com" variant="secondary" sfx="none">
        Visit Site
      </PixelButton>,
    );
    const link = screen.getByRole('link', { name: /Visit Site/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('(opens in a new tab)');
  });

  it('keeps internal links in the same tab and respects disabled', () => {
    render(
      <>
        <PixelButton href="/cv.pdf" variant="ghost">
          Download CV
        </PixelButton>
        <PixelButton variant="danger" disabled>
          Delete Progress
        </PixelButton>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Download CV' })).not.toHaveAttribute('target');
    expect(screen.getByRole('button', { name: 'Delete Progress' })).toBeDisabled();
  });
});

describe('Tag, RarityBadge, Kbd, Divider', () => {
  it('renders tag text with an optional icon', () => {
    render(
      <Tag tone="gold" icon="star">
        Featured
      </Tag>,
    );
    expect(screen.getByText('Featured')).toHaveClass('ptag', 'ptag-gold');
  });

  it.each([
    ['legendary', 'Legendary'],
    ['epic', 'Epic'],
    ['rare', 'Rare'],
    ['common', 'Common'],
    [null, 'Unranked'],
  ] as const)('rarity %s reads as text, not color only', (rarity, label) => {
    render(<RarityBadge rarity={rarity} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders a keycap and a separator', () => {
    render(
      <>
        <Kbd>E</Kbd>
        <Divider ornament />
      </>,
    );
    expect(screen.getByText('E').tagName).toBe('KBD');
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

describe('StatBar', () => {
  it('exposes value, bounds and a readable value text', () => {
    render(<StatBar label="XP" value={150} max={300} />);
    const bar = screen.getByRole('progressbar', { name: 'XP' });
    expect(bar).toHaveAttribute('aria-valuenow', '150');
    expect(bar).toHaveAttribute('aria-valuemax', '300');
    expect(bar).toHaveAttribute('aria-valuetext', 'XP 150 of 300');
    expect(screen.getByText('150/300')).toBeInTheDocument();
  });

  it('clamps out-of-range values and can hide the number', () => {
    render(<StatBar kind="hp" label="HP" value={999} max={0} showValue={false} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.queryByText(/\//)).not.toBeInTheDocument();
  });
});

describe('Portrait and Spinner', () => {
  it('keeps the aspect ratio at an integer height', () => {
    render(<Portrait src="/a.webp" alt="Arkan" size="lg" aspect={1.5} />);
    const img = screen.getByRole('img', { name: 'Arkan' });
    expect(img).toHaveAttribute('height', '96');
    expect(img).toHaveAttribute('width', '144');
  });

  it('announces loading', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });
});
