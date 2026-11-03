import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiPlay, FiEye, FiCalendar, FiYoutube } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../components/common/Loader.jsx';
import Pagination from '../components/common/Pagination.jsx';
import AdBanner from '../components/ads/AdBanner.jsx';
import { getVideos } from '../services/videoService.js';

const VIDEO_TYPES = [
  { value: '', label: 'Byose', emoji: '🎬' },
  { value: 'news_report', label: 'Raporo', emoji: '📰' },
  { value: 'interview', label: 'Ibibazo', emoji: '🎤' },
  { value: 'sports_highlight', label: 'Imikino', emoji: '⚽' },
  { value: 'documentary', label: 'Documentary', emoji: '🎥' },
  { value: 'live_replay', label: 'Live Replay', emoji: '📡' },
];

function VideoCard({ video }) {
  const isYT = video.videoUrl?.includes('youtube') || video.videoUrl?.includes('youtu.be');

  // Auto-generate YouTube thumbnail if no custom thumbnail
  const thumb = video.thumbnailUrl || (isYT ? getYTThumb(video.videoUrl) : null);

  return (
    <Link to={`/imboni-tv/${video.slug}`} className="card group block overflow-hidden p-0">
      {/* Thumbnail — 16:9 */}
      <div className="relative bg-gray-900 overflow-hidden" style={{ paddingTop: '56.25%' }}>
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800">
            <FiPlay className="text-gray-500" size={36} />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="bg-primary/90 rounded-full p-3 shadow-lg">
            <FiPlay className="text-white" size={22} />
          </div>
        </div>

        {/* Badges */}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">
          {video.type?.replace(/_/g, ' ')}
        </span>
        {isYT && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <FiYoutube size={11} /> YT
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {video.category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {video.category.nameKiny}
          </span>
        )}
        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary line-clamp-2 mt-0.5 transition-colors leading-snug">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
          {video.uploadedBy && <span>{video.uploadedBy.name}</span>}
          <span className="flex items-center gap-1">
            <FiEye size={11} /> {(video.views || 0).toLocaleString()}
          </span>
          {video.publishedAt && (
            <span className="flex items-center gap-1">
              <FiCalendar size={11} />
              {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function getYTThumb(url) {
  try {
    let id = '';
    if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('v=')) id = url.split('v=')[1].split('&')[0];
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
  } catch { return ''; }
}

export default function ImboniTV() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    // Exclude shorts — ImboniTV shows full videos only
    getVideos({ type: type || undefined, page, limit: 12 })
      .then((res) => {
        // Filter out shorts on client side
        const all = res.data.data.videos || [];
        setVideos(all.filter((v) => !v.isShort));
        setPagination(res.data.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, page]);

  return (
    <>
      <Helmet>
        <title>Imboni TV — Amakuru ya Video | Imboni News</title>
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-gray-900 text-white rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🎬 Imboni TV</h1>
          <p className="text-gray-300 text-sm mt-0.5">Raporo, ibibazo, imikino, documentaries n'ibindi</p>
        </div>
        <div className="flex gap-2">
          <Link to="/shorts" className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-xs font-semibold">
            📱 Shorts
          </Link>
          <Link to="/live" className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-xs font-semibold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE TV
          </Link>
        </div>
      </div>

      <AdBanner placement="top_banner" />

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {VIDEO_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setType(t.value); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              type === t.value ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">📹</div>
          <p className="font-medium">Nta videos zihari muri iyi kategori.</p>
          <p className="text-sm mt-1 text-gray-400">Subira ejo cyangwa hitamo ikindi icyiciro.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
          <Pagination
            page={page}
            pages={pagination.pages || 1}
            onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
          />
        </>
      )}
    </>
  );
}
