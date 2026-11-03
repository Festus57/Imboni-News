import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiYoutube, FiUpload, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

const TYPES = ['news_report','short','interview','sports_highlight','live_replay','documentary'];
const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rutsiro','Rusizi','Karongi'];

export default function UploadVideo() {
  const navigate = useNavigate();
  const { id } = useParams(); // if editing
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoTab, setVideoTab] = useState('youtube'); // 'youtube' | 'file'
  const [youtubePreview, setYoutubePreview] = useState('');

  const [form, setForm] = useState({
    title: '', description: '',
    videoUrl: '', thumbnailUrl: '', type: 'news_report',
    isShort: false, category: '', tags: '', district: '',
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data.categories)).catch(() => {});
    // If editing, load existing video
    if (id) {
      api.get('/videos', { params: { limit: 200 } }).then((res) => {
        const v = res.data.data.videos.find((v) => v._id === id);
        if (v) {
          setForm({
            title: v.title, description: v.description || '',
            videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl || '',
            type: v.type, isShort: v.isShort,
            category: v.category?._id || '', tags: (v.tags || []).join(', '),
            district: v.district || '',
          });
          // Detect type
          if (v.videoUrl.includes('youtube') || v.videoUrl.includes('youtu.be')) {
            setVideoTab('youtube');
            setYoutubePreview(getYouTubeEmbed(v.videoUrl));
          } else {
            setVideoTab('file');
          }
        }
      }).catch(() => {});
    }
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function getYouTubeEmbed(url) {
    try {
      let videoId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('/embed/')) videoId = url.split('/embed/')[1].split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } catch { return ''; }
  }

  const handleYouTubeChange = (url) => {
    set('videoUrl', url);
    setYoutubePreview(getYouTubeEmbed(url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) { toast.error('Inyito na URL ya video ni ngombwa.'); return; }
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      if (id) {
        await api.put(`/videos/${id}`, payload);
        toast.success('Video yahinduwe!');
      } else {
        await api.post('/videos', payload);
        toast.success('Video yashyizweho!');
      }
      navigate('/videos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Urakeneye gusiba iyi video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Video yasibwe.');
      navigate('/videos');
    } catch {
      toast.error('Gusiba byanze.');
    }
  };

  return (
    <div className="max-w-2xl pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? '🎬 Hindura Video' : '🎬 Shyiraho Video Nshya'}
        </h1>
        {id && (
          <button onClick={handleDelete} className="btn-danger flex items-center gap-2 text-sm">
            <FiTrash2 size={14} /> Siba Video
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* Title — Kinyarwanda only */}
        <div>
          <label className="label">Inyito y'Video *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input" required
            placeholder="Andika inyito ya video hano..." />
        </div>

        {/* Description */}
        <div>
          <label className="label">Isobanuro (Ntibangombwa)</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="input"
            placeholder="Sobanura iki iboneka muriyi video..." />
        </div>

        {/* Video source tabs */}
        <div>
          <label className="label">Aho Video Iva *</label>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setVideoTab('youtube')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                videoTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <FiYoutube size={16} /> YouTube
            </button>
            <button type="button" onClick={() => setVideoTab('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                videoTab === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <FiUpload size={16} /> Cloudinary / MP4 URL
            </button>
          </div>

          {/* YouTube input */}
          {videoTab === 'youtube' && (
            <div className="space-y-2">
              <input
                value={form.videoUrl}
                onChange={(e) => handleYouTubeChange(e.target.value)}
                className="input"
                required
                placeholder="https://youtu.be/... cyangwa https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-400">Kanda "Share" kuri YouTube, hanyuma kopi aderesi nka: <code className="bg-gray-100 px-1 rounded">https://youtu.be/abc123</code></p>
              {youtubePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe src={youtubePreview} className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen title="Preview" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File URL input */}
          {videoTab === 'file' && (
            <div className="space-y-2">
              <input
                value={form.videoUrl}
                onChange={(e) => set('videoUrl', e.target.value)}
                className="input"
                required
                placeholder="https://res.cloudinary.com/.../video.mp4"
              />
              <p className="text-xs text-gray-400">Shyiraho video kuri Cloudinary, kopi URL yayo hano. Cyangwa URL ya .mp4 ivuye aho wajyeje.</p>
              {form.videoUrl && !form.videoUrl.includes('youtube') && !form.videoUrl.includes('youtu.be') && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                  <video src={form.videoUrl} controls className="w-full max-h-48" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div>
          <label className="label">URL ya Thumbnail (Ifoto ya Video)</label>
          <input value={form.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} className="input" placeholder="https://..." />
        </div>

        {/* Type & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ubwoko bwa Video</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="input">
              {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Icyiciro</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
              <option value="">-- Hitamo --</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.nameKiny}</option>)}
            </select>
          </div>
        </div>

        {/* District */}
        <div>
          <label className="label">Akarere</label>
          <select value={form.district} onChange={(e) => set('district', e.target.value)} className="input">
            <option value="">-- Hitamo --</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Amagambo Nziza</label>
          <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="input" placeholder="imikino, kigali, interview" />
        </div>

        {/* Short checkbox */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isShort} onChange={(e) => set('isShort', e.target.checked)} className="rounded text-primary" />
          Iyi ni Short (video ndende nka Reels/TikTok)
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60 flex items-center gap-2">
            <FiEdit2 size={16} />
            {loading ? 'Kohereza...' : (id ? 'Bika Impinduka' : 'Shyiraho Video')}
          </button>
          <button type="button" onClick={() => navigate('/videos')} className="btn-ghost">Reka</button>
        </div>
      </form>
    </div>
  );
}
