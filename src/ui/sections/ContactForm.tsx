import { useEffect, useRef, useState, type FormEvent } from 'react';
import { copy, fill } from '@/content/copy';
import {
  LIMITS,
  secondsUntilAllowed,
  validateContact,
  validateField,
  type ContactErrors,
  type ContactField,
  type ContactFields,
} from '@/game/rules/contactForm';
import type { ContactError } from '@/services/contact';
import { FormField } from '../patterns/FormField';
import { TextArea } from '../patterns/TextArea';
import { TextInput } from '../patterns/TextInput';
import { Icon } from '../primitives/Icon';
import { PixelButton } from '../primitives/PixelButton';
import { Heading } from './Heading';
import type { HeadingLevel } from './headingLevel';

const DRAFT_KEY = 'arkan-journey:contact-draft';
const EMPTY: ContactFields = { name: '', email: '', message: '' };

type SendResult = { ok: true } | { ok: false; error: ContactError };

type ContactFormProps = {
  email: string;
  send: (payload: ContactFields & { honeypot: string }) => Promise<SendResult>;
  /** When the last letter left, for the 30 s client-side limit. */
  lastSentAt: () => number | null;
  onSent?: () => void;
  headingLevel: HeadingLevel;
};

const readDraft = (): ContactFields => {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ContactFields>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      message: typeof parsed.message === 'string' ? parsed.message : '',
    };
  } catch {
    return EMPTY;
  }
};

const writeDraft = (fields: ContactFields | null) => {
  try {
    if (fields) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
    else window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // A draft is a convenience; losing it must never break the form.
  }
};

/**
 * Contact form (UX-GUIDELINES.md §6): validate on first blur, then live once
 * a field has an error, everything on submit. Input is never lost: a draft
 * lives in sessionStorage and failures keep the text in place.
 */
export function ContactForm({ email, send, lastSentAt, onSent, headingLevel }: ContactFormProps) {
  const [fields, setFields] = useState<ContactFields>(readDraft);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [failure, setFailure] = useState<ContactError | null>(null);
  const [wait, setWait] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const refs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>(
    {},
  );
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status !== 'sent') writeDraft(fields);
  }, [fields, status]);

  // Countdown on the button while the rate limit holds.
  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = window.setTimeout(
      () => setWait(secondsUntilAllowed(lastSentAt(), Date.now())),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [wait, lastSentAt]);

  useEffect(() => {
    if (status === 'sent') successRef.current?.focus();
  }, [status]);

  const update = (field: ContactField, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    // Re-check while typing only after the field has shown an error.
    if (errors[field])
      setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  };

  const blur = (field: ContactField) => {
    if (touched[field]) return;
    setTouched((current) => ({ ...current, [field]: true }));
    // An empty field the visitor merely tabbed through is not an error yet.
    if (fields[field].trim() === '') return;
    setErrors((current) => ({ ...current, [field]: validateField(field, fields[field]) }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    const found = validateContact(fields);
    setErrors(found);
    const firstInvalid = (['name', 'email', 'message'] as const).find((field) => found[field]);
    if (firstInvalid) {
      setAnnouncement(copy.contact.errors.summary);
      refs.current[firstInvalid]?.focus();
      return;
    }
    const seconds = secondsUntilAllowed(lastSentAt(), Date.now());
    if (seconds > 0) {
      setFailure('rate-limit');
      setWait(seconds);
      return;
    }

    setStatus('sending');
    setFailure(null);
    const result = await send({ ...fields, honeypot });
    if (result.ok) {
      writeDraft(null);
      setFields(EMPTY);
      setTouched({});
      setStatus('sent');
      setAnnouncement(copy.contact.successTitle);
      onSent?.();
      return;
    }
    setStatus('idle');
    setFailure(result.error);
    setAnnouncement(failureText(result.error, 30));
    if (result.error === 'rate-limit') setWait(secondsUntilAllowed(lastSentAt(), Date.now()) || 30);
  };

  const mailto = `mailto:${email}?subject=${encodeURIComponent(copy.contact.mailSubject)}&body=${encodeURIComponent(fields.message)}`;

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-3" role="status">
        <Heading
          level={headingLevel}
          ref={successRef}
          tabIndex={-1}
          className="flex items-center gap-2 font-ui text-ui-lg font-semibold outline-none"
        >
          <Icon name="check" size={2} />
          {copy.contact.successTitle}
        </Heading>
        <p className="font-body text-body-md">{copy.contact.successBody}</p>
        <PixelButton variant="secondary" onClick={() => setStatus('idle')}>
          {copy.actions.sendAnother}
        </PixelButton>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex flex-col gap-4"
      aria-describedby="contact-status"
    >
      <FormField label={copy.contact.nameLabel} error={errors.name} required>
        <TextInput
          ref={(node) => {
            refs.current.name = node;
          }}
          name="name"
          autoComplete="name"
          maxLength={LIMITS.nameMax + 20}
          value={fields.name}
          onChange={(event) => update('name', event.target.value)}
          onBlur={() => blur('name')}
        />
      </FormField>
      <FormField label={copy.contact.emailLabel} error={errors.email} required>
        <TextInput
          ref={(node) => {
            refs.current.email = node;
          }}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={fields.email}
          onChange={(event) => update('email', event.target.value)}
          onBlur={() => blur('email')}
        />
      </FormField>
      <FormField
        label={copy.contact.messageLabel}
        hint={copy.contact.messageHint}
        error={errors.message}
        required
      >
        <TextArea
          ref={(node) => {
            refs.current.message = node;
          }}
          name="message"
          maxCount={LIMITS.messageMax}
          value={fields.message}
          onChange={(event) => update('message', event.target.value)}
          onBlur={() => blur('message')}
        />
      </FormField>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {copy.contact.honeypotLabel}
          <input
            tabIndex={-1}
            autoComplete="off"
            name="company"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
      </div>

      {failure ? (
        <div role="alert" className="flex flex-col gap-2 font-ui text-ui-md">
          <p className="flex items-start gap-2 text-hp-700">
            <Icon name="alert" className="mt-1" />
            {failureText(failure, wait)}
          </p>
          {failure !== 'rate-limit' ? (
            <a
              href={mailto}
              className="w-fit font-semibold underline decoration-2 underline-offset-2"
            >
              {copy.actions.emailInstead}
            </a>
          ) : null}
        </div>
      ) : null}

      <p id="contact-status" className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div>
        <PixelButton
          type="submit"
          isLoading={status === 'sending'}
          iconLeft="letter"
          disabled={wait > 0}
        >
          {wait > 0
            ? fill(copy.contact.rateLimit, { seconds: wait })
            : failure && failure !== 'rate-limit'
              ? copy.actions.resend
              : copy.actions.sendLetter}
        </PixelButton>
      </div>
    </form>
  );
}

const failureText = (error: ContactError, seconds: number) => {
  switch (error) {
    case 'network':
      return copy.contact.network;
    case 'rate-limit':
      return fill(copy.contact.rateLimit, { seconds });
    case 'not-configured':
      return copy.contact.noEndpoint;
    case 'validation':
      return copy.contact.errors.summary;
    case 'server':
      return copy.contact.server;
  }
};
