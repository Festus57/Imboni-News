import { useEffect, useState, useRef } from 'react';
import { getActiveAds, trackImpression, trackClick } from '../../services/adService.js';

function getYTId(url = '') {
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
  if (url.includes('v='))        return url.split('v=')[1].split('&')[0];
  if (url.includes('/embed/'))   return url.split('/embed/')[1].split('?')[0];
  return '';
}

// Detect ad type from stored data
function detectAdType(ad) {
  if (ad.adType) return ad.adType;             // explicit field
  if (ad.videoUrl) return 'video';
  if (ad.imageUrl) return 'image';
  if (ad.adContent) return 'content';
  return 'image';
}

// ─── Single Ad Display ────────────────────────────────────────────────────────
function AdDisplay({ ad, onClick }) {
  const type  = detectAdType(ad);
  const ytId  = type === 'video' ? getYTId(ad.videoUrl || '') : '';
  const isMp4 = type === 'video' && !ytId && !!ad.videoUrl;

  if (type === 'video') {
    return (
      <div className="relative w-full bg-black overflow-hidden rounded-xl">
        {/* Clickable overlay for tracking — video plays underneath */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={onClick} aria-label={ad.name} />

        {ytId ? (
          // YouTube: autoplay, muted (required by browsers), no controls for faster load
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
              className="absolute top-0 left-0 w-full h-full"
              allow="autoplay; encrypted-media"
              title={ad.name}
            />
          </div>
        ) : isMp4 ? (
          // MP4: autoplay, muted, loop, no controls
          <video
            src={ad.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full block"
            style={{ maxHeight: '220px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : null}

        {/* Name + sponsor overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-4 py-2 flex items-center justify-between pointer-events-none">
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{ad.name}</p>
            {ad.advertiser?.companyName && (
              <p className="text-white/70 text-xs">{ad.advertiser.companyName}</p>
            )}
          </div>
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
            Sponsored
          </span>
        </div>
      </div>
    );
  }

  if (type === 'content') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left block rounded-xl overflow-hidden"
        aria-label={ad.name}
      >
        <div className="bg-gradient-to-br from-secondary to-gray-800 text-white px-6 py-6 min-h-24 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base mb-2">{ad.name}</p>
              {ad.adContent && (
                <p className="text-white/80 text-sm leading-relaxed line-clamp-3">{ad.adContent}</p>
              )}
              {ad.advertiser?.companyName && (
                <p className="text-white/50 text-xs mt-2">{ad.advertiser.companyName}</p>
              )}
            </div>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full border border-white/30 flex-shrink-0">
              Sponsored
            </span>
          </div>
          {ad.destinationUrl && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                Reba Byinshi →
              </span>
            </div>
          )}
        </div>
      </button>
    );
  }

  // Default: image
  return (
    <div
      onClick={onClick}
      className="w-full rounded-xl overflow-hidden cursor-pointer relative"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      aria-label={ad.name}
    >
      {/* Fixed height container so the image always takes space */}
      <div className="relative w-full bg-gray-200" style={{ minHeight: '160px' }}>
        <img
          src={ad.imageUrl}
          alt={ad.altText || ad.name}
          className="w-full h-full object-cover"
          style={{ display: 'block', minHeight: '160px', maxHeight: '240px', width: '100%' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
          <div>
            <p className="text-white font-semibold text-sm leading-tight drop-shadow">{ad.name}</p>
            {ad.advertiser?.companyName && (
              <p className="text-white/80 text-xs drop-shadow">{ad.advertiser.companyName}</p>
            )}
          </div>
          <span className="bg-black/40 text-white text-xs px-2 py-0.5 rounded-full border border-white/30 flex-shrink-0">
            Sponsored
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdBanner ────────────────────────────────────────────────────────────
export default function AdBanner({ placement = 'top_banner' }) {
  const [ads,     setAds]     = useState([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setVisible(true);
    setCurrent(0);
    getActiveAds(placement)
      .then((res) => {
        const campaigns = res.data?.data?.campaigns || [];
        setAds(campaigns);
        if (campaigns.length) trackImpression(campaigns[0]._id).catch(() => {});
      })
      .catch(() => {});
  }, [placement]);

  useEffect(() => {
    if (ads.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % ads.length;
        trackImpression(ads[next]._id).catch(() => {});
        return next;
      });
    }, 60000); // slide every 1 minute
    return () => clearInterval(timerRef.current);
  }, [ads]);

  if (!ads.length || !visible) return null;

  const ad = ads[current];
  if (!ad) return null;

  const handleClick = () => {
    trackClick(ad._id).catch(() => {});
    if (ad.destinationUrl) window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full my-3 relative group">
      <AdDisplay ad={ad} onClick={handleClick} />

      {/* Slide dots */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); trackImpression(ads[i]._id).catch(() => {}); }}
              className={`rounded-full transition-all ${
                i === current ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Itangazo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false); }}
        className="absolute top-1.5 right-1.5 bg-black/40 hover:bg-black/60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
        aria-label="Funga itangazo"
      >
        ✕
      </button>
    </div>
  );
}
