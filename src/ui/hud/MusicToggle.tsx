import { copy } from '@/content/copy';
import { setMusicEnabled } from '@/game/musicControl';
import { useSettingsStore } from '@/game/stores/useSettingsStore';
import { cn } from '@/lib/cn';
import { Icon } from '../primitives/Icon';
import { PixelButton } from '../primitives/PixelButton';

type MusicToggleProps = {
  /** Label while music is off; defaults to "Play music". */
  label?: string;
  className?: string;
};

/** Play / stop the background loop. Off until the visitor asks for it. */
export function MusicToggle({ label = copy.quickRead.musicOn, className }: MusicToggleProps) {
  const isOn = useSettingsStore((state) => state.music);
  return (
    <PixelButton
      variant="ghost"
      size="sm"
      sfx="none"
      aria-pressed={isOn}
      onClick={() => setMusicEnabled(!isOn)}
      className={cn('shrink-0', isOn && 'text-gold-400', className)}
      data-testid="music-toggle"
    >
      <Icon name={isOn ? 'sound-on' : 'sound-off'} />
      {isOn ? copy.quickRead.musicOff : label}
    </PixelButton>
  );
}
