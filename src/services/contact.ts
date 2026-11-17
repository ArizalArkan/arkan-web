// Contact delivery (ARCHITECTURE.md §8). Returns a Result, never throws.

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  /** Hidden field. Bots fill it, people do not. */
  honeypot: string;
};

export type ContactError = 'network' | 'validation' | 'rate-limit' | 'server' | 'not-configured';
export type ContactResult = { ok: true } | { ok: false; error: ContactError };

export const TIMEOUT_MS = 10_000;

type Deps = {
  endpoint: string | undefined;
  fetchImpl: typeof fetch;
  now: () => number;
  rateLimitMs: number;
};

export const createContactService = ({ endpoint, fetchImpl, now, rateLimitMs }: Deps) => {
  let lastSentAt: number | null = null;

  return {
    get lastSentAt() {
      return lastSentAt;
    },

    async send(payload: ContactPayload): Promise<ContactResult> {
      // Pretend success so a bot learns nothing, and send nothing.
      if (payload.honeypot.trim() !== '') return { ok: true };
      if (lastSentAt !== null && now() - lastSentAt < rateLimitMs) {
        return { ok: false, error: 'rate-limit' };
      }
      if (!endpoint) return { ok: false, error: 'not-configured' };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: payload.name.trim(),
            email: payload.email.trim(),
            message: payload.message.trim(),
          }),
          signal: controller.signal,
        });
        if (response.status === 422 || response.status === 400) {
          return { ok: false, error: 'validation' };
        }
        if (response.status === 429) return { ok: false, error: 'rate-limit' };
        if (!response.ok) return { ok: false, error: 'server' };
        lastSentAt = now();
        return { ok: true };
      } catch (error) {
        // An abort is our 10 s timeout: treat it as the server not answering.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return { ok: false, error: 'server' };
        }
        return { ok: false, error: 'network' };
      } finally {
        clearTimeout(timer);
      }
    },
  };
};

export const contactService = createContactService({
  endpoint: import.meta.env.VITE_CONTACT_ENDPOINT || undefined,
  fetchImpl: (...args) => fetch(...args),
  now: () => Date.now(),
  rateLimitMs: 30_000,
});
