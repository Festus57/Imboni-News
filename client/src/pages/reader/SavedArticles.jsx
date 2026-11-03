import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiBookmark, FiTrash2, FiClock, FiEye } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { toggleSave } from '../../services/newsService.js';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';

export default function SavedArticles() {
  const { updateUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/auth/me')
      .then((res) => {
        const saved = res.data.data.user?.savedArticles || [];
        setArticles(saved);
        updateUser(res.data.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnsave = async (id) => {
    try {
      await toggleSave(id);
      setArticles((prev) => prev.filter((a) => (a._id || a) !== id));
      toast.success('Inkuru yasibwe mu bihungitswe!');
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet><title>Inkuru Zabikirwa — Imboni News</title></Helmet>

      <div className="flex items-center gap-3 mb-6">
        <FiBookmark size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Inkuru Zabikirwa</h1>
        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {articles.length}
        </span>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">🔖</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nta nkuru zabikirwa</h3>
          <p className="text-gray-500 text-sm mb-6">
            Ubika inkuru urayifunika ku icon ya bookmark. Uyibona hano nyuma.
          </p>
          <Link to="/" className="btn-primary">Soma Amakuru Mashya</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => {
            const article = typeof a === 'object' ? a : null;
            if (!article) return null;

            return (
              <div key={article._id} className="bg-white rounded-xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-md transition-shadow relative">
                {/* Image */}
                {article.featuredImage ? (
                  <Link to={`/amakuru/${article.slug}`}>
                    <div className="h-40 overflow-hidden">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                ) : (
                  <Link to={`/amakuru/${article.slug}`}>
                    <div className="h-32 bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center">
                      <FiBookmark size={36} className="text-gray-300" />
                    </div>
                  </Link>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  {article.category && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white mb-2 inline-block"
                      style={{ backgroundColor: article.category.color || '#E63946' }}
                    >
                      {article.category.nameKiny || article.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <Link to={`/amakuru/${article.slug}`}>
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug mt-1">
                      {article.title}
                    </h3>
                  </Link>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 flex-wrap">
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <FiClock size={11} />
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                      </span>
                    )}
                    {article.views > 0 && (
                      <span className="flex items-center gap-1">
                        <FiEye size={11} /> {article.views.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unsave button */}
                <button
                  onClick={() => handleUnsave(article._id)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 border border-gray-200 hover:border-red-200 p-2 rounded-full text-gray-500 hover:text-primary transition-all shadow-sm"
                  aria-label="Siba mu bihungitswe"
                  title="Siba mu bihungitswe"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
