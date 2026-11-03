import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FiClock, FiEye } from 'react-icons/fi';

export default function NewsCard({ article, size = 'md' }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  // Small cards (sidebar): horizontal layout, no image
  if (isSmall) {
    return (
      <Link
        to={`/amakuru/${article.slug}`}
        className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        {article.featuredImage && (
          <div className="w-16 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-200">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span
              className="text-xs font-semibold"
              style={{ color: article.category.color || '#E63946' }}
            >
              {article.category.nameKiny}
            </span>
          )}
          <h4 className="text-xs font-semibold text-gray-800 group-hover:text-primary line-clamp-2 leading-snug mt-0.5">
            {article.title}
          </h4>
          {article.publishedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Normal and large cards
  return (
    <div className="card group">
      <Link to={`/amakuru/${article.slug}`}>
        <div className={`overflow-hidden ${isLarge ? 'h-56' : 'h-40'} bg-gray-200`}>
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs">Nta ifoto</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        {article.category && (
          <Link
            to={`/category/${article.category.slug}`}
            className="badge text-white mb-2 inline-block"
            style={{ backgroundColor: article.category.color || '#E63946' }}
          >
            {article.category.nameKiny || article.category.name}
          </Link>
        )}

        <div className="flex gap-1 mb-1 flex-wrap">
          {article.isBreaking && <span className="badge bg-red-600 text-white">Breaking</span>}
          {article.hasVideo && <span className="badge bg-blue-600 text-white">▶ Video</span>}
          {article.hasAudio && <span className="badge bg-green-600 text-white">🎵 Audio</span>}
        </div>

        <Link to={`/amakuru/${article.slug}`}>
          <h3 className={`font-headline font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-3 ${isLarge ? 'text-lg' : 'text-sm'}`}>
            {article.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
          {article.author && <span>{article.author.name}</span>}
          <span className="flex items-center gap-1">
            <FiClock size={11} />
            {article.publishedAt
              ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
              : 'Draft'}
          </span>
          {article.views > 0 && (
            <span className="flex items-center gap-1">
              <FiEye size={11} /> {article.views.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
