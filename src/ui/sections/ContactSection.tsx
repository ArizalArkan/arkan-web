import { copy } from '@/content/copy';
import type { Profile } from '@/content/schema';
import { Icon } from '../primitives/Icon';
import { PixelButton } from '../primitives/PixelButton';
import { ContactForm } from './ContactForm';
import { Heading } from './Heading';
import type { HeadingLevel } from './headingLevel';

type ContactSectionProps = {
  profile: Profile;
  headingLevel: HeadingLevel;
  send: Parameters<typeof ContactForm>[0]['send'];
  lastSentAt: () => number | null;
  onSent?: () => void;
  onCvDownload?: () => void;
  onLinkOpen?: () => void;
};

/** Post Office: the letter form, direct contacts and the CV. */
export function ContactSection({
  profile,
  headingLevel,
  send,
  lastSentAt,
  onSent,
  onCvDownload,
  onLinkOpen,
}: ContactSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-prose font-body text-body-md">{copy.contact.intro}</p>

      <ContactForm
        email={profile.email}
        send={send}
        lastSentAt={lastSentAt}
        onSent={onSent}
        headingLevel={headingLevel}
      />

      <section className="flex flex-col gap-3">
        <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold">
          {copy.contact.otherWays}
        </Heading>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 font-ui text-ui-md">
          <dt className="flex items-center gap-2 opacity-80">
            <Icon name="letter" />
            {copy.contact.emailLabelShort}
          </dt>
          <dd>
            <a
              href={`mailto:${profile.email}`}
              className="font-semibold break-all underline decoration-2 underline-offset-2"
            >
              {profile.email}
            </a>
          </dd>
          <dt className="flex items-center gap-2 opacity-80">
            <Icon name="phone" />
            {copy.contact.phoneLabelShort}
          </dt>
          <dd>
            <a
              href={profile.phone.href}
              className="font-semibold underline decoration-2 underline-offset-2"
            >
              {profile.phone.label}
            </a>
          </dd>
        </dl>
        <div className="flex flex-wrap gap-3">
          {profile.links.map((link) => (
            <PixelButton
              key={link.id}
              href={link.href}
              variant="secondary"
              iconLeft="link"
              onClick={onLinkOpen}
            >
              {link.label}
            </PixelButton>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start gap-3">
        <Heading level={headingLevel} className="font-ui text-ui-lg font-semibold">
          {copy.actions.downloadCv}
        </Heading>
        {profile.cv ? (
          <PixelButton
            href={profile.cv.href}
            download={profile.cv.fileName}
            iconLeft="download"
            onClick={onCvDownload}
            variant="secondary"
          >
            {copy.actions.downloadCv}
          </PixelButton>
        ) : (
          <>
            {/* TODO(owner): add public/cv.pdf and set profile.cv; until then, print. */}
            <p className="font-body text-body-sm opacity-85">{copy.contact.cvMissing}</p>
            <PixelButton variant="secondary" iconLeft="print" onClick={() => window.print()}>
              {copy.actions.printCv}
            </PixelButton>
          </>
        )}
      </section>
    </div>
  );
}
