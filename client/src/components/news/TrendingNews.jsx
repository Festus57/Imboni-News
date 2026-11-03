import { Link } from 'react-router-dom';
import { FiTrendingUp } from 'react-icons/fi';

export default function TrendingNews({ articles }) {
  if (!articles?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4 border-b pb-2">
        <FiTrendingUp className="text-primary" /> Amakuru Akunda
      </h3>
      <ol className="space-y-3">
        {articles.map((a, i) => (
          <li key={a._id} className="flex items-start gap-3">
            <span className="text-2xl font-bold text-primary/30 leading-none w-6 flex-shrink-0">{i + 1}</span>
            <Link
              to={`/amakuru/${a.slug}`}
              className="text-sm font-medium text-gray-800 hover:text-primary line-clamp-2 transition-colors"
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
