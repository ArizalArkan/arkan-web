import { describe, expect, it, vi } from 'vitest';
import { createAnalytics } from './analytics';
import { createContactService, type ContactPayload } from './contact';
import { createSaveService, defaultSave, migrate, SAVE_KEY } from './save';

const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  };
};

describe('save service', () => {
  it('round-trips a save', () => {
    const storage = memoryStorage();
    const service = createSaveService(() => storage);
    const data = { ...defaultSave(), visited: ['armory'], xp: 50 };
    expect(service.save(data)).toBe(true);
    expect(service.load()).toEqual(data);
  });

  it('returns defaults for invalid JSON or a wrong shape', () => {
    const storage = memoryStorage();
    const service = createSaveService(() => storage);
    storage.setItem(SAVE_KEY, '{nope');
    expect(service.load()).toEqual(defaultSave());
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, visited: 'armory', settings: 7 }));
    expect(service.load()).toMatchObject({ visited: [], settings: defaultSave().settings });
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 99 }));
    expect(service.load()).toEqual(defaultSave());
  });

  it('migrates a v0 save to v1', () => {
    const v0 = {
      xp: 80,
      visited: ['armory'],
      questsRead: ['bank-saqu'],
      achievements: [],
      collectibles: [],
      npcsMet: [],
    };
    expect(migrate(v0)).toMatchObject({
      version: 1,
      epoch: 0,
      visited: ['armory'],
      linksOpened: [],
      contactSent: false,
    });
  });

  it('keeps working when storage throws (private mode, full quota)', () => {
    const throwing = createSaveService(() => {
      throw new Error('SecurityError');
    });
    expect(throwing.isAvailable).toBe(false);
    expect(throwing.load()).toEqual(defaultSave());
    expect(throwing.save(defaultSave())).toBe(false);

    const storage = memoryStorage();
    const service = createSaveService(() => storage);
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(service.save(defaultSave())).toBe(false);
  });

  it('parses saves from other tabs and rejects junk', () => {
    const service = createSaveService(() => memoryStorage());
    expect(service.parseExternal(null)).toBeNull();
    expect(service.parseExternal('x')).toBeNull();
    expect(service.parseExternal(JSON.stringify(defaultSave()))).toEqual(defaultSave());
  });

  it('stores no personal data fields', () => {
    expect(Object.keys(defaultSave()).sort()).toEqual([
      'achievements',
      'collectibles',
      'contactSent',
      'epoch',
      'linksOpened',
      'npcsMet',
      'questsRead',
      'settings',
      'version',
      'visited',
      'xp',
    ]);
  });
});

describe('contact service', () => {
  const payload: ContactPayload = {
    name: 'Rina',
    email: 'rina@example.com',
    message: 'Hello there, Arkan!',
    honeypot: '',
  };

  const setup = (
    response: Partial<Response> | Error,
    // null = no endpoint configured (a default parameter would swallow undefined).
    endpointOrNull: string | null = 'https://form.test/send',
  ) => {
    const endpoint = endpointOrNull ?? undefined;
    let clock = 0;
    const fetchImpl = vi.fn(async () => {
      if (response instanceof Error || response instanceof DOMException) throw response;
      return { ok: true, status: 200, ...response } as Response;
    });
    const service = createContactService({
      endpoint,
      fetchImpl,
      now: () => clock,
      rateLimitMs: 30_000,
    });
    return { service, fetchImpl, tick: (ms: number) => (clock += ms) };
  };

  it('posts trimmed JSON and succeeds', async () => {
    const { service, fetchImpl } = setup({ ok: true, status: 200 });
    await expect(service.send({ ...payload, name: '  Rina ' })).resolves.toEqual({ ok: true });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Rina',
      email: payload.email,
      message: payload.message,
    });
  });

  it('silently accepts honeypot submissions without sending', async () => {
    const { service, fetchImpl } = setup({ ok: true });
    await expect(service.send({ ...payload, honeypot: 'bot' })).resolves.toEqual({ ok: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rate limits to one send per 30 s', async () => {
    const { service, tick } = setup({ ok: true, status: 200 });
    await service.send(payload);
    tick(10_000);
    await expect(service.send(payload)).resolves.toEqual({ ok: false, error: 'rate-limit' });
    tick(20_000);
    await expect(service.send(payload)).resolves.toEqual({ ok: true });
  });

  it.each([
    [{ ok: false, status: 500 }, 'server'],
    [{ ok: false, status: 422 }, 'validation'],
    [{ ok: false, status: 429 }, 'rate-limit'],
    [new TypeError('Failed to fetch'), 'network'],
    [new DOMException('aborted', 'AbortError'), 'server'],
  ])('maps %o to %s', async (response, error) => {
    const { service } = setup(response as Partial<Response> | Error);
    await expect(service.send(payload)).resolves.toEqual({ ok: false, error });
  });

  it('reports not-configured when no endpoint is set', async () => {
    const { service } = setup({ ok: true }, null);
    await expect(service.send(payload)).resolves.toEqual({ ok: false, error: 'not-configured' });
  });

  it('aborts after 10 s', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const service = createContactService({
      endpoint: 'https://x.test',
      fetchImpl,
      now: () => 0,
      rateLimitMs: 0,
    });
    const pending = service.send(payload);
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(pending).resolves.toEqual({ ok: false, error: 'server' });
    vi.useRealTimers();
  });
});

describe('analytics', () => {
  it('is a no-op without an endpoint or with Do-Not-Track', () => {
    const send = vi.fn();
    createAnalytics({ endpoint: undefined, doNotTrack: () => false, send }).track('cv_downloaded');
    createAnalytics({ endpoint: 'https://a.test', doNotTrack: () => true, send }).track(
      'cv_downloaded',
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('sends events and never throws', () => {
    const send = vi.fn();
    const tracker = createAnalytics({ endpoint: 'https://a.test', doNotTrack: () => false, send });
    expect(tracker.isEnabled()).toBe(true);
    tracker.track('mode_selected', { mode: 'quick' });
    expect(JSON.parse(send.mock.calls[0]?.[1] as string)).toMatchObject({
      event: 'mode_selected',
      props: { mode: 'quick' },
    });
    const broken = createAnalytics({
      endpoint: 'https://a.test',
      doNotTrack: () => false,
      send: () => {
        throw new Error('boom');
      },
    });
    expect(() => broken.track('quest_opened')).not.toThrow();
  });
});
