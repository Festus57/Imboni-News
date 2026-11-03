import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiYoutube, FiUpload, FiHeadphones, FiInfo, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const PROVINCES = ['Kigali','Northern','Southern','Eastern','Western'];
const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rutsiro','Rusizi','Karongi'];

function getYouTubeEmbed(url) {
  try {
    let id = '';
    if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('v=')) id = url.split('v=')[1].split('&')[0];
    else if (url.includes('/embed/')) id = url.split('/embed/')[1].split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : '';
  } catch { return ''; }
}

function detectVideoType(url) {
  if (!url) return '';
  if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
  return 'file';
}

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAudioInfo, setShowAudioInfo] = useState(false);

  // Video state
  const [videoTab, setVideoTab] = useState('none');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState('');

  const [form, setForm] = useState({
    title: '', summary: '', content: '',
    category: '', tags: '', district: '', province: '',
    featuredImage: '', featuredImageCaption: '',
    videoUrl: '', videoType: '',
    audioUrl: '',
    isBreaking: false, isFeatured: false, isFactCheck: false,
    status: 'draft',
  });

  const [originalContent, setOriginalContent] = useState(''); // keeps DB value as fallback

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Load article — fetch directly by ID
  useEffect(() => {
    Promise.all([
      api.get(`/articles/${id}/cms`).catch(() =>
        // fallback: get from cms/all list
        api.get('/articles/cms/all', { params: { limit: 1000 } })
          .then((r) => ({ data: { data: { article: r.data.data.articles.find((a) => a._id === id) } } }))
      ),
      api.get('/categories'),
    ]).then(([artRes, catRes]) => {
      const found = artRes?.data?.data?.article;
      if (found) {
        const contentVal = found.contentKiny || found.content || '';
        setOriginalContent(contentVal);
        setForm({
          title: found.titleKiny || found.title || '',
          summary: found.summaryKiny || found.summary || '',
          content: contentVal,
          category: found.category?._id || found.category || '',
          tags: (found.tags || []).join(', '),
          district: found.district || '',
          province: found.province || '',
          featuredImage: found.featuredImage || '',
          featuredImageCaption: found.featuredImageCaption || '',
          videoUrl: found.videoUrl || '',
          videoType: found.videoType || '',
          audioUrl: found.audioUrl || '',
          isBreaking: found.isBreaking || false,
          isFeatured: found.isFeatured || false,
          isFactCheck: found.isFactCheck || false,
          status: found.status || 'draft',
        });
        // Set video tab
        if (found.videoUrl) {
          const vtype = detectVideoType(found.videoUrl);
          setVideoTab(vtype);
          if (vtype === 'youtube') {
            setYoutubeUrl(found.videoUrl);
            setYoutubePreview(getYouTubeEmbed(found.videoUrl));
          }
        }
      } else {
        toast.error('Inkuru ntiboneka.');
      }
      setCategories(catRes.data.data.categories);
    }).catch(() => toast.error('Kugeraho inkuru byanze.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleYouTubeChange = (url) => {
    setYoutubeUrl(url);
    const embed = getYouTubeEmbed(url);
    setYoutubePreview(embed);
    set('videoUrl', url);
    set('videoType', url ? 'youtube' : '');
  };

  const handleVideoTabChange = (tab) => {
    setVideoTab(tab);
    setYoutubeUrl('');
    setYoutubePreview('');
    set('videoUrl', '');
    set('videoType', tab === 'none' ? '' : tab);
  };

  const handleSave = async (submitStatus) => {
    if (!form.title) {
      toast.error("Inyito y'inkuru ni ngombwa.");
      return;
    }
    setSaving(true);
    try {
      // If user cleared the content field, keep the original DB value — don't wipe it
      const contentToSave = form.content.trim() || originalContent;

      const payload = {
        title: form.title,
        titleKiny: form.title,
        summary: form.summary,
        summaryKiny: form.summary,
        content: contentToSave,
        contentKiny: contentToSave,
        category: form.category || undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        district: form.district || undefined,
        province: form.province || undefined,
        featuredImage: form.featuredImage,
        featuredImageCaption: form.featuredImageCaption,
        videoUrl: form.videoUrl || '',
        videoType: form.videoType || '',
        audioUrl: form.audioUrl || '',
        isBreaking: form.isBreaking,
        isFeatured: form.isFeatured,
        isFactCheck: form.isFactCheck,
      };
      await api.put(`/articles/${id}`, payload);
      if (submitStatus === 'pending_review') {
        await api.patch(`/articles/${id}/submit`);
        toast.success('Inkuru yoherejwe ku musomyi!');
      } else {
        toast.success('Inkuru yahinduwe!');
      }
      navigate('/articles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gutunga byanze.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Urakeneye gusiba iyi nkuru?')) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Inkuru yasibwe.');
      navigate('/articles');
    } catch { toast.error('Gusiba byanze.'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Hindura Inkuru</h1>
          <span className={`badge ${
            form.status === 'published' ? 'bg-green-100 text-green-700' :
            form.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {form.status}
          </span>
        </div>
        <button onClick={handleDelete} className="btn-danger text-xs flex items-center gap-1">
          <FiTrash2 size={13} /> Siba Inkuru
        </button>
      </div>

      <div className="space-y-6">
        {/* ═══ 1. KINYARWANDA ═══ */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <span className="text-lg">🇷🇼</span>
            <h2 className="font-semibold text-gray-900">Andika mu Kinyarwanda</h2>
            <span className="text-xs bg-red-100 text-primary px-2 py-0.5 rounded-full font-medium">Hindura</span>
          </div>

          <div>
            <label className="label">Inyito y'Inkuru</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              className="input text-base" placeholder="Inyito y'inkuru..." />
          </div>
          <div>
            <label className="label">Incamake
              <span className="text-xs text-gray-400 ml-2">({form.summary.length}/500)</span>
            </label>
            <textarea rows={3} maxLength={500} value={form.summary}
              onChange={(e) => set('summary', e.target.value)} className="input"
              placeholder="Incamake mu magambo make..." />
          </div>
          <div>
            <label className="label">Inkuru Yose
              <span className="text-xs text-gray-400 font-normal ml-2">(ntibangombwa)</span>
            </label>
            <textarea rows={14} value={form.content}
              onChange={(e) => set('content', e.target.value)}
              className="input font-mono text-sm leading-relaxed"
              placeholder="Inkuru yose hano..." />
            <p className="text-xs text-gray-400 mt-1">
              Amagambo: {form.content.split(/\s+/).filter(Boolean).length} — ~{Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200) || 0} min yo gusoma
            </p>
          </div>
        </div>

        {/* ═══ 2. CLASSIFICATION ═══ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-2">Ikiciro & Akarere</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Icyiciro</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
                <option value="">-- Hitamo Icyiciro --</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.nameKiny} ({c.name})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Intara</label>
              <select value={form.province} onChange={(e) => set('province', e.target.value)} className="input">
                <option value="">-- Intara --</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Akarere</label>
              <select value={form.district} onChange={(e) => set('district', e.target.value)} className="input">
                <option value="">-- Akarere --</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Amagambo Nziza (teganyanywa n'akabindo)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)}
              className="input" placeholder="politiki, amatora, kigali" />
          </div>
        </div>

        {/* ═══ 3. FEATURED IMAGE ═══ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-2">📷 Ifoto Nyamukuru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">URL ya Ifoto</label>
              <input value={form.featuredImage} onChange={(e) => set('featuredImage', e.target.value)}
                className="input" placeholder="https://..." />
              <p className="text-xs text-gray-400 mt-1">Shyiraho ifoto kuri Cloudinary cyangwa undi service, hanyuma winjize URL.</p>
            </div>
            <div>
              <label className="label">Isobanuro ry'Ifoto (Caption)</label>
              <input value={form.featuredImageCaption} onChange={(e) => set('featuredImageCaption', e.target.value)}
                className="input" placeholder="Ifoto igaragaza..." />
            </div>
          </div>
          {form.featuredImage && (
            <div className="relative">
              <img src={form.featuredImage} alt="Preview"
                className="w-full max-h-48 object-cover rounded-lg border"
                onError={(e) => { e.target.style.display = 'none'; }} />
              <button type="button" onClick={() => set('featuredImage', '')}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ═══ 4. VIDEO ═══ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-2">🎬 Video y'Inkuru (Ntibangombwa)</h2>
          <div className="flex gap-2 flex-wrap">
            {[
              { tab: 'none', label: 'Nta Video', cls: videoTab === 'none' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600' },
              { tab: 'youtube', label: 'YouTube', icon: <FiYoutube size={15}/>, cls: videoTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600' },
              { tab: 'file', label: 'Video URL (MP4)', icon: <FiUpload size={15}/>, cls: videoTab === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600' },
            ].map(({ tab, label, icon, cls }) => (
              <button key={tab} type="button" onClick={() => handleVideoTabChange(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${cls}`}>
                {icon}{label}
              </button>
            ))}
          </div>

          {videoTab === 'youtube' && (
            <div className="space-y-3">
              <input value={youtubeUrl} onChange={(e) => handleYouTubeChange(e.target.value)}
                className="input" placeholder="https://youtu.be/... cyangwa https://www.youtube.com/watch?v=..." />
              {youtubePreview && (
                <div className="rounded-lg overflow-hidden border">
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe src={youtubePreview} className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen title="YouTube preview" />
                  </div>
                </div>
              )}
            </div>
          )}

          {videoTab === 'file' && (
            <div className="space-y-3">
              <input value={form.videoUrl}
                onChange={(e) => { set('videoUrl', e.target.value); set('videoType', 'file'); }}
                className="input" placeholder="https://res.cloudinary.com/.../video.mp4" />
              {form.videoUrl && (
                <video src={form.videoUrl} controls className="w-full max-h-48 rounded-lg bg-black"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
          )}
        </div>

        {/* ═══ 5. AUDIO ═══ */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiHeadphones size={18} className="text-green-600" /> Audio y'Inkuru (Ntibangombwa)
            </h2>
            <button type="button" onClick={() => setShowAudioInfo(!showAudioInfo)}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <FiInfo size={14} /> {showAudioInfo ? 'Hisha' : 'Uko bikorwa'}
            </button>
          </div>
          {showAudioInfo && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 space-y-1">
              <p className="font-semibold">🎙️ URL y'Audio ivuye he?</p>
              <p>Shyira audio.mp3 kuri <strong>Cloudinary</strong> cyangwa server yawe, kopi URL nka:</p>
              <code className="block bg-green-100 rounded p-2 text-xs break-all">
                https://res.cloudinary.com/imboni-news/video/upload/v123/audio/inkuru.mp3
              </code>
              <p className="text-xs text-green-700">Formats: .mp3, .wav, .ogg, .m4a</p>
            </div>
          )}
          <div>
            <label className="label">Audio URL (MP3)</label>
            <input value={form.audioUrl} onChange={(e) => set('audioUrl', e.target.value)}
              className="input" placeholder="https://res.cloudinary.com/.../audio.mp3" />
          </div>
          {form.audioUrl && (
            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
              <FiHeadphones className="text-green-400 flex-shrink-0" size={20} />
              <audio controls className="flex-1 h-8" src={form.audioUrl} />
              <button type="button" onClick={() => set('audioUrl', '')} className="text-gray-400 hover:text-white">
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ═══ 6. FLAGS ═══ */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 border-b pb-2 mb-4">🏷️ Ibirango</h2>
          <div className="flex gap-6 flex-wrap">
            {[
              { key: 'isBreaking', label: '🔴 Breaking News', desc: 'Amakuru akabije' },
              { key: 'isFeatured', label: '⭐ Featured', desc: "Ishyirwa ku rupapuro rw'ibanze" },
              { key: 'isFactCheck', label: '✅ Fact Check', desc: 'Inkuru yazigamwe' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer group">
                <input type="checkbox" checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="rounded text-primary mt-0.5 flex-shrink-0" />
                <span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400 block">{desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ═══ 7. ACTIONS — sticky bottom ═══ */}
        <div className="sticky bottom-0 bg-white border-t shadow-md py-3 px-5 -mx-5 flex items-center gap-3 flex-wrap z-10">
          <button type="button" onClick={() => handleSave('draft')} disabled={saving}
            className="btn-ghost disabled:opacity-60">
            💾 Bika Impinduka
          </button>
          <button type="button" onClick={() => handleSave('pending_review')} disabled={saving}
            className="btn-secondary disabled:opacity-60">
            📨 Ohereza ku Musomyi
          </button>
          <button type="button" onClick={() => navigate('/articles')} className="btn-ghost ml-auto text-gray-500">
            Reka
          </button>
          {saving && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              Kubika...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
