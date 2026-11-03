import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiRadio } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

export default function LiveStreams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', streamUrl: '', thumbnailUrl: '', scheduledAt: '', status: 'scheduled' });

  const fetch = () => {
    api.get('/videos/live')
      .then((res) => setStreams(res.data.data.streams))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/videos/live/${editingId}`, form);
        toast.success('Live stream yahinduwe!');
      } else {
        await api.post('/videos/live', form);
        toast.success('Live stream yashyizweho!');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', description: '', streamUrl: '', thumbnailUrl: '', scheduledAt: '', status: 'scheduled' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    }
  };

  const handleEdit = (s) => {
    setForm({
      title: s.title,
      description: s.description || '',
      streamUrl: s.streamUrl,
      thumbnailUrl: s.thumbnailUrl || '',
      scheduledAt: s.scheduledAt ? format(new Date(s.scheduledAt), "yyyy-MM-dd'T'HH:mm") : '',
      status: s.status,
    });
    setEditingId(s._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iyi live stream?')) return;
    try {
      await api.delete(`/videos/live/${id}`);
      toast.success('Stream yasibwe.');
      fetch();
    } catch {
      toast.error('Gusiba byanze.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Streams</h1>
        <button
          onClick={() => { setForm({ title: '', description: '', streamUrl: '', thumbnailUrl: '', scheduledAt: '', status: 'scheduled' }); setEditingId(null); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Live Nshya
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 border-b pb-2">
              {editingId ? 'Hindura Live Stream' : 'Ongera Live Stream'}
            </h2>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <FiX size={18} />
            </button>
          </div>
          <div>
            <label className="label">Inyito *</label>
            <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input" />
          </div>
          <div>
            <label className="label">URL ya Stream * (YouTube Live, etc.)</label>
            <input required value={form.streamUrl} onChange={(e) => setForm({...form, streamUrl: e.target.value})} className="input" placeholder="https://youtube.com/live/..." />
            <p className="text-xs text-gray-400 mt-1">Shyiraho aderesi yo gusohora kuri YouTube Live, Facebook Live, cyangwa undi mubare.</p>
          </div>
          <div>
            <label className="label">Igenamiterere (Itariki n'Isaha)</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({...form, scheduledAt: e.target.value})} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input">
              <option value="scheduled">Gitegereje</option>
              <option value="live">Live</option>
              <option value="ended">Byarangiye</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editingId ? 'Bika Impinduka' : 'Shyiraho'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-ghost">Reka</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {streams.map((s) => (
          <div key={s._id} className="card flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {s.status === 'live' && <FiRadio className="text-red-500 animate-pulse" size={20} />}
              <div>
                <p className="font-medium text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {s.scheduledAt ? format(new Date(s.scheduledAt), 'dd MMM yyyy HH:mm') : 'Nta igenamiterere'}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{s.streamUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${
                s.status === 'live' ? 'bg-red-100 text-red-700' :
                s.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {s.status}
              </span>
              <button onClick={() => handleEdit(s)} className="p-1.5 text-accent hover:bg-blue-50 rounded" title="Hindura">
                <FiEdit2 size={15} />
              </button>
              <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded" title="Siba">
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!streams.length && (
          <div className="card text-center py-10 text-gray-500">
            <FiRadio size={32} className="mx-auto mb-3 text-gray-300" />
            <p>Nta live streams zihari. Kanda "Live Nshya" kugirango ushyireho.</p>
          </div>
        )}
      </div>
    </div>
  );
}
