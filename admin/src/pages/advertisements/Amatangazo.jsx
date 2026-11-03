import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiToggleLeft, FiToggleRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

function getYTId(url = '') {
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
  if (url.includes('v='))        return url.split('v=')[1].split('&')[0];
  return '';
}

const EMPTY = { title: '', content: '', imageUrl: '', videoUrl: '' };

export default function Amatangazo() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    api.get('/announcements/cms')
      .then((res) => setItems(res.data.data.announcements || []))
      .catch(() => toast.error('Gufata data byanze.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (item) => {
    setForm({
      title:    item.title || '',
      content:  item.content || '',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Inyito ni ngombwa.'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, form);
        toast.success('Ryahinduwe neza!');
      } else {
        await api.post('/announcements', form);
        toast.success('Itangazo ryashyizweho kuri client!');
      }
      setForm(EMPTY); setEditingId(null); setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iri tangazo?')) return;
    try { await api.delete(`/announcements/${id}`); toast.success('Ryasibwe.'); load(); }
    catch { toast.error('Gusiba byanze.'); }
  };

  const handleToggle = async (id) => {
    try { await api.patch(`/announcements/${id}/toggle`); load(); }
    catch { toast.error('Byanze.'); }
  };

  const ytId = getYTId(form.videoUrl);

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amatangazo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Shyiraho amatangazo agaragara kuri client</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus /> Itangazo Rishya
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="card mb-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-5 border-b pb-3">
            <h2 className="font-bold text-gray-900 text-lg">
              {editingId ? '✏️ Hindura Itangazo' : '➕ Itangazo Rishya'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-gray-400 hover:text-gray-600">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title — department name */}
            <div>
              <label className="label">
                Umutwe / Departement *
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (izina ry'itangazo cyangwa departement)
                </span>
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="input text-base font-semibold"
                placeholder="Urugero: Ubuhinzi, Uburezi, Ikoranabuhanga..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="label">📷 Ifoto (URL)</label>
              <input
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                className="input"
                placeholder="https://example.com/itangazo.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">Shyira ifoto ku rubuga (Cloudinary, etc.) maze ukopere URL.</p>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview"
                  className="mt-2 w-full max-h-48 object-cover rounded-lg border"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="label">🎬 Video (URL)</label>
              <input
                value={form.videoUrl}
                onChange={(e) => set('videoUrl', e.target.value)}
                className="input"
                placeholder="https://youtu.be/... cyangwa https://example.com/video.mp4"
              />
              {ytId && (
                <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                  <iframe src={`https://www.youtube.com/embed/${ytId}`}
                    className="w-full h-full" allowFullScreen title="Preview" />
                </div>
              )}
              {form.videoUrl && !ytId && (
                <video src={form.videoUrl} controls
                  className="mt-2 w-full max-h-48 rounded-lg border bg-black"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>

            {/* Text content */}
            <div>
              <label className="label">📝 Inyandiko / Ubutumwa</label>
              <textarea
                rows={5}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                className="input leading-relaxed"
                placeholder="Andika ubutumwa bw'itangazo ryawe hano..."
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.content.split(/\s+/).filter(Boolean).length} amagambo
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2 border-t">
              <button type="submit" disabled={saving}
                className="flex-1 bg-primary hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kohereza...</>
                ) : editingId ? (
                  '💾 Bika Impinduka'
                ) : (
                  '📢 Tangaza — Shyiraho kuri Client'
                )}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="btn-ghost px-6">
                Reka
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ── */}
      <div className="space-y-4">
        {items.map((item) => {
          const ytId2 = getYTId(item.videoUrl || '');
          return (
            <div key={item._id}
              className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all ${
                item.isActive ? 'border-gray-200' : 'border-dashed border-gray-200 opacity-60'
              }`}>
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                  <span className={`badge text-xs flex-shrink-0 ${
                    item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.isActive ? '● Live' : '○ Hagaritswe'}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(item._id)}
                    title={item.isActive ? 'Hagarika' : 'Tangaza'}
                    className="text-gray-400 hover:text-secondary p-1.5 rounded hover:bg-gray-100">
                    {item.isActive
                      ? <FiToggleRight size={20} className="text-green-500" />
                      : <FiToggleLeft size={20} />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-accent hover:bg-blue-50 rounded" title="Hindura">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded" title="Siba">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                {/* Image preview */}
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title}
                    className="w-full max-h-40 object-cover rounded-lg border"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}

                {/* Video preview */}
                {item.videoUrl && (
                  ytId2 ? (
                    <div className="aspect-video rounded-lg overflow-hidden border">
                      <iframe src={`https://www.youtube.com/embed/${ytId2}`}
                        className="w-full h-full" allowFullScreen title={item.title} />
                    </div>
                  ) : (
                    <video src={item.videoUrl} controls
                      className="w-full max-h-40 rounded-lg border bg-black"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )
                )}

                {/* Content preview */}
                {item.content && (
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  {item.createdBy?.name && ` · ${item.createdBy.name}`}
                </p>
              </div>
            </div>
          );
        })}

        {!items.length && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border-2 border-dashed">
            <p className="text-4xl mb-3">📢</p>
            <p className="font-semibold text-gray-600">Nta matangazo abonetse</p>
            <p className="text-sm mt-1 text-gray-400">Kanda "Itangazo Rishya" kugirango utangire.</p>
            <button onClick={openCreate} className="btn-primary mt-4 text-sm">
              <FiPlus size={14} className="inline mr-1" /> Itangazo Rishya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
