import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/ui/patterns/ConfirmDialog';
import { DialogBox } from '@/ui/patterns/DialogBox';
import { EmptyState } from '@/ui/patterns/EmptyState';
import { ErrorState } from '@/ui/patterns/ErrorState';
import { FormField } from '@/ui/patterns/FormField';
import { MenuList } from '@/ui/patterns/MenuList';
import { Tabs } from '@/ui/patterns/Tabs';
import { TextArea } from '@/ui/patterns/TextArea';
import { TextInput } from '@/ui/patterns/TextInput';
import { ToastViewport } from '@/ui/patterns/ToastViewport';
import { Tooltip } from '@/ui/patterns/Tooltip';
import { Divider } from '@/ui/primitives/Divider';
import { Icon } from '@/ui/primitives/Icon';
import { ICONS, type IconName } from '@/ui/primitives/iconData';
import { Kbd } from '@/ui/primitives/Kbd';
import { PixelButton } from '@/ui/primitives/PixelButton';
import { PixelFrame } from '@/ui/primitives/PixelFrame';
import { RarityBadge } from '@/ui/primitives/RarityBadge';
import { Spinner } from '@/ui/primitives/Spinner';
import { StatBar } from '@/ui/primitives/StatBar';
import { Tag } from '@/ui/primitives/Tag';

