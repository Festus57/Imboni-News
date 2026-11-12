import { useEffect, useState } from 'react';
import { getActiveAds, trackImpression, trackClick } from '../../services/adService.js';

export default function SidebarAd() {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    getActiveAds('sidebar')
      .then((res) => {
        const ads = res.data?.data?.campaigns || [];
        if (ads.length) {
          const picked = ads[Math.floor(Math.random() * ads.length)];
          setAd(picked);
          trackImpression(picked._id).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  if (!ad || !visible) return null;

  return (
    <div className="relative group mb-4">
      <p className="text-xs text-gray-400 mb-1">Itangazo</p>
      <button
        onClick={() => {
          trackClick(ad._id).catch(() => {});
          if (ad.destinationUrl) window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
        }}
        className="block w-full rounded-lg overflow-hidden hover:opacity-90 transition-opacity shadow-sm border border-gray-100"
        aria-label={ad.altText || ad.name || 'Itangazo'}
      >
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.altText || ad.name || 'Itangazo'}
            className="w-full block"
            style={{ height: '280px', objectFit: 'cover', width: '100%' }}
          />
        ) : (
          <div className="bg-gradient-to-b from-secondary to-accent text-white text-center py-8 px-4 flex flex-col items-center gap-2 rounded-lg">
            <span className="text-3xl">📢</span>
            <p className="font-bold text-sm">{ad.name}</p>
          </div>
        )}
      </button>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-5 right-1 bg-black/30 hover:bg-black/50 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
