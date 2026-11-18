import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlay, FiEye, FiX, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../components/common/Loader.jsx';
import { getShorts } from '../services/videoService.js';

function getYTId(url) {
  if (!url) return '';
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
  if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
  if (url.includes('/embed/')) return url.split('/embed/')[1].split('?')[0];
  return '';
}
function getYTThumb(url) { const id = getYTId(url); return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ''; }
function getYTEmbed(url) { const id = getYTId(url); return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : ''; }

// ─── Full-screen modal player ─────────────────────────────────────────────────
function ShortModal({ video, onClose }) {
  const [muted, setMuted] = useState(false);
  const isYT = video.videoUrl?.includes('youtube') || video.videoUrl?.includes('youtu.be');
  const ytEmbed = isYT ? getYTEmbed(video.videoUrl) : '';

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      {/* Close button */}
      <button onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full z-10">
        <FiX size={22} />
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 right-16 z-10">
        <p className="text-white font-semibold text-sm line-clamp-2">{video.title}</p>
        {video.category && (
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
            {video.category.nameKiny}
          </span>
        )}
      </div>

      {/* Player — 9:16 vertical, centered */}
      <div
        className="relative bg-black rounded-xl overflow-hidden"
        style={{ width: '100%', maxWidth: '400px', aspectRatio: '9/16', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {isYT && ytEmbed ? (
          <iframe src={ytEmbed} className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen title={video.title} />
        ) : video.videoUrl ? (
          <>
            <video src={video.videoUrl} autoPlay controls muted={muted}
              className="w-full h-full object-cover"
              onError={() => onClose()} />
            <button onClick={() => setMuted(!muted)}
              className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full">
              {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
            </button>
          </>
        ) : null}
      </div>

      {/* Stats */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/70 text-xs">
        <span className="flex items-center gap-1"><FiEye size={12} />{(video.views || 0).toLocaleString()}</span>
        {video.publishedAt && <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</span>}
      </div>
    </div>
  );
}

// ─── Compact Short Card ───────────────────────────────────────────────────────
function ShortCard({ video, onPlay }) {
  const isYT = video.videoUrl?.includes('youtube') || video.videoUrl?.includes('youtu.be');
  const thumb = video.thumbnailUrl || (isYT ? getYTThumb(video.videoUrl) : '');

  return (
    <button
      onClick={() => onPlay(video)}
      className="flex flex-col rounded-xl overflow-hidden bg-gray-900 shadow hover:shadow-lg transition-all group cursor-pointer w-full"
    >
      {/* Thumbnail — compact 9:16 */}
      <div className="relative w-full" style={{ paddingTop: '133%' }}>
        {thumb ? (
          <img src={thumb} alt={video.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-600 text-4xl">📱</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/30 backdrop-blur-sm rounded-full p-3">
            <FiPlay className="text-white" size={20} />
          </div>
        </div>
        {/* Category badge */}
        {video.category && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {video.category.nameKiny}
          </span>
        )}
        {/* Duration-style badge */}
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
          <FiPlay size={9} className="inline mr-0.5" />Short
        </span>
      </div>

      {/* Compact info */}
      <div className="p-2 bg-gray-900">
        <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{video.title}</p>
        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
          <FiEye size={9} /> {(video.views || 0).toLocaleString()}
        </p>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    getShorts()
      .then((res) => setShorts(res.data.data.shorts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <Helmet><title>Imboni Shorts — Amakuru Manini | Imboni News</title></Helmet>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📱 Imboni Shorts</h1>
        <p className="text-gray-500 text-xs mt-1">Kanda kugirango urebe — Amakuru make, ahunguka vuba</p>
      </div>

      {shorts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📱</div>
          <p className="font-semibold text-gray-700">Nta Shorts zihari ubu</p>
          <p className="text-sm text-gray-400 mt-1">Shorts zizashyirwa vuba. Subira ejo!</p>
        </div>
      ) : (
        <>
          {/* Compact grid — more columns, smaller cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {shorts.map((v) => (
              <ShortCard key={v._id} video={v} onPlay={setActiveVideo} />
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            {shorts.length} Short{shorts.length !== 1 ? 's' : ''} zibonetse
          </p>
        </>
      )}

      {/* Fullscreen modal */}
      {activeVideo && (
        <ShortModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </>
  );
}