// Every primitive and pattern in every variant and state, on one page.
// Loaded only with ?catalog=1, for visual review and QA snapshot V19.
// Sample strings here are UI fixtures, not portfolio content.
export default function ComponentCatalog() {
  const [menuValue, setMenuValue] = useState<string | null>('guild');
  const [tab, setTab] = useState('frontend');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('Hello Arkan, quick question about');

  return (
    <main className="mx-auto flex max-w-grid flex-col gap-12 p-4 md:p-8">
      <h1 className="pixel-text text-shadow-pixel font-display text-display-lg uppercase">
        Component catalog
      </h1>

      <Section title="PixelFrame">
        <div className="grid gap-8 md:grid-cols-3">
          <PixelFrame title="Window">Dark window, the default surface.</PixelFrame>
          <PixelFrame variant="parchment" title="Parchment">
            Light surface for long reading.
          </PixelFrame>
          <PixelFrame variant="ghost">Ghost: border only, for the HUD.</PixelFrame>
        </div>
      </Section>

      <Section title="PixelButton">
        {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-4">
            <span className="w-24 font-ui text-ui-sm text-dusk-300">{variant}</span>
            <PixelButton variant={variant} size="sm">
              Small
            </PixelButton>
            <PixelButton variant={variant} iconLeft="letter">
              Send Letter
            </PixelButton>
            <PixelButton variant={variant} size="lg">
              Large
            </PixelButton>
            <PixelButton variant={variant} disabled>
              Disabled
            </PixelButton>
            <PixelButton variant={variant} isLoading>
              Loading
            </PixelButton>
          </div>
        ))}
        <PixelButton href="https://example.com" variant="secondary" sfx="none">
          External link
        </PixelButton>
        <PixelFrame variant="parchment" className="flex flex-wrap gap-4">
          <PixelButton variant="primary">On parchment</PixelButton>
          <PixelButton variant="secondary">Secondary</PixelButton>
          <PixelButton variant="ghost">Ghost</PixelButton>
        </PixelFrame>
      </Section>

      <Section title="Icon">
        <div className="flex flex-wrap gap-4">
          {(Object.keys(ICONS) as IconName[]).map((name) => (
            <span
              key={name}
              className="flex w-20 flex-col items-center gap-1 font-ui text-ui-sm text-dusk-300"
            >
              <span className="text-parchment-100">
                <Icon name={name} size={2} />
              </span>
              {name}
            </span>
          ))}
        </div>
        <div className="flex items-end gap-4 text-gold-400">
          <Icon name="star" size={1} />
          <Icon name="star" size={2} />
          <Icon name="star" size={3} />
        </div>
      </Section>

      <Section title="Tag, RarityBadge, Kbd, StatBar, Spinner, Divider">
        <div className="flex flex-wrap gap-2">
          {(['neutral', 'gold', 'mana', 'herb', 'hp'] as const).map((tone) => (
            <Tag key={tone} tone={tone}>
              {tone}
            </Tag>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['legendary', 'epic', 'rare', 'common', null] as const).map((rarity) => (
            <RarityBadge key={rarity ?? 'none'} rarity={rarity} />
          ))}
        </div>
        <p className="flex items-center gap-2 font-ui text-ui-md">
          <Kbd>E</Kbd> Talk <Kbd>M</Kbd> Fast Travel <Kbd>Esc</Kbd> Close
        </p>
        <StatBar label="XP" value={150} max={300} />
        <StatBar kind="mp" label="MP" value={300} max={300} />
        <StatBar kind="hp" label="HP" value={40} max={300} />
        <Spinner />
        <Divider ornament />
      </Section>

      <Section title="DialogBox">
        <DialogBox
          speaker={{ name: 'Wren' }}
          lines={['A sample line, typed one letter at a time. Click to finish it.', 'Second page.']}
          choices={[
            { id: 'a', label: 'Open Fast Travel' },
            { id: 'b', label: 'Goodbye' },
          ]}
        />
      </Section>

      <Section title="MenuList">
        <PixelFrame className="max-w-sm">
          <MenuList
            label="Locations"
            value={menuValue}
            onChange={setMenuValue}
            onConfirm={setMenuValue}
            items={[
              { id: 'guild', label: 'Guild Hall', hint: 'About', icon: 'hall' },
              {
                id: 'quest',
                label: 'Quest Board',
                hint: 'Projects',
                icon: 'scroll',
                badge: <Tag tone="gold">New</Tag>,
              },
              { id: 'armory', label: 'Armory', hint: 'Skills', icon: 'sword', disabled: true },
            ]}
          />
        </PixelFrame>
      </Section>

      <Section title="Tabs">
        <PixelFrame variant="parchment">
          <Tabs
            idBase="catalog"
            label="Slots"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'frontend', label: 'Frontend' },
              { id: 'backend', label: 'Backend' },
              { id: 'tools', label: 'Tools' },
            ]}
          />
          <p className="pt-4 font-body text-body-md">Panel: {tab}</p>
        </PixelFrame>
      </Section>

      <Section title="Form">
        <PixelFrame className="flex max-w-read flex-col gap-4">
          <FormField label="Your name" required>
            <TextInput placeholder="Your name" autoComplete="name" />
          </FormField>
          <FormField
            label="Your email"
            required
            error="This email looks incomplete. Example: name@domain.com"
          >
            <TextInput type="email" defaultValue="name@domain" />
          </FormField>
          <FormField label="Your message" hint="Between 10 and 2000 characters." required>
            <TextArea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxCount={2000}
            />
          </FormField>
        </PixelFrame>
      </Section>

      <Section title="Tooltip, ConfirmDialog">
        <div className="flex gap-4">
          <Tooltip label="Fast Travel">
            <PixelButton variant="ghost" aria-label="Fast Travel">
              <Icon name="map" />
            </PixelButton>
          </Tooltip>
          <PixelButton variant="danger" onClick={() => setConfirmOpen(true)}>
            Reset Progress
          </PixelButton>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => undefined}
          tone="danger"
          title="Delete all progress?"
          message="Your XP, badges and quest notes will be gone. This cannot be undone."
          confirmLabel="Delete Progress"
        />
      </Section>

      <Section title="EmptyState, ErrorState">
        <div className="grid gap-8 md:grid-cols-2">
          <PixelFrame>
            <EmptyState
              illustration="log"
              title="A new adventure begins"
              description="Visit the buildings in town to fill this log."
              action={{ label: 'Open Fast Travel', onClick: () => undefined }}
            />
          </PixelFrame>
          <PixelFrame>
            <ErrorState
              illustration="alert"
              title="Part of the town failed to load"
              description="Check your connection and try again."
              action={{ label: 'Try Again', onClick: () => undefined }}
            />
          </PixelFrame>
        </div>
      </Section>

      <ToastViewport
        className="static"
        onDismiss={() => undefined}
        toasts={[
          { id: 1, kind: 'achievement', title: 'New badge: Town Explorer' },
          {
            id: 2,
            kind: 'error',
            title: 'The letter could not be sent',
            description: 'Your message is still safe here.',
          },
        ]}
      />
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-ui text-ui-lg font-semibold text-gold-400">{title}</h2>
      {children}
    </section>
  );
}
