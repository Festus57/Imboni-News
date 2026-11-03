import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import NewsCard from './NewsCard.jsx';

export default function FeaturedNews({ articles }) {
  if (!articles?.length) return null;
  const [main, ...rest] = articles;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Hero article — fixed height ── */}
      <Link
        to={`/amakuru/${main.slug}`}
        className="lg:col-span-2 relative rounded-xl overflow-hidden group block"
        style={{ height: 320 }}
      >
        <div className="w-full h-full bg-gray-200">
          {main.featuredImage ? (
            <img
              src={main.featuredImage}
              alt={main.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl bg-gray-100">📰</div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex gap-2 mb-2 flex-wrap">
            {main.category && (
              <span
                className="badge text-white text-xs"
                style={{ backgroundColor: main.category.color || '#E63946' }}
              >
                {main.category.nameKiny}
              </span>
            )}
            {main.isBreaking && (
              <span className="badge bg-primary text-white text-xs">🔴 Breaking</span>
            )}
            {main.hasVideo && (
              <span className="badge bg-blue-600 text-white text-xs">▶ Video</span>
            )}
          </div>

          <h2 className="text-white font-headline text-xl sm:text-2xl font-bold leading-tight line-clamp-2 group-hover:text-red-300 transition-colors">
            {main.title}
          </h2>

          <div className="text-gray-300 text-xs mt-2 flex gap-3">
            {main.author && <span className="font-medium">{main.author.name}</span>}
            {main.publishedAt && (
              <span>{formatDistanceToNow(new Date(main.publishedAt), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </Link>

      {/* ── Side articles — fixed height, scroll if overflow ── */}
      <div className="flex flex-col gap-3" style={{ maxHeight: 320, overflowY: 'auto' }}>
        {rest.slice(0, 4).map((a) => (
          <NewsCard key={a._id} article={a} size="sm" />
        ))}
      </div>
    </div>
  );
}
