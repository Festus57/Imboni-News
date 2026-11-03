import { Link } from 'react-router-dom';
import { FiPlay, FiEye, FiYoutube } from 'react-icons/fi';

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Auto-generate YouTube thumbnail from URL when no custom thumbnail is set
function getYTThumb(url) {
  if (!url) return null;
  try {
    let id = '';
    if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('v=')) id = url.split('v=')[1].split('&')[0];
    else if (url.includes('/embed/')) id = url.split('/embed/')[1].split('?')[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch { return null; }
}

export default function VideoCard({ video }) {
  if (!video) return null;

  const isYT = video.videoUrl?.includes('youtube') || video.videoUrl?.includes('youtu.be');
  const thumb = video.thumbnailUrl || (isYT ? getYTThumb(video.videoUrl) : null);

  return (
    <Link to={`/imboni-tv/${video.slug}`} className="card group block p-0 overflow-hidden">
      {/* Thumbnail — 16:9 aspect */}
      <div className="relative overflow-hidden bg-gray-900" style={{ paddingTop: '56.25%' }}>
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 text-4xl">
            🎬
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <div className="bg-primary/90 rounded-full p-3 shadow-lg">
            <FiPlay className="text-white" size={20} />
          </div>
        </div>

        {/* YouTube badge */}
        {isYT && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
            <FiYoutube size={11} /> YT
          </span>
        )}

        {/* Short badge */}
        {video.isShort && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            SHORT
          </span>
        )}

        {/* Duration */}
        {video.duration > 0 && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Type badge */}
        {video.type && !video.isShort && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">
            {video.type.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {video.category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide block mb-0.5">
            {video.category.nameKiny}
          </span>
        )}
        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-primary line-clamp-2 transition-colors leading-snug">
          {video.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
          {video.uploadedBy && <span>{video.uploadedBy.name}</span>}
          <span className="flex items-center gap-1">
            <FiEye size={11} /> {(video.views || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
