// Cookie-free analytics (PRODUCT.md §9, ARCHITECTURE.md §8). No-op when the
// endpoint is unset or the visitor sends Do-Not-Track. Never throws.

export type AnalyticsEvent =
  | 'mode_selected'
  | 'location_visited'
  | 'quest_opened'
  | 'external_link_clicked'
  | 'cv_downloaded'
  | 'contact_submitted'
  | 'achievement_unlocked'
  | 'quality_tier_set';

type Props = Record<string, string | number | boolean>;

type Deps = {
  endpoint: string | undefined;
  doNotTrack: () => boolean;
  send: (url: string, body: string) => void;
};

export const createAnalytics = ({ endpoint, doNotTrack, send }: Deps) => ({
  isEnabled: () => Boolean(endpoint) && !doNotTrack(),
  track(event: AnalyticsEvent, props: Props = {}) {
    if (!endpoint || doNotTrack()) return;
    try {
      send(endpoint, JSON.stringify({ event, props, at: new Date().toISOString() }));
    } catch {
      // Analytics must never break the page.
    }
  },
});

export const analytics = createAnalytics({
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || undefined,
  doNotTrack: () =>
    typeof navigator !== 'undefined' &&
    (navigator.doNotTrack === '1' ||
      (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl === true),
  send: (url, body) => {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    }
  },
});
