import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiYoutube, FiUpload, FiHeadphones, FiInfo, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

const PROVINCES = ['Kigali','Northern','Southern','Eastern','Western'];
const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rutsiro','Rusizi','Karongi'];

// Helper: detect video type from URL
function detectVideoType(url) {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'file';
}

// Helper: extract YouTube embed URL
function getYouTubeEmbed(url) {
  try {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
}

export default function CreateArticle() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  // Video section state
  const [videoTab, setVideoTab] = useState('none'); // 'none' | 'youtube' | 'file'
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState('');

  // Audio info toggle
  const [showAudioInfo, setShowAudioInfo] = useState(false);

  const [form, setForm] = useState({
    title: '', summary: '', content: '',
    titleEn: '', summaryEn: '', contentEn: '',
    category: '', tags: '',
    district: '', province: '',
    featuredImage: '', featuredImageCaption: '',
    videoUrl: '', videoType: '',
    audioUrl: '',
    isBreaking: false, isFeatured: false, isFactCheck: false,
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data.categories)).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // When YouTube URL changes, update preview
  const handleYouTubeChange = (url) => {
    setYoutubeUrl(url);
    const embed = getYouTubeEmbed(url);
    setYoutubePreview(embed);
    if (url) {
      set('videoUrl', url);
      set('videoType', 'youtube');
    } else {
      set('videoUrl', '');
      set('videoType', '');
    }
  };

  // When tab changes, clear video fields
  const handleVideoTabChange = (tab) => {
    setVideoTab(tab);
    setYoutubeUrl('');
    setYoutubePreview('');
    set('videoUrl', '');
    set('videoType', tab === 'none' ? '' : tab);
  };

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    if (!form.title || !form.summary || !form.content || !form.category) {
      toast.error("Uzuza imikono yose ngombwa: Inyito, Incamake, Inkuru, n'Icyiciro.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.titleEn || form.title,
        titleKiny: form.title,
        summary: form.summaryEn || form.summary,
        summaryKiny: form.summary,
        content: form.contentEn || form.content,
        contentKiny: form.content,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        district: form.district,
        province: form.province,
        featuredImage: form.featuredImage,
        featuredImageCaption: form.featuredImageCaption,
        videoUrl: form.videoUrl || '',
        videoType: form.videoType || '',
        audioUrl: form.audioUrl || '',
        isBreaking: form.isBreaking,
        isFeatured: form.isFeatured,
        isFactCheck: form.isFactCheck,
        status: submitStatus || 'draft',
      };
      const res = await api.post('/articles', payload);
      const id = res.data.data.article._id;
      if (submitStatus === 'pending_review') {
        await api.patch(`/articles/${id}/submit`);
      }
      toast.success(submitStatus === 'pending_review' ? 'Inkuru yoherejwe ku musomyi!' : 'Inkuru yabitswe!');
      navigate('/articles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Andika Inkuru Nshya</h1>
        <button
          type="button"
          onClick={() => setShowEnglish(!showEnglish)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            showEnglish ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {showEnglish ? "✓ Icyongereza gishyizweho" : '+ Ongera Icyongereza'}
        </button>
      </div>

      <form className="space-y-6">

        {/* ══════════════════════════════════════
            1. KINYARWANDA — Primary language
        ══════════════════════════════════════ */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <span className="text-lg">🇷🇼</span>
            <h2 className="font-semibold text-gray-900">Andika mu Kinyarwanda</h2>
            <span className="text-xs bg-red-100 text-primary px-2 py-0.5 rounded-full font-medium">Ngombwa</span>
          </div>

          <div>
            <label className="label">Inyito y'Inkuru *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="input text-base"
              required
              placeholder="Andika inyito y'inkuru hano..."
            />
          </div>

          <div>
            <label className="label">Incamake *
              <span className="text-xs text-gray-400 ml-2">({form.summary.length}/500)</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              className="input"
              required
              placeholder="Incamake y'inkuru mu magambo make..."
            />
          </div>

          <div>
            <label className="label">Inkuru Yose *</label>
            <textarea
              rows={14}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              className="input font-mono text-sm leading-relaxed"
              required
              placeholder="Andika inkuru yawe yose hano...&#10;&#10;(Ushobora gukoresha HTML nka <b>bold</b>, <i>italic</i>, <h2>, <p>, <ul><li>...)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Amagambo: {form.content.split(/\s+/).filter(Boolean).length} — Iminota yo gusoma: ~{Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200) || 0} min
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════
            2. ENGLISH — Optional
        ══════════════════════════════════════ */}
        {showEnglish && (
          <div className="card space-y-4 border-l-4 border-l-secondary">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇧</span>
                <h2 className="font-semibold text-gray-900">English Translation</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <button type="button" onClick={() => setShowEnglish(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={16} />
              </button>
            </div>
            <div>
              <label className="label">Title (English)</label>
              <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} className="input" placeholder="Article title in English..." />
            </div>
            <div>
              <label className="label">Summary (English)</label>
              <textarea rows={3} value={form.summaryEn} onChange={(e) => set('summaryEn', e.target.value)} className="input" placeholder="Brief summary in English..." />
            </div>
            <div>
              <label className="label">Content (English)</label>
              <textarea rows={12} value={form.contentEn} onChange={(e) => set('contentEn', e.target.value)} className="input font-mono text-sm" placeholder="Full article content in English..." />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            3. CLASSIFICATION
        ══════════════════════════════════════ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-2">Ikiciro & Akarere</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Icyiciro *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input" required>
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
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="input" placeholder="politiki, amatora, kigali" />
          </div>
        </div>

        {/* ══════════════════════════════════════
            4. FEATURED IMAGE
        ══════════════════════════════════════ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-2">📷 Ifoto Nyamukuru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">URL ya Ifoto</label>
              <input
                value={form.featuredImage}
                onChange={(e) => set('featuredImage', e.target.value)}
                className="input"
                placeholder="https://res.cloudinary.com/..."
              />
              <p className="text-xs text-gray-400 mt-1">Shyiraho ifoto kuri Cloudinary cyangwa undi service, hanyuma winjize URL.</p>
            </div>
            <div>
              <label className="label">Isobanuro ry'Ifoto (Caption)</label>
              <input
                value={form.featuredImageCaption}
                onChange={(e) => set('featuredImageCaption', e.target.value)}
                className="input"
                placeholder="Ifoto igaragaza..."
              />
            </div>
          </div>
          {/* Image preview */}
          {form.featuredImage && (
            <div className="relative mt-2">
              <img
                src={form.featuredImage}
                alt="Preview"
                className="w-full max-h-52 object-cover rounded-lg border border-gray-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => set('featuredImage', '')}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            5. VIDEO
        ══════════════════════════════════════ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-2">🎬 Video y'Inkuru (Ntibangombwa)</h2>

          {/* Video source tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleVideoTabChange('none')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                videoTab === 'none' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nta Video
            </button>
            <button
              type="button"
              onClick={() => handleVideoTabChange('youtube')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                videoTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiYoutube size={16} /> YouTube
            </button>
            <button
              type="button"
              onClick={() => handleVideoTabChange('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                videoTab === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiUpload size={16} /> Video URL (Cloudinary / MP4)
            </button>
          </div>

          {/* YouTube input */}
          {videoTab === 'youtube' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                <strong>Uburyo bwo gukoresha YouTube:</strong><br />
                1. Jya kuri YouTube ubonye videwo yawe<br />
                2. Kanda "Share" ➜ kopi aderesi nka: <code className="bg-red-100 px-1 rounded">https://youtu.be/abc123</code><br />
                3. Uyishyireho hano hasi
              </div>
              <div>
                <label className="label">YouTube URL *</label>
                <input
                  value={youtubeUrl}
                  onChange={(e) => handleYouTubeChange(e.target.value)}
                  className="input"
                  placeholder="https://youtu.be/... cyangwa https://www.youtube.com/watch?v=..."
                />
              </div>
              {/* YouTube preview */}
              {youtubePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <p className="text-xs text-gray-500 px-3 py-1.5 bg-gray-50 border-b">Preview ya YouTube</p>
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={youtubePreview}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube preview"
                    />
                  </div>
                </div>
              )}
              {youtubeUrl && !youtubePreview && (
                <p className="text-sm text-red-500">URL ya YouTube ntabwo iriyo. Suzuma aderesi yongeye.</p>
              )}
            </div>
          )}

          {/* File / Cloudinary URL input */}
          {videoTab === 'file' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                <strong>Uburyo bwo gukoresha Cloudinary / MP4:</strong><br />
                1. Jya kuri <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="underline font-medium">Cloudinary.com</a> (kanda "Sign Up" niba utigeze wiyandikisha — birabura)<br />
                2. Upload video yawe mu "Media Library"<br />
                3. Kopi "URL" ya video, nka: <code className="bg-blue-100 px-1 rounded">https://res.cloudinary.com/.../video.mp4</code><br />
                4. Uyishyireho hano hasi
              </div>
              <div>
                <label className="label">Video URL (MP4 / Cloudinary) *</label>
                <input
                  value={form.videoUrl}
                  onChange={(e) => {
                    set('videoUrl', e.target.value);
                    set('videoType', detectVideoType(e.target.value));
                  }}
                  className="input"
                  placeholder="https://res.cloudinary.com/imboni-news/video/upload/..."
                />
              </div>
              {/* MP4 preview */}
              {form.videoUrl && form.videoType === 'file' && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                  <p className="text-xs text-gray-400 px-3 py-1.5 bg-gray-900 border-b border-gray-700">Preview</p>
                  <video
                    src={form.videoUrl}
                    controls
                    className="w-full max-h-64"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            6. AUDIO
        ══════════════════════════════════════ */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiHeadphones size={18} className="text-green-600" />
              Audio y'Inkuru (Ntibangombwa)
            </h2>
            <button
              type="button"
              onClick={() => setShowAudioInfo(!showAudioInfo)}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <FiInfo size={14} />
              {showAudioInfo ? 'Hisha' : 'Uko bikorwa'}
            </button>
          </div>

          {/* Audio explanation box */}
          {showAudioInfo && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 space-y-2">
              <p className="font-semibold">🎙️ URL y'Audio ivuye he kandi ikoreshwa nte?</p>
              <p>
                <strong>1. Iva he?</strong> — URL y'Audio ivuye ku service igumya amajwi (audio hosting).
                Serivisi nziza zifata amajwi ni:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-green-700">
                <li><strong>Cloudinary</strong> — Shyira audio.mp3 mu "Media Library", kopi URL</li>
                <li><strong>SoundCloud</strong> — Shyiraho igice cy'amajwi, kopi direct link</li>
                <li><strong>AWS S3</strong> — Niba ikigo gifite S3 bucket</li>
                <li><strong>Your own server</strong> — Niba ufite server yawe</li>
              </ul>
              <p>
                <strong>2. Uko URL iboneka:</strong>
                <code className="block bg-green-100 rounded p-2 mt-1 text-xs break-all">
                  https://res.cloudinary.com/imboni-news/video/upload/v1234567890/audio/inkuru-123.mp3
                </code>
              </p>
              <p>
                <strong>3. Uko ikoreshwa:</strong> — Abasomyi basoma inkuru,
                bagafata "Umva Inkuru" button hejuru ya article, bagutera audio ikavuga inkuru yose.
                Iyi feature ifasha inzandiko zitabishoboye no kunyura mu nzira.
              </p>
              <p>
                <strong>Formats ifata:</strong> .mp3, .wav, .ogg, .m4a
              </p>
            </div>
          )}

          <div>
            <label className="label">Audio URL (MP3)</label>
            <input
              value={form.audioUrl}
              onChange={(e) => set('audioUrl', e.target.value)}
              className="input"
              placeholder="https://res.cloudinary.com/.../audio.mp3"
            />
          </div>

          {/* Audio preview */}
          {form.audioUrl && (
            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
              <FiHeadphones className="text-green-400 flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs mb-1 truncate">Preview: {form.audioUrl.split('/').pop()}</p>
                <audio controls className="w-full h-8" src={form.audioUrl}>
                  Mushakisha browser ishobora kuvuga audio.
                </audio>
              </div>
              <button
                type="button"
                onClick={() => set('audioUrl', '')}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            7. FLAGS
        ══════════════════════════════════════ */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 border-b pb-2 mb-4">🏷️ Ibirango</h2>
          <div className="flex gap-6 flex-wrap">
            {[
              { key: 'isBreaking', label: '🔴 Breaking News', desc: 'Amakuru akabije' },
              { key: 'isFeatured', label: '⭐ Featured', desc: "Ishyirwa ku rupapuro rw'ibanze" },
              { key: 'isFactCheck', label: '✅ Fact Check', desc: 'Inkuru yazigamwe' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="rounded text-primary mt-0.5 flex-shrink-0"
                />
                <span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                  <span className="text-xs text-gray-400 block">{desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            8. ACTIONS — Sticky bottom bar
        ══════════════════════════════════════ */}
        <div className="sticky bottom-0 bg-white border-t shadow-md py-3 px-5 -mx-5 flex items-center gap-3 flex-wrap z-10">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            className="btn-ghost disabled:opacity-60 flex items-center gap-2"
          >
            💾 Bika nk'Akahise
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'pending_review')}
            disabled={loading}
            className="btn-secondary disabled:opacity-60 flex items-center gap-2"
          >
            📨 Ohereza ku Musomyi
          </button>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="btn-ghost ml-auto text-gray-500"
          >
            Reka
          </button>

          {/* Status indicator */}
          {loading && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              Kohereza...
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
