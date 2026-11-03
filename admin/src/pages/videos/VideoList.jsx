import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiPlay, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get('/videos/cms/all', { params: { status: statusFilter || undefined } })
      .then((res) => setVideos(res.data.data.videos))
      .catch(() => toast.error('Gukura video byanze.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [statusFilter]);

  const publish = async (id) => {
    try {
      await api.patch(`/videos/${id}/publish`);
      toast.success('Video yasohowe!');
      fetch();
    } catch { toast.error('Gusoha byanze.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iyi video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Video yasibwe.');
      fetch();
    } catch { toast.error('Gusiba byanze.'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Videos ({videos.length})</h1>
        <Link to="/videos/upload" className="btn-primary flex items-center gap-2">
          <FiPlus /> Shyiraho Video
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'draft', 'pending_review', 'published', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded text-sm border ${
              statusFilter === s ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'
            }`}
          >
            {s || 'Zose'} {s && `(${videos.filter((v) => v.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((v) => (
          <div key={v._id} className="card p-0 overflow-hidden group">
            <div className="relative bg-gray-900 h-40 flex items-center justify-center">
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover opacity-70" />
              ) : (
                <FiPlay className="text-gray-500" size={40} />
              )}
              <span className={`absolute top-2 right-2 badge ${
                v.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'
              }`}>
                {v.status}
              </span>
              {v.isShort && (
                <span className="absolute top-2 left-2 badge bg-purple-600 text-white">SHORT</span>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-sm text-gray-900 line-clamp-2">{v.title}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{v.type?.replace('_', ' ')}</p>
              <p className="text-xs text-gray-400 mt-0.5">{v.category?.nameKiny || 'No category'}</p>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                {v.status !== 'published' && (
                  <button onClick={() => publish(v._id)} className="btn-primary text-xs flex-1 flex items-center justify-center gap-1">
                    <FiPlay size={12} /> Soha
                  </button>
                )}
                <Link
                  to={`/videos/edit/${v._id}`}
                  className="btn-ghost text-xs flex items-center gap-1 px-3"
                  title="Hindura"
                >
                  <FiEdit2 size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs"
                  title="Siba"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!videos.length && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">🎬</div>
          <p>Nta videos zihari. <Link to="/videos/upload" className="text-primary hover:underline">Shyiraho video ya mbere.</Link></p>
        </div>
      )}
    </div>
  );
}
