import NewsCard from './NewsCard.jsx';
import Loader from '../common/Loader.jsx';

export default function NewsGrid({ articles, loading, cols = 3 }) {
  if (loading) return <Loader />;
  if (!articles?.length) return (
    <div className="text-center py-16 text-gray-500">
      <div className="text-5xl mb-3">📭</div>
      <p>Nta makuru abonetse.</p>
    </div>
  );

  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-5`}>
      {articles.map((article) => (
        <NewsCard key={article._id} article={article} />
      ))}
    </div>
  );
}
