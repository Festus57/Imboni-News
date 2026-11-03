import { useState, useEffect } from 'react';
import {
  FiMail, FiPhone, FiCheck, FiX, FiClock,
  FiImage, FiVideo, FiFileText, FiCalendar,
  FiExternalLink, FiMapPin, FiTrash2, FiZap,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const DURATION_LABELS = {
  '7days':   '7 Iminsi',
  '1month':  '1 Ukwezi',
  '3months': '3 Amezi',
};

const PLACEMENT_LABELS = {
  top_banner:     'Banner Hejuru',
  sidebar:        'Sidebar',
  homepage:       'Paji Nyamukuru',
  article_inline: 'Hagati y\'Inkuru',
};

const TYPE_ICONS = {
  image:   <FiImage size={14} className="text-blue-500" />,
  video:   <FiVideo size={14} className="text-purple-500" />,
  content: <FiFileText size={14} className="text-green-500" />,
};

const STATUS_CFG = {
  new:       { color: 'bg-red-100 text-red-600',    label: 'Gishya',    icon: <FiClock size={11} /> },
  contacted: { color: 'bg-yellow-100 text-yellow-700', label: 'Byagezweho', icon: <FiMail size={11} /> },
  converted: { color: 'bg-green-100 text-green-700', label: 'Byemewe',   icon: <FiCheck size={11} /> },
  declined:  { color: 'bg-gray-100 text-gray-500',  label: 'Byaranzwe', icon: <FiX size={11} /> },
};

export default function Kwamamaza() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');
  const [decliningId, setDecliningId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [noteId, setNoteId]         = useState(null);
  const [note, setNote]             = useState('');

  const load = () => {
    api.get('/ads/requests')
      .then((res) => setRequests(res.data.data.requests || []))
      .catch(() => toast.error('Gufata data byanze.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/ads/requests/${id}/accept`, { note: note || '' });
      toast.success('Ubusabe bwemewe!');
      setNoteId(null); setNote('');
      load();
    } catch { toast.error('Gukira byanze.'); }
  };

  const handleDecline = async (id) => {
    try {
      await api.patch(`/ads/requests/${id}/decline`, { reason: declineReason });
      toast.success('Ubusabe buranzwe.');
      setDecliningId(null); setDeclineReason('');
      load();
    } catch { toast.error('Kuranza byanze.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iki busabe?')) return;
    try { await api.delete(`/ads/requests/${id}`); toast.success('Busibwe.'); load(); }
    catch { toast.error('Gusiba byanze.'); }
  };

  const [campaignModal, setCampaignModal] = useState(null);
  const [advertisers, setAdvertisers]     = useState([]);
  const [campaignForm, setCampaignForm]   = useState({});

  const openCampaignModal = async (r) => {
    if (!advertisers.length) {
      const res = await api.get('/ads/advertisers').catch(() => ({ data: { data: { advertisers: [] } } }));
      setAdvertisers(res.data.data.advertisers || []);
    }
    const daysMap = { '7days': 7, '1month': 30, '3months': 90 };
    const days = daysMap[r.duration] || 30;
    const now = new Date();
    const end = new Date(now); end.setDate(end.getDate() + days);
    const fmt = (d) => d.toISOString().split('T')[0];
    setCampaignForm({
      name:           `${r.companyName} — ${r.requestedPackage}`,
      package:        r.requestedPackage || 'business',
      placement:      r.placement || 'top_banner',
      adType:         r.adType || 'image',
      imageUrl:       r.adType === 'image'   ? (r.mediaUrl || '') : '',
      videoUrl:       r.adType === 'video'   ? (r.mediaUrl || '') : '',
      adContent:      r.adType === 'content' ? (r.adContent || '') : '',
      destinationUrl: r.destinationUrl || '',
      altText:        r.companyName || '',
      startDate:      fmt(now),
      endDate:        fmt(end),
      priceRwf:       r.requestedPackage === 'starter' ? 45000 : r.requestedPackage === 'premium' ? 180000 : 90000,
      advertiser:     '',
    });
    setCampaignModal(r);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.advertiser) { toast.error('Hitamo umushoramari.'); return; }
    try {
      await api.post('/ads/campaigns', campaignForm);
      await api.patch(`/ads/requests/${campaignModal._id}/accept`, { note: 'Campaign created.' });
      toast.success('Campaign yashyizweho na itangazo ryemewe!');
      setCampaignModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Ikibazo.'); }
  };

  const counts = {
    all: requests.length,
    new: requests.filter((r) => r.status === 'new').length,
    converted: requests.filter((r) => r.status === 'converted').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  };
  const filtered = filter ? requests.filter((r) => r.status === filter) : requests;

  if (loading) return <Loader />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kwamamaza — Ubusabe</h1>
          <p className="text-sm text-gray-500 mt-0.5">Busabe bwose bwoherejwe n'abashoramari</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">{counts.new} Bishya</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">{counts.converted} Byemewe</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { v: '',          l: `Byose (${counts.all})` },
          { v: 'new',       l: `Bishya (${counts.new})` },
          { v: 'contacted', l: 'Byagezweho' },
          { v: 'converted', l: `Byemewe (${counts.converted})` },
          { v: 'declined',  l: `Byaranzwe (${counts.declined})` },
        ].map((t) => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === t.v ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'
            }`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((r) => {
          const sc = STATUS_CFG[r.status] || STATUS_CFG.new;
          const isYT = r.mediaUrl?.includes('youtube') || r.mediaUrl?.includes('youtu.be');
          const ytId = isYT
            ? (r.mediaUrl.split('v=')[1]?.split('&')[0] || r.mediaUrl.split('youtu.be/')[1]?.split('?')[0])
            : null;

          return (
            <div key={r._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Top bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-gray-900">{r.companyName}</h3>
                  <span className={`badge text-xs flex items-center gap-1 ${sc.color}`}>
                    {sc.icon} {sc.label}
                  </span>
                  <span className="badge bg-blue-100 text-blue-700 text-xs capitalize">{r.requestedPackage}</span>
                  {r.duration && (
                    <span className="badge bg-purple-100 text-purple-700 text-xs flex items-center gap-1">
                      <FiCalendar size={10} /> {DURATION_LABELS[r.duration] || r.duration}
                    </span>
                  )}
                  {r.adType && (
                    <span className="badge bg-gray-100 text-gray-600 text-xs flex items-center gap-1">
                      {TYPE_ICONS[r.adType]} {r.adType}
                    </span>
                  )}
                  {r.placement && (
                    <span className="badge bg-orange-100 text-orange-700 text-xs flex items-center gap-1">
                      <FiMapPin size={10} /> {PLACEMENT_LABELS[r.placement] || r.placement}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Contact info */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-500">Umuntu: </span>{r.contactName}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-1.5">
                    <FiMail size={13} className="text-gray-400" /> {r.email}
                  </p>
                  {r.phone && (
                    <p className="text-sm text-gray-700 flex items-center gap-1.5">
                      <FiPhone size={13} className="text-gray-400" /> {r.phone}
                    </p>
                  )}
                  {r.destinationUrl && (
                    <p className="text-sm flex items-center gap-1.5 text-blue-600">
                      <FiExternalLink size={13} />
                      <a href={r.destinationUrl} target="_blank" rel="noopener noreferrer"
                        className="hover:underline truncate max-w-xs">{r.destinationUrl}</a>
                    </p>
                  )}
                  {r.message && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mt-2">
                      <p className="font-medium text-gray-500 text-xs mb-1">Ubutumwa:</p>
                      {r.message}
                    </div>
                  )}
                  {r.adminNote && (
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      <p className="font-medium text-xs mb-1">Icyo mwaduze:</p>
                      {r.adminNote}
                    </div>
                  )}
                </div>

                {/* Media preview */}
                <div>
                  {r.adType === 'image' && r.mediaUrl && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><FiImage size={12} /> Ifoto y'Itangazo</p>
                      <img src={r.mediaUrl} alt="Ad preview"
                        className="w-full rounded-lg object-cover max-h-48 border"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                  {r.adType === 'video' && r.mediaUrl && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><FiVideo size={12} /> Video y'Itangazo</p>
                      {isYT && ytId ? (
                        <div className="aspect-video rounded-lg overflow-hidden border">
                          <iframe src={`https://www.youtube.com/embed/${ytId}`}
                            className="w-full h-full" allowFullScreen title="Ad video" />
                        </div>
                      ) : (
                        <video src={r.mediaUrl} controls className="w-full max-h-48 rounded-lg border bg-black"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                    </div>
                  )}
                  {r.adType === 'content' && r.adContent && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><FiFileText size={12} /> Inyandiko y'Itangazo</p>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed border">
                        {r.adContent}
                      </div>
                    </div>
                  )}
                  {!r.mediaUrl && !r.adContent && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-400 text-sm border">
                      Nta media yoherejwe
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-4 pt-3 border-t flex gap-2 flex-wrap">
                {r.status === 'new' && (
                  <>
                    {noteId === r._id ? (
                      <div className="w-full space-y-2">
                        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="Ongera icyitonderwa..." />
                        <div className="flex gap-2">
                          <button onClick={() => handleAccept(r._id)} className="btn-primary text-xs flex items-center gap-1.5">
                            <FiCheck size={14}/> Emeza
                          </button>
                          <button onClick={() => { setNoteId(null); setNote(''); }} className="btn-ghost text-xs">Reka</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setNoteId(r._id)} className="btn-primary text-xs flex items-center gap-1.5">
                        <FiCheck size={14}/> Emeza
                      </button>
                    )}
                    {decliningId === r._id ? (
                      <div className="w-full space-y-2">
                        <textarea rows={2} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          placeholder="Impamvu yo kuranza..." />
                        <div className="flex gap-2">
                          <button onClick={() => handleDecline(r._id)} className="btn-danger text-xs flex items-center gap-1.5">
                            <FiX size={14}/> Emeza Kuranza
                          </button>
                          <button onClick={() => { setDecliningId(null); setDeclineReason(''); }} className="btn-ghost text-xs">Reka</button>
                        </div>
                      </div>
                    ) : noteId !== r._id && (
                      <button onClick={() => setDecliningId(r._id)} className="btn-danger text-xs flex items-center gap-1.5">
                        <FiX size={14}/> Ranza
                      </button>
                    )}
                    {/* Create campaign directly from this request */}
                    {noteId !== r._id && decliningId !== r._id && (
                      <button onClick={() => openCampaignModal(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-semibold transition-colors">
                        <FiZap size={13}/> Tanga Itangazo
                      </button>
                    )}
                  </>
                )}
                {/* Delete always visible */}
                <button onClick={() => handleDelete(r._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs rounded-lg transition-colors ml-auto">
                  <FiTrash2 size={13}/> Siba
                </button>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border">
            <FiMail size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nta busabe bubonetse.</p>
          </div>
        )}
      </div>

      {/* ── Create Campaign Modal ── */}
      {campaignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiZap className="text-green-500"/> Tanga Itangazo rishya
              </h2>
              <button onClick={() => setCampaignModal(null)} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="label">Umushoramari *</label>
                <select required value={campaignForm.advertiser}
                  onChange={(e) => setCampaignForm({...campaignForm, advertiser: e.target.value})} className="input">
                  <option value="">Hitamo Umushoramari...</option>
                  {advertisers.map((a) => <option key={a._id} value={a._id}>{a.companyName}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">Niba umushoramari atabonetse, ongera muri <a href="/ads/advertisers" className="text-primary underline">Abatangaza</a>.</p>
              </div>
              <div>
                <label className="label">Izina ry'Itangazo *</label>
                <input required value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})} className="input"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Pacute</label>
                  <select value={campaignForm.package}
                    onChange={(e) => setCampaignForm({...campaignForm, package: e.target.value})} className="input">
                    {['starter','business','premium'].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Aho Rizashyirwa</label>
                  <select value={campaignForm.placement}
                    onChange={(e) => setCampaignForm({...campaignForm, placement: e.target.value})} className="input">
                    {['top_banner','sidebar','homepage','article_inline','footer'].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Itangira *</label>
                  <input required type="date" value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})} className="input"/>
                </div>
                <div>
                  <label className="label">Irangira *</label>
                  <input required type="date" value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})} className="input"/>
                </div>
              </div>

              {/* Ad type selector — pre-filled from request */}
              <div>
                <label className="label">Ubwoko bw'Itangazo</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'image',   label: '🖼️ Ifoto' },
                    { id: 'video',   label: '🎬 Video' },
                    { id: 'content', label: '📝 Inyandiko' },
                  ].map((t) => (
                    <button key={t.id} type="button"
                      onClick={() => setCampaignForm({...campaignForm, adType: t.id, imageUrl: '', videoUrl: '', adContent: ''})}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        campaignForm.adType === t.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image */}
              {campaignForm.adType === 'image' && (
                <div>
                  <label className="label">URL ya Ifoto</label>
                  <input value={campaignForm.imageUrl}
                    onChange={(e) => setCampaignForm({...campaignForm, imageUrl: e.target.value})}
                    className="input" placeholder="https://example.com/ad.jpg"/>
                  {campaignForm.imageUrl && (
                    <img src={campaignForm.imageUrl} alt="preview"
                      className="mt-2 w-full max-h-32 object-cover rounded-lg border"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </div>
              )}

              {/* Video */}
              {campaignForm.adType === 'video' && (
                <div>
                  <label className="label">URL ya Video</label>
                  <input value={campaignForm.videoUrl}
                    onChange={(e) => setCampaignForm({...campaignForm, videoUrl: e.target.value})}
                    className="input" placeholder="https://youtu.be/... cyangwa https://example.com/ad.mp4"/>
                  <p className="text-xs text-gray-400 mt-1">
                    📌 Kuri client video izakina yonyine — autoplay, muted, nta controls.
                  </p>
                  {campaignForm.videoUrl && campaignForm.videoUrl.includes('youtu') && (
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          campaignForm.videoUrl.split('v=')[1]?.split('&')[0] ||
                          campaignForm.videoUrl.split('youtu.be/')[1]?.split('?')[0]
                        }?autoplay=1&mute=1&controls=0&loop=1`}
                        className="w-full h-full" allowFullScreen title="Preview" />
                    </div>
                  )}
                  {campaignForm.videoUrl && !campaignForm.videoUrl.includes('youtu') && (
                    <video src={campaignForm.videoUrl} muted autoPlay loop
                      className="mt-2 w-full max-h-32 rounded-lg border bg-black"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </div>
              )}

              {/* Content */}
              {campaignForm.adType === 'content' && (
                <div>
                  <label className="label">Inyandiko y'Itangazo</label>
                  <textarea rows={3} value={campaignForm.adContent}
                    onChange={(e) => setCampaignForm({...campaignForm, adContent: e.target.value})}
                    className="input" placeholder="Andika ubutumwa bw'itangazo..."/>
                </div>
              )}

              <div>
                <label className="label">URL y'Aho Bajyana *</label>
                <input required value={campaignForm.destinationUrl}
                  onChange={(e) => setCampaignForm({...campaignForm, destinationUrl: e.target.value})}
                  className="input" placeholder="https://..."/>
              </div>
              <div>
                <label className="label">Igiciro (RWF)</label>
                <input type="number" value={campaignForm.priceRwf}
                  onChange={(e) => setCampaignForm({...campaignForm, priceRwf: Number(e.target.value)})} className="input"/>
              </div>
              <div className="flex gap-3 pt-2 border-t">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiZap size={15}/> Shyiraho Itangazo
                </button>
                <button type="button" onClick={() => setCampaignModal(null)} className="btn-ghost">Reka</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
