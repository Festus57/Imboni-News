import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-gray-200 text-gray-500',
};

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchArticles = () => {
    setLoading(true);
    api.get('/articles/cms/all', { params: { status: statusFilter || undefined, page, limit: 15 } })
      .then((res) => {
        setArticles(res.data.data.articles);
        setPagination(res.data.data.pagination);
      })
      .catch(() => toast.error('Gukura inkuru byanze.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, [statusFilter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Urifuza gusiba iyi nkuru?')) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Inkuru yasibwe.');
      fetchArticles();
    } catch { toast.error('Gusiba byanze.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inkuru Zose</h1>
        <Link to="/articles/create" className="btn-primary flex items-center gap-2">
          <FiPlus /> Inkuru Nshya
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex gap-2 flex-wrap">
        {['', 'draft', 'pending_review', 'published', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === '' ? 'Zose' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Inyandiko</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Icyiciro</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Umwanditsi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Igenamiterere</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Itariki</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{a.title}</p>
                    {a.isBreaking && <span className="badge bg-red-100 text-red-700 mt-0.5">Breaking</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{a.category?.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{a.author?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 whitespace-nowrap">
                    {a.updatedAt ? format(new Date(a.updatedAt), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/articles/${a._id}/edit`} className="text-accent hover:text-blue-800">
                        <FiEdit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(a._id)} className="text-red-400 hover:text-red-700">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!articles.length && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Nta nkuru zabonetse.</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
