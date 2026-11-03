import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NewsGrid from '../components/news/NewsGrid.jsx';
import Pagination from '../components/common/Pagination.jsx';
import AdBanner from '../components/ads/AdBanner.jsx';
import { getArticles, getCategories } from '../services/newsService.js';

export default function CategoryNews() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    getCategories().then((res) => {
      const found = res.data.data.categories.find((c) => c.slug === slug);
      setCategory(found);
    });
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    getArticles({ category: category._id, page, limit: 12 })
      .then((res) => {
        setArticles(res.data.data.articles);
        setPagination(res.data.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, page]);

  return (
    <>
      <Helmet>
        <title>{category?.nameKiny || slug} — Imboni News</title>
      </Helmet>

      <AdBanner placement="top_banner" />

      <div className="mb-6">
        {category && (
          <div className="flex items-center gap-3">
            <span className="w-5 h-10 rounded" style={{ backgroundColor: category.color }} />
            <h1 className="text-2xl font-bold text-gray-900">{category.nameKiny}</h1>
            {pagination.total > 0 && (
              <span className="text-sm text-gray-500">({pagination.total} inkuru)</span>
            )}
          </div>
        )}
      </div>

      <NewsGrid articles={articles} loading={loading} cols={3} />
      <Pagination page={page} pages={pagination.pages || 1} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
    </>
  );
}
