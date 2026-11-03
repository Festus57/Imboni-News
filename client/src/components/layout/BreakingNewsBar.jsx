import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../../services/newsService.js';

export default function BreakingNewsBar() {
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    getArticles({ isBreaking: true, limit: 5 })
      .then((res) => setHeadlines(res.data.data.articles))
      .catch(() => {});
  }, []);

  if (!headlines.length) return null;

  return (
    <div className="bg-primary text-white flex items-center overflow-hidden h-9">
      <span className="flex-shrink-0 bg-red-800 px-4 py-1 text-xs font-bold uppercase tracking-widest h-full flex items-center">
        Breaking
      </span>
      <div className="flex-1 overflow-hidden relative">
        <div className="ticker-animate flex gap-12 text-sm font-medium">
          {headlines.concat(headlines).map((a, i) => (
            <Link key={i} to={`/amakuru/${a.slug}`} className="hover:underline whitespace-nowrap px-4">
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
