import { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

export default function ReviewArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState(null);

  const fetch = () => {
    setLoading(true);
    api.get('/articles/cms/all', { params: { status: 'pending_review', limit: 20 } })
      .then((res) => setArticles(res.data.data.articles))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const publish = async (id) => {
    try {
      await api.patch(`/articles/${id}/publish`);
      toast.success('Inkuru yasohowe!');
      fetch();
    } catch { toast.error('Gusoha byanze.'); }
  };

  const reject = async (id) => {
    try {
      await api.patch(`/articles/${id}/reject`, { reason: rejectReason });
      toast.success('Inkuru yaranzwe.');
      setRejectId(null);
      setRejectReason('');
      fetch();
    } catch { toast.error('Kuranza byanze.'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Suzuma Inkuru
        <span className="ml-2 badge bg-yellow-100 text-yellow-700">{articles.length} zitegereje</span>
      </h1>

      {!articles.length ? (
        <div className="card text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">✅</div>
          <p>Nta nkuru zitegereje.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((a) => (
            <div key={a._id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{a.summary}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>By {a.author?.name}</span>
                    <span>— {a.category?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => publish(a._id)} className="btn-primary flex items-center gap-1 text-xs">
                    <FiCheck /> Soha
                  </button>
                  <button onClick={() => setRejectId(a._id)} className="btn-danger flex items-center gap-1 text-xs">
                    <FiX /> Ranza
                  </button>
                </div>
              </div>

              {rejectId === a._id && (
                <div className="mt-4 border-t pt-4">
                  <label className="label">Impamvu yo Kuranza</label>
                  <textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    className="input mb-2" placeholder="Sobanura impamvu inkuru yaranzwe..." />
                  <div className="flex gap-2">
                    <button onClick={() => reject(a._id)} className="btn-danger text-sm">Emeza Kuranza</button>
                    <button onClick={() => setRejectId(null)} className="btn-ghost text-sm">Reka</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
