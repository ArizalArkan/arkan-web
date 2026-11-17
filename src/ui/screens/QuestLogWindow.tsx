import { copy } from '@/content/copy';
import { quests } from '@/content/quests';
import { world } from '@/content/world';
import { ACHIEVEMENT_IDS, ACHIEVEMENTS } from '@/game/rules/achievements';
import { catalog } from '@/game/rules/progress';
import { mainQuestObjectives } from '@/game/rules/quests';
import { useGameStore } from '@/game/stores/useGameStore';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { useUIStore } from '@/game/stores/useUIStore';
import { cn } from '@/lib/cn';
import { EmptyState } from '../patterns/EmptyState';
import { Window } from '../patterns/Window';
import { Icon } from '../primitives/Icon';
import { PixelButton } from '../primitives/PixelButton';
import { StatBar } from '../primitives/StatBar';

/**
 * Answers "what haven't I seen yet, and how do I get there?" (PRODUCT.md G-02).
 */
export function QuestLogWindow() {
  const visited = useGameStore((state) => state.visited);
  const questsRead = useGameStore((state) => state.questsRead);
  const achievements = useGameStore((state) => state.achievements);
  const ui = useUIStore.getState();
  const closeWindow = useUIStore((state) => state.closeWindow);

  const goTo = (locationId: (typeof world.locations)[number]['id']) => {
    closeWindow();
    usePlayerStore.getState().requestTravel(locationId, true);
  };

  const objectives = mainQuestObjectives({ visited });
  const isEmpty = visited.length === 0 && questsRead.length === 0;
  // Only badges this version of the town can actually award.
  const badgeIds = ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENTS[id].isAttainable(catalog));

  return (
    <Window id="quest-log" title={copy.questLog.title} icon="log" onClose={closeWindow}>
      {isEmpty ? (
        <EmptyState
          illustration="log"
          title={copy.questLog.emptyTitle}
          description={copy.questLog.emptyBody}
          action={{
            label: copy.actions.openFastTravel,
            onClick: () => ui.openWindow('fast-travel'),
          }}
        />
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className="font-ui text-ui-lg font-semibold text-gold-400">
          {copy.questLog.mainQuest}
        </h3>
        <p className="font-body text-body-sm text-dusk-300">{copy.questLog.mainQuestHint}</p>
        <ul className="flex flex-col gap-1">
          {objectives.map(({ locationId, isDone }) => {
            const location = world.locations.find((entry) => entry.id === locationId);
            if (!location) return null;
            return (
              <li key={locationId} className="flex min-h-11 items-center gap-3">
                <span className={isDone ? 'text-herb-400' : 'text-dusk-300'}>
                  <Icon name={isDone ? 'check' : 'star'} />
                </span>
                <span className="flex-1 font-ui text-ui-md">
                  {location.name}
                  <span className="ml-2 text-ui-sm text-dusk-300">{location.literal}</span>
                </span>
                <span className="sr-only">
                  {isDone ? copy.questLog.done : copy.questLog.notYet}
                </span>
                {isDone ? null : (
                  <PixelButton size="sm" variant="ghost" onClick={() => goTo(location.id)}>
                    {copy.questLog.howToGetThere}
                  </PixelButton>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 flex flex-col gap-2">
        <h3 className="font-ui text-ui-lg font-semibold text-gold-400">
          {copy.questLog.projectQuests}
        </h3>
        <StatBar
          kind="mp"
          label={copy.questLog.projectQuests}
          value={questsRead.length}
          max={quests.length}
        />
      </section>

      <section className="mt-6 flex flex-col gap-2">
        <h3 className="font-ui text-ui-lg font-semibold text-gold-400">{copy.questLog.badges}</h3>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {badgeIds.map((id) => {
            const badge = ACHIEVEMENTS[id];
            const isUnlocked = achievements.includes(id);
            return (
              <li
                key={id}
                className={cn(
                  'flex items-start gap-3 bg-night-900/60 p-2',
                  !isUnlocked && 'opacity-75',
                )}
              >
                <span className={isUnlocked ? 'text-gold-400' : 'text-dusk-300'}>
                  <Icon name={isUnlocked ? 'star' : 'lock'} size={2} />
                </span>
                <span className="flex flex-col">
                  <span className="font-ui text-ui-md font-semibold">
                    {badge.isSecret && !isUnlocked ? copy.questLog.secretBadge : badge.name}
                  </span>
                  <span className="font-body text-body-sm text-dusk-300">{badge.requirement}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </Window>
  );
}
