import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NewsGrid from '../components/news/NewsGrid.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { getArticles } from '../services/newsService.js';

export default function DistrictNews() {
  const { district } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    getArticles({ district, page, limit: 12 })
      .then((res) => {
        setArticles(res.data.data.articles);
        setPagination(res.data.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [district, page]);

  return (
    <>
      <Helmet><title>Amakuru ya {district} — Imboni News</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
        Amakuru ya {district}
        {pagination.total > 0 && <span className="text-sm text-gray-500 ml-2">({pagination.total})</span>}
      </h1>
      <NewsGrid articles={articles} loading={loading} cols={3} />
      <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />
    </>
  );
}
