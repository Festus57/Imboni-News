import { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiPlay, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const PLACEMENTS = ['top_banner', 'sidebar', 'article_inline', 'homepage', 'footer', 'video_preroll', 'mobile'];
const PACKAGES = [
  { value: 'starter', label: 'Starter — 15,000 RWF', price: 15000 },
  { value: 'business', label: 'Business — 45,000 RWF', price: 45000 },
  { value: 'premium', label: 'Premium — 100,000 RWF', price: 100000 },
];
const EMPTY = {
  advertiser: '', name: '', package: 'business', placement: 'sidebar',
  adType: 'image',
  imageUrl: '', videoUrl: '', adContent: '',
  destinationUrl: '', startDate: '', endDate: '', priceRwf: 45000,
};

export default function AdCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('');

  const load = () => {
    Promise.all([api.get('/ads/campaigns'), api.get('/ads/advertisers')])
      .then(([c, a]) => { setCampaigns(c.data.data.campaigns); setAdvertisers(a.data.data.advertisers); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/ads/campaigns/${editingId}`, form);
        toast.success('Umutwe wahinduwe!');
      } else {
        await api.post('/ads/campaigns', form);
        toast.success("Umutwe w'itangazo woshyizweho!");
      }
      setForm(EMPTY); setEditingId(null); setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    }
  };

  const handleEdit = (c) => {
    const adType = c.adType || (c.videoUrl ? 'video' : c.adContent ? 'content' : 'image');
    setForm({
      advertiser:     c.advertiser?._id || '',
      name:           c.name,
      package:        c.package,
      placement:      c.placement,
      adType,
      imageUrl:       c.imageUrl || '',
      videoUrl:       c.videoUrl || '',
      adContent:      c.adContent || '',
      destinationUrl: c.destinationUrl,
      startDate:      c.startDate ? format(new Date(c.startDate), 'yyyy-MM-dd') : '',
      endDate:        c.endDate   ? format(new Date(c.endDate),   'yyyy-MM-dd') : '',
      priceRwf:       c.priceRwf,
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba uyu mutwe w\'itangazo?')) return;
    try {
      await api.delete(`/ads/campaigns/${id}`);
      toast.success('Umutwe wasibwe.');
      load();
    } catch {
      toast.error('Gusiba byanze.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/ads/campaigns/${id}/approve`);
      toast.success('Yemejwe!'); load();
    } catch { toast.error('Byanze.'); }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/ads/campaigns/${id}/activate`);
      toast.success('Itangazo rigendera!'); load();
    } catch { toast.error('Byanze.'); }
  };

  // Shortcut: approve + activate in one click
  const handleQuickActivate = async (id) => {
    try {
      await api.patch(`/ads/campaigns/${id}/approve`);
      await api.patch(`/ads/campaigns/${id}/activate`);
      toast.success('Itangazo rigendera neza!'); load();
    } catch { toast.error('Byanze.'); }
  };

  const statusColor = (s) => ({
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-100 text-gray-600',
    rejected: 'bg-red-100 text-red-600',
    paused: 'bg-orange-100 text-orange-600',
  }[s] || 'bg-gray-100 text-gray-600');

  const filtered = filter ? campaigns.filter((c) => c.status === filter) : campaigns;

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Imitwe y'Itangazo</h1>
        <button
          onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Umutwe Mushya
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'pending', 'approved', 'active', 'expired', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded text-sm border ${filter === s ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'}`}>
            {s || 'Yose'} {s && `(${campaigns.filter((c) => c.status === s).length})`}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Hindura Umutwe w'Itangazo" : 'Umutwe Mushya w\'Itangazo'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <FiX size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Umushoramari *</label>
              <select required value={form.advertiser} onChange={(e) => setForm({ ...form, advertiser: e.target.value })} className="input">
                <option value="">Hitamo...</option>
                {advertisers.map((a) => <option key={a._id} value={a._id}>{a.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Izina ry'Umutwe *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Pacute</label>
              <select value={form.package} onChange={(e) => {
                const pkg = PACKAGES.find((p) => p.value === e.target.value);
                setForm({ ...form, package: e.target.value, priceRwf: pkg?.price || 0 });
              }} className="input">
                {PACKAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Aho Itangazo Rizashyirwa</label>
              <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="input">
                {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Ad type selector — full width */}
            <div className="md:col-span-2">
              <label className="label">Ubwoko bw'Itangazo</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'image',   label: '🖼️ Ifoto',     desc: 'Image URL' },
                  { id: 'video',   label: '🎬 Video',     desc: 'YouTube / MP4' },
                  { id: 'content', label: '📝 Inyandiko', desc: 'Text only' },
                ].map((t) => (
                  <button key={t.id} type="button"
                    onClick={() => setForm({ ...form, adType: t.id, imageUrl: '', videoUrl: '', adContent: '' })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.adType === t.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {t.label}
                    <span className="text-xs text-gray-400 font-normal">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL */}
            {form.adType === 'image' && (
              <div className="md:col-span-2">
                <label className="label">URL y'Ifoto</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="input" placeholder="https://example.com/ad.jpg" />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview"
                    className="mt-2 w-full max-h-32 object-cover rounded-lg border"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
            )}

            {/* Video URL */}
            {form.adType === 'video' && (
              <div className="md:col-span-2">
                <label className="label">URL ya Video</label>
                <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="input" placeholder="https://youtu.be/... cyangwa https://example.com/ad.mp4" />
                <p className="text-xs text-gray-400 mt-1">
                  📌 Kuri client: video izakina yonyine (autoplay, muted, loop) — nta button zo guhagarika.
                </p>
                {form.videoUrl && (form.videoUrl.includes('youtu') ? (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src={`https://www.youtube.com/embed/${
                        form.videoUrl.split('v=')[1]?.split('&')[0] ||
                        form.videoUrl.split('youtu.be/')[1]?.split('?')[0]
                      }?autoplay=1&mute=1&controls=0&loop=1`}
                      className="w-full h-full" allowFullScreen title="Preview" />
                  </div>
                ) : (
                  <video src={form.videoUrl} muted autoPlay loop
                    className="mt-2 w-full max-h-32 rounded-lg border bg-black"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ))}
              </div>
            )}

            {/* Content text */}
            {form.adType === 'content' && (
              <div className="md:col-span-2">
                <label className="label">Inyandiko y'Itangazo</label>
                <textarea rows={3} value={form.adContent}
                  onChange={(e) => setForm({ ...form, adContent: e.target.value })}
                  className="input" placeholder="Andika ubutumwa bw'itangazo ryawe hano..." />
              </div>
            )}

            <div>
              <label className="label">URL y'Aho Bajyana *</label>
              <input required value={form.destinationUrl} onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="label">Igiciro (RWF)</label>
              <input type="number" value={form.priceRwf} onChange={(e) => setForm({ ...form, priceRwf: Number(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="label">Itariki yo Gutangira *</label>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Itariki yo Kurangira *</label>
              <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2 border-t">
              <button type="submit" className="btn-primary">{editingId ? 'Bika Impinduka' : 'Ongera'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-ghost">Reka</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Umutwe</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Umushoramari</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Pacute / Aho</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Amatariki</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 hidden md:table-cell">Stats</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.advertiser?.companyName}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="text-xs"><span className="font-medium">{c.package}</span><br/><span className="text-gray-500">{c.placement}</span></div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                  {c.startDate ? format(new Date(c.startDate), 'dd/MM/yy') : '—'} → {c.endDate ? format(new Date(c.endDate), 'dd/MM/yy') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${statusColor(c.status)}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                  <div>{c.impressions?.toLocaleString() || 0} views</div>
                  <div>{c.clicks || 0} clicks</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end flex-wrap">
                    {c.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(c._id)} title="Emeza gusa" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                          <FiCheck size={15} />
                        </button>
                        <button onClick={() => handleQuickActivate(c._id)} title="Tangira vuba" className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1">
                          <FiPlay size={12} /> Live
                        </button>
                      </>
                    )}
                    {c.status === 'approved' && (
                      <button onClick={() => handleActivate(c._id)} title="Tangira" className="p-1.5 text-green-500 hover:bg-green-50 rounded">
                        <FiPlay size={15} />
                      </button>
                    )}
                    <button onClick={() => handleEdit(c)} title="Hindura" className="p-1.5 text-accent hover:bg-blue-50 rounded">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} title="Siba" className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center text-gray-500 py-8 text-sm">Nta mitwe ibonetse.</p>}
      </div>
    </div>
  );
}
