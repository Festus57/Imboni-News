import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiX, FiClock, FiEye, FiVideo, FiTag, FiFileText } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../components/common/Loader.jsx';
import api from '../services/api.js';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';

  const [query, setQuery] = useState(q);
  const [results, setResults] = useState({ articles: [], videos: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Search when q changes
  useEffect(() => {
    if (!q) { setResults({ articles: [], videos: [], categories: [] }); return; }
    doSearch(q, 1);
  }, [q, page]);

  const doSearch = async (term, p = 1) => {
    setLoading(true);
    try {
      const [artRes, vidRes, catRes] = await Promise.allSettled([
        api.get('/articles', { params: { search: term, page: p, limit: 12 } }),
        api.get('/videos', { params: { limit: 8 } }),
        api.get('/categories'),
      ]);

      const arts = artRes.status === 'fulfilled' ? artRes.value.data.data.articles || [] : [];
      const vids = vidRes.status === 'fulfilled'
        ? (vidRes.value.data.data.videos || []).filter((v) =>
            v.title?.toLowerCase().includes(term.toLowerCase())
          )
        : [];
      const cats = catRes.status === 'fulfilled'
        ? (catRes.value.data.data.categories || []).filter((c) =>
            c.name?.toLowerCase().includes(term.toLowerCase()) ||
            c.nameKiny?.toLowerCase().includes(term.toLowerCase())
          )
        : [];

      setResults({ articles: arts, videos: vids, categories: cats });
      if (artRes.status === 'fulfilled') {
        setPagination(artRes.value.data.data.pagination || {});
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  // Live search while typing
  const handleInputChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        setSearchParams({ q: val.trim() });
        setPage(1);
      } else {
        setSearchParams({});
        setResults({ articles: [], videos: [], categories: [] });
      }
    }, 350);
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    setResults({ articles: [], videos: [], categories: [] });
    inputRef.current?.focus();
  };

  const totalResults = results.articles.length + results.videos.length + results.categories.length;
  const tabs = [
    { id: 'all', label: 'Byose', count: totalResults },
    { id: 'articles', label: 'Inkuru', count: results.articles.length, icon: <FiFileText size={13} /> },
    { id: 'videos', label: 'Videos', count: results.videos.length, icon: <FiVideo size={13} /> },
    { id: 'categories', label: 'Ibyiciro', count: results.categories.length, icon: <FiTag size={13} /> },
  ];

  return (
    <>
      <Helmet><title>{q ? `"${q}" — Imboni News` : 'Shakisha — Imboni News'}</title></Helmet>

      {/* ── Search input ── */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && query.trim() && setSearchParams({ q: query.trim() })}
            className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary shadow-sm transition-colors bg-white"
            placeholder="Shakisha inkuru, video, ibyiciro..."
            autoComplete="off"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Siba"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        {/* Result count */}
        {q && !loading && (
          <p className="text-sm text-gray-500 mt-2 px-1">
            {totalResults > 0
              ? `Ibisubizo ${totalResults} byabonetse kuri "${q}"`
              : `Nta bisubizo byabonetse kuri "${q}"`}
          </p>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : !q ? (
        /* Empty state */
        <div className="text-center py-16 text-gray-400">
          <FiSearch size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">Andika iri na iri kugirango ushakishe</p>
          <p className="text-sm mt-1">Ushobora gushakisha inkuru, ibyiciro, n'ibindi</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nta bisubizo byabonetse</h3>
          <p className="text-sm text-gray-500 mb-4">Gerageza amagambo ayandi cyangwa suzuma indangagaciro</p>
          <Link to="/" className="btn-primary">Subira Ahabanza</Link>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap mb-6 border-b border-gray-200 pb-1">
            {tabs.filter((t) => t.count > 0 || t.id === 'all').map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                  activeTab === t.id
                    ? 'border-primary text-primary bg-red-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.icon} {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Categories */}
          {(activeTab === 'all' || activeTab === 'categories') && results.categories.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiTag /> Ibyiciro</h2>}
              <div className="flex gap-2 flex-wrap">
                {results.categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary hover:bg-red-50 transition-all text-sm font-medium"
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#E63946' }} />
                    {cat.nameKiny} <span className="text-gray-400">({cat.name})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {(activeTab === 'all' || activeTab === 'videos') && results.videos.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiVideo /> Videos</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.videos.map((v) => {
                  const isYT = v.videoUrl?.includes('youtube') || v.videoUrl?.includes('youtu.be');
                  const ytId = isYT ? (() => {
                    try {
                      if (v.videoUrl.includes('youtu.be/')) return v.videoUrl.split('youtu.be/')[1].split('?')[0];
                      if (v.videoUrl.includes('v=')) return v.videoUrl.split('v=')[1].split('&')[0];
                      return '';
                    } catch { return ''; }
                  })() : '';
                  const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);

                  return (
                    <Link key={v._id} to={`/imboni-tv/${v.slug}`} className="card group block p-0 overflow-hidden">
                      <div className="relative bg-gray-900" style={{ paddingTop: '56.25%' }}>
                        {thumb ? (
                          <img src={thumb} alt={v.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-3xl">🎬</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-primary">{v.title}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Articles */}
          {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
            <div>
              {activeTab === 'all' && <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiFileText /> Inkuru</h2>}
              <div className="space-y-0 divide-y divide-gray-100">
                {results.articles.map((a) => (
                  <Link
                    key={a._id}
                    to={`/amakuru/${a.slug}`}
                    className="flex gap-4 py-4 hover:bg-gray-50 transition-colors group rounded-lg px-2"
                  >
                    {/* Thumbnail */}
                    {a.featuredImage && (
                      <div className="w-20 sm:w-28 h-16 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <img src={a.featuredImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {a.category && (
                        <span className="text-xs font-semibold text-primary">{a.category.nameKiny}</span>
                      )}
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary line-clamp-2 mt-0.5 leading-snug">
                        {a.title}
                      </h3>
                      {a.summary && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{a.summary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                        {a.author && <span>{a.author.name}</span>}
                        {a.publishedAt && (
                          <span className="flex items-center gap-1">
                            <FiClock size={11} />
                            {formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true })}
                          </span>
                        )}
                        {a.views > 0 && (
                          <span className="flex items-center gap-1">
                            <FiEye size={11} /> {a.views.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-1.5 rounded text-sm ${p === page ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
