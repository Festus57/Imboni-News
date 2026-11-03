import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import NewsGrid from '../components/news/NewsGrid.jsx';
import { getArticles } from '../services/newsService.js';

export default function FactCheck() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles({ isFactCheck: true, limit: 12 })
      .then((res) => setArticles(res.data.data.articles))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Fact Check — Imboni News</title></Helmet>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">✅ Fact Check</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Imboni News isuzuma amakuru mbere yo gutangaza. Hano ni aho ubona ibyasuguwe n'ibyemejwe.
        </p>
      </div>
      <NewsGrid articles={articles} loading={loading} cols={3} />
    </>
  );
}
