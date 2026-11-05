import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const STATUS_COLOR = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-500',
};

export default function Comments() {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('pending');
  const [pagination, setPagination] = useState({});
  const [page, setPage]           = useState(1);

  const load = (p = 1, s = filter) => {
    setLoading(true);
    api.get('/comments/cms', { params: { status: s || undefined, page: p } })
      .then((res) => {
        setComments(res.data.data.comments || []);
        setPagination(res.data.data.pagination || {});
      })
      .catch(() => toast.error('Gufata ibitekerezo byanze.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, filter); }, [filter]);

  const handleApprove = async (id) => {
    try { await api.patch(`/comments/${id}/approve`); toast.success('Igitekerezo cyemejwe.'); load(page); }
    catch { toast.error('Byanze.'); }
  };
  const handleReject = async (id) => {
    try { await api.patch(`/comments/${id}/reject`); toast.success('Igitekerezo cyranzwe.'); load(page); }
    catch { toast.error('Byanze.'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iki tekerezo?')) return;
    try { await api.delete(`/comments/${id}`); toast.success('Igitekerezo cyasibwe.'); load(page); }
    catch { toast.error('Gusiba byanze.'); }
  };

  const counts = {
    pending: comments.filter((c) => c.status === 'pending').length,
    total: pagination.total || 0,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ibitekerezo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Subiraho ibitekerezo by'abasomyi</p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
          {counts.pending} Bitegereje
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === s ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'
            }`}>
            {s === '' ? 'Yose' : s === 'pending' ? 'Bitegereje' : s === 'approved' ? 'Byemejwe' : 'Byaranzwe'}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{c.author?.name || 'Unknown'}</span>
                    <span className={`badge text-xs ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                    {c.parent && <span className="badge bg-purple-100 text-purple-600 text-xs">Reply</span>}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
                  {c.article && (
                    <p className="text-xs text-gray-400 mt-1">
                      Ku nkuru: <span className="font-medium">{c.article.title}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {c.status !== 'approved' && (
                    <button onClick={() => handleApprove(c._id)}
                      className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Emeza">
                      <FiCheck size={15} />
                    </button>
                  )}
                  {c.status !== 'rejected' && (
                    <button onClick={() => handleReject(c._id)}
                      className="p-1.5 text-orange-500 hover:bg-orange-50 rounded" title="Ranza">
                      <FiX size={15} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(c._id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded" title="Siba">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!comments.length && (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400 border">
              <FiMessageSquare size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Nta bitekerezo bibonetse.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
