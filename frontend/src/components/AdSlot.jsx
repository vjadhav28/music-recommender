import React, { useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;

/**
 * Google AdSense ad slot.
 *
 * Required env vars (set in Vercel → Project → Environment Variables):
 *   VITE_ADSENSE_CLIENT_ID = ca-pub-XXXXXXXXXXXXXXXX
 *   VITE_ADSENSE_SLOT_INLINE = your numeric slot id (optional per slot)
 *
 * Pass `slot` as a prop to override per placement.
 */
export default function AdSlot({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  responsive = true,
  className = '',
  style,
  label = 'Sponsored',
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || !slot) return;
    if (pushedRef.current) return;
    if (typeof window === 'undefined') return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (err) {
      console.log('[v0] adsense push failed:', err?.message);
    }
  }, [slot]);

  // In dev or when not configured, render a clearly-labeled placeholder so
  // layout is preserved without violating AdSense policy in production.
  if (!CLIENT_ID || !slot) {
    return (
      <aside className={`ad-slot ad-slot--placeholder ${className}`} aria-label="Ad placeholder" style={style}>
        <span className="ad-slot-label">Ad space</span>
        <span className="ad-slot-hint">Set VITE_ADSENSE_CLIENT_ID and slot id to enable</span>
      </aside>
    );
  }

  return (
    <aside className={`ad-slot ${className}`} aria-label={label} style={style}>
      <span className="ad-slot-label">{label}</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </aside>
  );
}
