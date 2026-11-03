import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlay, FiEye, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../components/common/Loader.jsx';
import { getShorts } from '../services/videoService.js';

// Get YouTube video ID
function getYTId(url) {
  if (!url) return '';
  try {
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
    if (url.includes('/embed/')) return url.split('/embed/')[1].split('?')[0];
    return '';
  } catch { return ''; }
}

function getYTThumb(url) {
  const id = getYTId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

function getYTEmbed(url) {
  const id = getYTId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : '';
}

function ShortCard({ video }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const isYT = video.videoUrl?.includes('youtube') || video.videoUrl?.includes('youtu.be');
  const ytEmbed = isYT ? getYTEmbed(video.videoUrl) : '';
  const thumb = video.thumbnailUrl || (isYT ? getYTThumb(video.videoUrl) : '');

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-gray-900 shadow-lg">
      {/* Video area — 9:16 vertical aspect ratio */}
      <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
        {/* Thumbnail / not playing */}
        {!playing && (
          <div className="absolute inset-0">
            {thumb ? (
              <img src={thumb} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 text-5xl">📱</div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Play button */}
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Kanda kugirango urebe"
            >
              <div className="bg-white/20 backdrop-blur-sm border-2 border-white/60 rounded-full p-5 group-hover:bg-white/30 transition-all group-hover:scale-110">
                <FiPlay className="text-white" size={28} />
              </div>
            </button>

            {/* Category badge */}
            {video.category && (
              <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium">
                {video.category.nameKiny}
              </span>
            )}
          </div>
        )}

        {/* Playing state */}
        {playing && (
          <div className="absolute inset-0 bg-black">
            {isYT && ytEmbed ? (
              <iframe
                src={ytEmbed}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : video.videoUrl ? (
              <video
                src={video.videoUrl}
                autoPlay
                controls
                muted={muted}
                className="w-full h-full object-cover"
                onError={() => setPlaying(false)}
              />
            ) : null}

            {/* Controls overlay for mp4 */}
            {!isYT && (
              <button
                onClick={() => setMuted(!muted)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full"
              >
                {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
            )}

            {/* Stop button */}
            <button
              onClick={() => setPlaying(false)}
              className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full"
            >
              ✕ Hagarara
            </button>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="p-3 bg-gray-900">
        <p className="text-white font-semibold text-sm line-clamp-2 leading-snug">{video.title}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{video.uploadedBy?.name || 'Imboni News'}</span>
          <span className="flex items-center gap-1">
            <FiEye size={11} /> {(video.views || 0).toLocaleString()}
          </span>
        </div>
        {video.publishedAt && (
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📱 Imboni Shorts</h1>
        <p className="text-gray-500 text-sm mt-1">Kanda video kugirango urebe — Amakuru make, ahunguka vuba</p>
      </div>

      {shorts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📱</div>
          <p className="text-lg font-semibold text-gray-700">Nta Shorts zihari ubu</p>
          <p className="text-sm text-gray-400 mt-1">Shorts zizashyirwa vuba. Subira ejo!</p>
        </div>
      ) : (
        <>
          {/* Responsive grid — 1 col mobile, 2 tablet, 3 desktop, 4 large */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {shorts.map((v) => (
              <ShortCard key={v._id} video={v} />
            ))}
          </div>

          {/* Info */}
          <p className="text-center text-xs text-gray-400 mt-8">
            {shorts.length} Short{shorts.length !== 1 ? 's' : ''} zibonetse
          </p>
        </>
      )}
    </>
  );
}
