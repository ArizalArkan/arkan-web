import type { ReactNode } from 'react';
import { copy } from '@/content/copy';
import { setMusicEnabled } from '@/game/musicControl';
import { useGameStore } from '@/game/stores/useGameStore';
import {
  selectReducedMotion,
  useSettingsStore,
  type Quality,
} from '@/game/stores/useSettingsStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { cn } from '@/lib/cn';
import { analytics } from '@/services/analytics';
import { audio } from '@/services/audio';
import { ConfirmDialog } from '../patterns/ConfirmDialog';
import { Window } from '../patterns/Window';
import { PixelButton } from '../primitives/PixelButton';

const QUALITY: { id: Quality; label: string }[] = [
  { id: 'auto', label: copy.settings.qualityAuto },
  { id: 'high', label: copy.settings.qualityHigh },
  { id: 'medium', label: copy.settings.qualityMedium },
  { id: 'low', label: copy.settings.qualityLow },
];

/** Every preference applies immediately and is saved (UX-GUIDELINES.md §9.6). */
export function SettingsWindow() {
  const sound = useSettingsStore((state) => state.sound);
  const music = useSettingsStore((state) => state.music);
  const quality = useSettingsStore((state) => state.quality);
  const settings = useSettingsStore.getState();
  const reducedMotion = useSettingsStore(selectReducedMotion);
  const modal = useUIStore((state) => state.modal);
  const ui = useUIStore.getState();

  const toggleSound = () => {
    const next = !useSettingsStore.getState().sound;
    settings.setSound(next);
    audio.setEnabled(next);
    if (next) {
      // Proof that it worked (UX-GUIDELINES.md §9.5).
      audio.unlock();
      audio.play('confirm');
    }
  };

  return (
    <Window id="settings" title={copy.settings.title} icon="gear" onClose={ui.closeWindow}>
      <div className="flex flex-col gap-6">
        <Row label={copy.settings.sound} hint={copy.settings.soundHint}>
          <Switch checked={sound} onChange={toggleSound} label={copy.settings.sound} />
        </Row>

        <Row label={copy.settings.music} hint={copy.settings.musicHint}>
          <Switch
            checked={music}
            onChange={() => setMusicEnabled(!music)}
            label={copy.settings.music}
          />
        </Row>

        <Row label={copy.settings.reducedMotion} hint={copy.settings.reducedMotionHint}>
          <Switch
            checked={reducedMotion}
            onChange={() => settings.setReducedMotion(!reducedMotion)}
            label={copy.settings.reducedMotion}
          />
        </Row>

        <Row label={copy.settings.quality} hint={copy.settings.qualityHint}>
          <div
            role="radiogroup"
            aria-label={copy.settings.quality}
            className="flex flex-wrap gap-2"
          >
            {QUALITY.map((option) => (
              <PixelButton
                key={option.id}
                role="radio"
                aria-checked={quality === option.id}
                size="sm"
                variant={quality === option.id ? 'secondary' : 'ghost'}
                className={cn(quality === option.id && 'text-gold-400')}
                onClick={() => {
                  settings.setQuality(option.id);
                  analytics.track('quality_tier_set', { quality: option.id });
                }}
              >
                {option.label}
              </PixelButton>
            ))}
          </div>
        </Row>

        <Row label={copy.settings.mode}>
          <PixelButton
            variant="secondary"
            onClick={() => {
              ui.closeWindow();
              settings.setMode('quick');
              analytics.track('mode_selected', { mode: 'quick' });
            }}
          >
            {copy.hud.switchToQuickRead}
          </PixelButton>
        </Row>

        <Row label={copy.settings.reset} hint={copy.settings.resetHint}>
          <PixelButton variant="danger" onClick={() => ui.openModal('reset-confirm')}>
            {copy.settings.reset}
          </PixelButton>
        </Row>
      </div>

      <ConfirmDialog
        open={modal === 'reset-confirm'}
        onClose={ui.closeModal}
        onConfirm={() => {
          useGameStore.getState().resetProgress();
          ui.pushToast({ kind: 'success', title: copy.toasts.progressReset });
        }}
        tone="danger"
        title={copy.settings.resetTitle}
        message={copy.settings.resetBody}
        confirmLabel={copy.settings.resetConfirm}
      />
    </Window>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-col">
        <span className="font-ui text-ui-md font-semibold">{label}</span>
        {hint ? <span className="font-body text-body-sm text-dusk-300">{hint}</span> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="touch-target inline-flex items-center gap-2 font-ui text-ui-md font-semibold"
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-block h-6 w-12 outline-2 -outline-offset-2 outline-parchment-300',
          checked ? 'bg-gold-400' : 'bg-night-900',
        )}
      >
        <span
          className={cn(
            'absolute top-1 size-4 bg-parchment-100 transition-[left] duration-(--motion-instant) ease-pixel',
            checked ? 'left-7 bg-ink-900' : 'left-1',
          )}
        />
      </span>
      {checked ? copy.settings.on : copy.settings.off}
    </button>
  );
}
