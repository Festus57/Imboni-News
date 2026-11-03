import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import FeaturedNews from '../components/news/FeaturedNews.jsx';
import NewsGrid from '../components/news/NewsGrid.jsx';
import TrendingNews from '../components/news/TrendingNews.jsx';
import VideoCard from '../components/video/VideoCard.jsx';
import AdBanner from '../components/ads/AdBanner.jsx';
import SidebarAd from '../components/ads/SidebarAd.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { getArticles, getCategories } from '../services/newsService.js';
import { getVideos } from '../services/videoService.js';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    Promise.all([
      getArticles({ isFeatured: true, limit: 4 }),
      getArticles({ isTrending: true, limit: 6 }),
      getVideos({ limit: 4 }),
      getCategories(),
    ]).then(([featRes, trendRes, vidRes, catRes]) => {
      setFeatured(featRes.data.data.articles);
      setTrending(trendRes.data.data.articles);
      setVideos(vidRes.data.data.videos);
      setCategories(catRes.data.data.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getArticles({ page, limit: 12 })
      .then((res) => {
        setArticles(res.data.data.articles);
        setPagination(res.data.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <Helmet>
        <title>Imboni News — Amakuru y'Igihugu n'Isi Yose</title>
        <meta name="description" content="Soma amakuru mashya y'u Rwanda n'isi yose kuri Imboni News." />
      </Helmet>

      {/* Top Ad */}
      <AdBanner placement="top_banner" />

      {/* ─── Featured Section — fixed max height ─── */}
      {featured.length > 0 && (
        <div className="mb-8">
          <FeaturedNews articles={featured} />
        </div>
      )}

      {/* ─── Main layout: content + sidebar ─── */}
      <div className="flex gap-6 items-start">

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Category quick links */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="badge text-white text-xs px-3 py-1.5 hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: cat.color || '#E63946' }}
                >
                  {cat.nameKiny}
                </Link>
              ))}
            </div>
          )}

          <AdBanner placement="article_inline" />

          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full inline-block" />
            Amakuru Mashya
          </h2>

          <NewsGrid articles={articles} loading={loading} cols={3} />
          <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />
        </div>

        {/* ── Sidebar — fixed height with scroll ── */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {/* Trending news — scrollable inside */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              🔥 Amakuru Agezweho(video & shorts)
            </h3>
            <ol className="space-y-3">
              {trending.map((a, i) => (
                <li key={a._id} className="flex items-start gap-2">
                  <span className="text-xl font-bold text-primary/30 leading-none w-6 flex-shrink-0">{i + 1}</span>
                  <Link to={`/amakuru/${a.slug}`}
                    className="text-sm font-medium text-gray-800 hover:text-primary line-clamp-2 transition-colors">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {/* Sidebar ad */}
          <SidebarAd />

          {/* Latest videos */}
          {videos.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">🎬 Imboni TV</h3>
                <Link to="/imboni-tv" className="text-xs text-primary hover:underline">Reba Byose →</Link>
              </div>
              <div className="flex flex-col gap-3">
                {videos.slice(0, 2).map((v) => (
                  <VideoCard key={v._id} video={v} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <AdBanner placement="footer" />
    </>
  );
}
