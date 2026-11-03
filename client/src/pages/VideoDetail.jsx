import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft, FiEye, FiCalendar, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/video/VideoPlayer.jsx';
import Loader from '../components/common/Loader.jsx';
import { getVideo, getVideos } from '../services/videoService.js';

export default function VideoDetail() {
  const { slug } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVideo(slug)
      .then((res) => {
        const v = res.data.data.video;
        setVideo(v);
        // Load related videos from same category
        return getVideos({ category: v.category?._id, limit: 4 });
      })
      .then((res) => {
        const all = res.data.data.videos;
        setRelated(all.filter((v) => v.slug !== slug).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: video?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Aderesi yakopejwe!');
    }
  };

  if (loading) return <Loader />;
  if (!video) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">🎬</div>
      <p className="text-gray-500">Video ntiboneka.</p>
      <Link to="/imboni-tv" className="btn-primary mt-4 inline-block">← Subira Imboni TV</Link>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{video.title} — Imboni TV</title>
        {video.thumbnailUrl && <meta property="og:image" content={video.thumbnailUrl} />}
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link to="/imboni-tv" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4">
          <FiArrowLeft size={16} /> Subira Imboni TV
        </Link>

        {/* Video player */}
        <div className="rounded-xl overflow-hidden mb-4 shadow-lg">
          <VideoPlayer url={video.videoUrl} thumbnail={video.thumbnailUrl} />
        </div>

        {/* Video info */}
        <div className="mb-6">
          {video.category && (
            <Link
              to={`/category/${video.category.slug}`}
              className="inline-block text-xs font-bold text-primary uppercase tracking-wide mb-2 hover:underline"
            >
              {video.category.nameKiny}
            </Link>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{video.title}</h1>

          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 pb-4 border-b">
            {video.uploadedBy && <span className="font-medium text-gray-700">{video.uploadedBy.name}</span>}
            <span className="flex items-center gap-1">
              <FiEye size={14} /> {video.views?.toLocaleString() || 0} ibisomwa
            </span>
            {video.publishedAt && (
              <span className="flex items-center gap-1">
                <FiCalendar size={14} />
                {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
              </span>
            )}
            {/* Type badge */}
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs capitalize">
              {video.type?.replace('_', ' ')}
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-accent hover:text-primary ml-auto"
            >
              <FiShare2 size={15} /> Sangira
            </button>
          </div>

          {video.description && (
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">{video.description}</p>
          )}

          {video.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {video.tags.map((t) => (
                <span key={t} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Related videos */}
        {related.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Videos Zindi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((v) => (
                <Link key={v._id} to={`/imboni-tv/${v.slug}`} className="card group block p-0 overflow-hidden">
                  <div className="relative bg-gray-900 overflow-hidden" style={{ paddingTop: '56.25%' }}>
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-3xl">🎬</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm line-clamp-2 group-hover:text-primary">{v.title}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{v.type?.replace('_', ' ')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
