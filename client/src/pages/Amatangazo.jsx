import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import { FiX, FiImage, FiVideo, FiFileText, FiExternalLink } from 'react-icons/fi';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';

function getYTId(url = '') {
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
  if (url.includes('v='))        return url.split('v=')[1].split('&')[0];
  return '';
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function AnnouncementModal({ item, onClose }) {
  const ytId = getYTId(item.videoUrl || '');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 leading-snug">{item.title}</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 flex-shrink-0 mt-0.5">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image */}
          {item.imageUrl && (
            <div>
              <img src={item.imageUrl} alt={item.title}
                className="w-full rounded-xl object-cover max-h-72 border"
                onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}

          {/* Video */}
          {item.videoUrl && (
            <div>
              {ytId ? (
                <div className="aspect-video rounded-xl overflow-hidden border">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={item.title}
                  />
                </div>
              ) : (
                <video src={item.videoUrl} controls autoPlay
                  className="w-full rounded-xl bg-black max-h-72"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
          )}

          {/* Content */}
          {item.content && (
            <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-line">
              {item.content}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-400 flex-wrap gap-2">
            <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            <button onClick={onClose}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg font-medium transition-colors">
              Funga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ad Card ──────────────────────────────────────────────────────────────────
function AnnouncementCard({ item, onClick }) {
  const hasImage   = !!item.imageUrl;
  const hasVideo   = !!item.videoUrl;
  const hasContent = !!item.content;
  const ytId       = getYTId(item.videoUrl || '');
  const ytThumb    = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

  // Decide thumbnail to show on card
  const thumb = hasImage ? item.imageUrl : ytThumb;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left overflow-hidden group w-full"
    >
      {/* Thumbnail */}
      {thumb ? (
        <div className="relative overflow-hidden h-44 bg-gray-100">
          <img src={thumb} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }} />
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                <span className="text-white text-xl ml-1">▶</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
          {hasVideo   && <FiVideo size={40} className="text-primary/40" />}
          {hasContent && !hasVideo && <FiFileText size={40} className="text-secondary/40" />}
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
          {item.title}
        </h3>

        {/* Type badges */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {hasImage   && <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"><FiImage size={10}/> Ifoto</span>}
          {hasVideo   && <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full"><FiVideo size={10}/> Video</span>}
          {hasContent && <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full"><FiFileText size={10}/> Inyandiko</span>}
        </div>

        {/* Content preview */}
        {hasContent && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.content}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
          <span className="text-xs font-semibold text-primary group-hover:underline">
            Soma Byose →
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Amatangazo() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(null); // open modal

  useEffect(() => {
    api.get('/announcements')
      .then((res) => setItems(res.data.data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Amatangazo — Imboni News</title></Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary to-gray-800 text-white rounded-xl px-6 py-8 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">📢 Amatangazo</h1>
        <p className="text-gray-300 text-sm max-w-xl">
          Amatangazo yose abonetse kuri Imboni News — reba ifoto, video na ubutumwa.
        </p>
        {items.length > 0 && (
          <p className="text-white/50 text-xs mt-2">{items.length} matangazo</p>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p className="font-semibold text-lg text-gray-600">Nta matangazo abonetse ubu</p>
          <p className="text-sm mt-1">
            Subira ejo cyangwa{' '}
            <a href="/advertise" className="text-primary hover:underline font-medium">tangaza ubu</a>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <AnnouncementCard key={item._id} item={item} onClick={() => setActive(item)} />
          ))}
        </div>
      )}

      {/* CTA */}
      {!loading && (
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <p className="font-bold text-gray-900 text-lg mb-1">Wifuza Gutangaza kuri Imboni News?</p>
          <p className="text-gray-500 text-sm mb-4">Igera ku basomyi benshi bo mu Rwanda buri munsi.</p>
          <a href="/advertise"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
            <FiExternalLink size={15} /> Tangaza Ubu
          </a>
        </div>
      )}

      {/* Modal */}
      {active && (
        <AnnouncementModal item={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}
