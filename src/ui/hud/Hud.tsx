import { copy } from '@/content/copy';
import { profile } from '@/content/profile';
import { levelProgress } from '@/game/rules/xp';
import { designedMaxLevel } from '@/game/rules/progress';
import { useGameStore } from '@/game/stores/useGameStore';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { useSettingsStore } from '@/game/stores/useSettingsStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import { cn } from '@/lib/cn';
import { analytics } from '@/services/analytics';
import { audio } from '@/services/audio';
import { Tooltip } from '../patterns/Tooltip';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/iconData';
import { PixelButton } from '../primitives/PixelButton';
import { PixelFrame } from '../primitives/PixelFrame';
import { StatBar } from '../primitives/StatBar';

const MAX_LEVEL = designedMaxLevel();

/**
 * Safe-area HUD (DESIGN.md §8.3): hero status top-left, tools top-right,
 * centre always clear for the town. Hidden while a dialog is on screen in
 * short landscape so the dialog keeps the room.
 */
export function Hud() {
  const xp = useGameStore((state) => state.xp);
  const sound = useSettingsStore((state) => state.sound);
  const dialog = useUIStore((state) => state.dialog);
  const isBlocked = useUIStore(selectIsWorldBlocked);
  const isTransitioning = usePlayerStore((state) => state.isTransitioning);
  const ui = useUIStore.getState();

  const progress = levelProgress(xp);
  const isMax = progress.level >= MAX_LEVEL;

  const toggleSound = () => {
    const next = !useSettingsStore.getState().sound;
    useSettingsStore.getState().setSound(next);
    audio.setEnabled(next);
    if (next) {
      audio.unlock();
      audio.play('confirm');
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2 pt-[max(calc(var(--px)*2),env(safe-area-inset-top))] md:p-4',
        dialog && '[@media(max-height:480px)]:hidden',
        isTransitioning && !isBlocked && 'opacity-0',
      )}
      data-testid="hud"
    >
      <PixelFrame
        variant="ghost"
        padding="sm"
        className="pointer-events-auto flex min-w-0 flex-col gap-1"
      >
        <span className="hidden font-ui text-ui-sm font-semibold sm:block">
          {profile.shortName}
        </span>
        <span className="flex items-center gap-2" title={copy.hud.xpExplainer}>
          <span
            className="pixel-text font-display text-display-sm text-gold-400"
            data-testid="hud-level"
          >
            {copy.hud.level} {isMax ? copy.hud.maxLevel : progress.level}
          </span>
          <StatBar
            kind="xp"
            label={copy.hud.xp}
            value={isMax ? 1 : progress.current}
            max={isMax ? 1 : progress.needed}
            showValue={false}
            className="w-24 sm:w-32"
            data-testid="hud-xp"
          />
        </span>
        <span className="sr-only">{copy.hud.xpExplainer}</span>
      </PixelFrame>

      <nav aria-label={copy.hud.menu} className="pointer-events-auto flex gap-1">
        <HudButton
          icon="map"
          label={`${copy.hud.fastTravel} (M)`}
          onClick={() => ui.openWindow('fast-travel')}
        />
        <HudButton
          icon="log"
          label={`${copy.hud.questLog} (Q)`}
          onClick={() => ui.openWindow('quest-log')}
        />
        <HudButton
          icon={sound ? 'sound-on' : 'sound-off'}
          label={sound ? copy.hud.soundOff : copy.hud.soundOn}
          onClick={toggleSound}
          pressed={sound}
        />
        <HudButton
          icon="book"
          label={copy.hud.switchToQuickRead}
          onClick={() => {
            useSettingsStore.getState().setMode('quick');
            analytics.track('mode_selected', { mode: 'quick' });
          }}
        />
        <HudButton icon="gear" label={copy.hud.menu} onClick={() => ui.openWindow('settings')} />
      </nav>
    </div>
  );
}

function HudButton({
  icon,
  label,
  onClick,
  pressed,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <Tooltip label={label}>
      <PixelButton
        variant="secondary"
        size="sm"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        sfx="none"
        className="px-2"
      >
        <Icon name={icon} />
      </PixelButton>
    </Tooltip>
  );
}
