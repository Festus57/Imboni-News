import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  FiCheckCircle, FiXCircle, FiClock, FiSearch,
  FiChevronLeft, FiChevronRight, FiExternalLink,
  FiImage, FiVideo, FiFileText, FiCalendar,
} from 'react-icons/fi';
import { submitAdRequest } from '../services/adService.js';
import api from '../services/api.js';

// ─── Package + Duration config ────────────────────────────────────────────────
const DURATIONS = [
  { id: '7days',   label: '7 Iminsi',  days: 7  },
  { id: '1month',  label: '1 Ukwezi',  days: 30 },
  { id: '3months', label: '3 Amezi',   days: 90 },
];

const PACKAGES = [
  {
    id: 'starter', name: 'Starter', emoji: '🌱',
    prices: { '7days': '15,000 RWF', '1month': '45,000 RWF', '3months': '120,000 RWF' },
    features: ['Banner — Sidebar', 'Ifoto cyangwa Inyandiko', 'Raporo buri cyumweru'],
  },
  {
    id: 'business', name: 'Business', emoji: '💼', popular: true,
    prices: { '7days': '35,000 RWF', '1month': '90,000 RWF', '3months': '240,000 RWF' },
    features: ['Banner — Homepage na Inkuru', 'Ifoto, Video cyangwa Inyandiko', "Raporo y'ibikorwa", 'Gukura kwa Itangazo'],
  },
  {
    id: 'premium', name: 'Premium', emoji: '🏆',
    prices: { '7days': '70,000 RWF', '1month': '180,000 RWF', '3months': '480,000 RWF' },
    features: ['Aho Baneri Iherereye Hose', 'Ifoto, Video na Inyandiko', "Raporo y'ingenzi buri munsi", 'Gukura + Gushyira Imbere'],
  },
];

const AD_TYPES = [
  { id: 'image',   label: 'Ifoto',     icon: <FiImage size={18} />,    desc: 'Banner ifoto — JPG, PNG, WEBP' },
  { id: 'video',   label: 'Video',     icon: <FiVideo size={18} />,    desc: 'Video — YouTube URL cyangwa MP4' },
  { id: 'content', label: 'Inyandiko', icon: <FiFileText size={18} />, desc: 'Ubutumwa bwanditse gusa' },
];

// Which ad types each package supports
const PACKAGE_AD_TYPES = {
  starter:  ['image'],                    // image only
  business: ['image', 'content'],         // image + content
  premium:  ['image', 'video', 'content'],// all
};

const PLACEMENTS = [
  { id: 'top_banner',     label: 'Banner Hejuru' },
  { id: 'sidebar',        label: 'Inzira y\'Inshuti (Sidebar)' },
  { id: 'homepage',       label: 'Paji Nyamukuru' },
  { id: 'article_inline', label: 'Hagati y\'Inkuru' },
];

const STATUS_CONFIG = {
  new:       { icon: <FiClock />,        label: 'Gitegereje — Tegereza',          color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  contacted: { icon: <FiClock />,        label: 'Twagezeho — Tuganiriye',         color: 'bg-blue-50 border-blue-200 text-blue-700' },
  converted: { icon: <FiCheckCircle />,  label: 'Byemewe — Itangazo ryawe rya hafi!', color: 'bg-green-50 border-green-200 text-green-700' },
  declined:  { icon: <FiXCircle />,      label: 'Byaranzwe',                      color: 'bg-red-50 border-red-200 text-red-600' },
};

// ─── Active Ads Slider ────────────────────────────────────────────────────────
function ActiveAdsSlider() {
  const [ads, setAds] = useState([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/ads/active', { params: { placement: 'top_banner' } }),
      api.get('/ads/active', { params: { placement: 'sidebar' } }),
      api.get('/ads/active', { params: { placement: 'homepage' } }),
      api.get('/ads/active', { params: { placement: 'article_inline' } }),
    ]).then((results) => {
      const all = [];
      results.forEach((r) => {
        (r.data?.data?.campaigns || []).forEach((c) => {
          if (!all.find((a) => a._id === c._id)) all.push(c);
        });
      });
      setAds(all);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % ads.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [ads]);

  if (!ads.length) return (
    <div className="bg-gradient-to-r from-secondary to-accent rounded-xl p-8 text-white text-center">
      <p className="text-lg font-semibold">Nta matangazo agendera ubu</p>
      <p className="text-sm text-white/70 mt-1">Uzabona amatangazo hano iyo ashyizweho</p>
    </div>
  );

  const ad = ads[idx];
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <div className="relative w-full bg-white">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.name} className="w-full h-auto block" style={{ maxHeight: '260px', objectFit: 'cover', width: '100%' }} />
        ) : (
          <div className="bg-gradient-to-r from-secondary via-accent to-secondary text-white p-10 text-center">
            <p className="text-2xl font-bold">{ad.name}</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-lg">{ad.name}</p>
            {ad.advertiser?.companyName && <p className="text-white/70 text-sm">{ad.advertiser.companyName}</p>}
          </div>
          {ad.destinationUrl && (
            <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer"
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-red-700">
              Reba <FiExternalLink size={12} />
            </a>
          )}
        </div>
        {ads.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + ads.length) % ads.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
              <FiChevronLeft size={18} />
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % ads.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
              <FiChevronRight size={18} />
            </button>
          </>
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{idx + 1}/{ads.length}</div>
      </div>
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2 bg-gray-900">
          {ads.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-gray-600'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  companyName: '', contactName: '', email: '', phone: '',
  requestedPackage: 'business', duration: '1month',
  adType: 'image', mediaUrl: '', adContent: '', destinationUrl: '',
  placement: 'top_banner', message: '',
};

export default function AdvertiseWithUs() {
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [checkEmail, setCheckEmail] = useState('');
  const [statusResults, setStatusResults] = useState(null);
  const [checking, setChecking]     = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedPkg      = PACKAGES.find((p) => p.id === form.requestedPackage) || PACKAGES[1];
  const selectedDur      = DURATIONS.find((d) => d.id === form.duration) || DURATIONS[1];
  const currentPrice     = selectedPkg.prices[form.duration];
  const allowedAdTypes   = PACKAGE_AD_TYPES[form.requestedPackage] || ['image'];

  // Auto-reset adType if current selection not allowed by the selected package
  const handlePackageChange = (pkgId) => {
    const allowed = PACKAGE_AD_TYPES[pkgId] || ['image'];
    setForm((f) => ({
      ...f,
      requestedPackage: pkgId,
      adType: allowed.includes(f.adType) ? f.adType : allowed[0],
      mediaUrl: '',
      adContent: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email) {
      toast.error('Uzuza amakuru ngombwa.');
      return;
    }
    if (form.adType !== 'content' && !form.mediaUrl) {
      toast.error('Shyiraho URL ya ifoto cyangwa video.');
      return;
    }
    setSubmitting(true);
    try {
      await submitAdRequest(form);
      setSubmitted(true);
      setSubmittedEmail(form.email);
      toast.success('Ubusabe bwawe bwakiriwe! Tuzakuvugisha vuba.');
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!checkEmail) return;
    setChecking(true);
    try {
      const res = await api.get('/ads/request-status', { params: { email: checkEmail } });
      setStatusResults(res.data.data.requests || []);
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Helmet><title>Tangaza kuri Imboni News</title></Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary to-accent text-white rounded-xl p-8 mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Tangaza kuri Imboni News</h1>
        <p className="text-gray-200 max-w-xl mx-auto text-sm">
          Imboni News igera ku basomyi bose bo mu Rwanda. Itangazo ryawe rizabonwa n'abantu benshi buri munsi.
        </p>
      </div>

      {/* Active Ads Showcase */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-3">📢 Amatangazo Agendera Ubu</h2>
        <p className="text-sm text-gray-500 mb-4">Hano niho itangazo ryawe rizabonekera abasomyi</p>
        <ActiveAdsSlider />
      </div>

      {/* How it works */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 text-center">
        {[
          { n: 1, t: 'Hitamo Pacute', d: 'Hitamo igihe n\'ubwoko bw\'itangazo' },
          { n: 2, t: 'Ohereza Ubusabe', d: "Uzuza impapuro n'amakuru ya itangazo" },
          { n: 3, t: 'Tugenzura', d: 'Umuyobozi asuzuma ubusabe bwawe' },
          { n: 4, t: 'Itangazo Rigendera', d: 'Banner yawe irashyirwa ku rubuga' },
        ].map((s) => (
          <div key={s.n} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">{s.n}</div>
            <h3 className="font-semibold text-gray-900 text-sm">{s.t}</h3>
            <p className="text-xs text-gray-500 mt-1">{s.d}</p>
          </div>
        ))}
      </div>

      {/* ─── Packages ─── */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Amahitamo y'Itangazo</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Hitamo igihe — igiciro cyihindura</p>

        {/* Duration tabs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {DURATIONS.map((d) => (
            <button key={d.id} onClick={() => set('duration', d.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm border-2 transition-all ${
                form.duration === d.id ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
              }`}>
              <FiCalendar size={13} /> {d.label}
            </button>
          ))}
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => {
            const isSelected = form.requestedPackage === pkg.id;
            return (
              <div key={pkg.id} onClick={() => handlePackageChange(pkg.id)}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 flex flex-col cursor-pointer transition-all hover:shadow-md relative ${
                  isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : pkg.popular ? 'border-primary/40' : 'border-gray-200'
                }`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">
                    Byandwa Cyane
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{pkg.emoji}</span>
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                </div>
                <p className="text-3xl font-extrabold text-primary mb-1">{pkg.prices[form.duration]}</p>
                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                  <FiCalendar size={11} /> {selectedDur.label}
                </p>
                <ul className="space-y-2 flex-1 mb-5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className={`w-full py-2 rounded-lg text-center font-semibold text-sm transition-colors ${
                  isSelected ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary hover:text-white'
                }`}>
                  {isSelected ? '✓ Wahisemo' : 'Hitamo'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Ad Type ─── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900">📁 Ubwoko bw'Itangazo</h2>
          {/* Show which types are available for selected package */}
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {selectedPkg.emoji} {selectedPkg.name}: {allowedAdTypes.map((t) => AD_TYPES.find((a) => a.id === t)?.label).join(', ')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {AD_TYPES.map((t) => {
            const isAllowed = allowedAdTypes.includes(t.id);
            const isSelected = form.adType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => isAllowed && set('adType', t.id)}
                disabled={!isAllowed}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all relative ${
                  !isAllowed
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                    : isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 cursor-pointer'
                }`}
              >
                {t.icon}
                <span className="font-semibold text-sm">{t.label}</span>
                <span className="text-xs text-center">{t.desc}</span>
                {!isAllowed && (
                  <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    🔒 Premium
                  </span>
                )}
                {isAllowed && isSelected && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">✓</span>
                )}
              </button>
            );
          })}
        </div>
        {!allowedAdTypes.includes('video') && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 flex items-center gap-2">
            🔒 Video ibonerwa gusa muri <strong>Premium</strong>. Hindura pacute kugirango uyibone.
          </p>
        )}
      </div>

      {/* ─── Placement ─── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📍 Aho Itangazo Rizashyirwa</h2>
        <div className="grid grid-cols-2 gap-3">
          {PLACEMENTS.map((p) => (
            <button key={p.id} onClick={() => set('placement', p.id)}
              className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                form.placement === p.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {form.placement === p.id ? '✓ ' : ''}{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Ad Content / Media ─── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🎨 Ibiriho mu Itangazo</h2>

        {form.adType === 'image' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL ya Ifoto *</label>
              <input value={form.mediaUrl} onChange={(e) => set('mediaUrl', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/itangazo.jpg" />
              <p className="text-xs text-gray-400 mt-1">Formats: JPG, PNG, WEBP. Shyira ifoto ku rubuga maze ukopere URL.</p>
            </div>
            {form.mediaUrl && (
              <img src={form.mediaUrl} alt="Preview" className="w-full rounded-lg object-contain max-h-48 border bg-gray-50"
                onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>
        )}

        {form.adType === 'video' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL ya Video *</label>
              <input value={form.mediaUrl} onChange={(e) => set('mediaUrl', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://youtu.be/... cyangwa https://example.com/video.mp4" />
              <p className="text-xs text-gray-400 mt-1">YouTube URL cyangwa MP4 itaziguye.</p>
            </div>
            {form.mediaUrl && form.mediaUrl.includes('youtube') && (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe src={`https://www.youtube.com/embed/${form.mediaUrl.split('v=')[1]?.split('&')[0] || form.mediaUrl.split('youtu.be/')[1]?.split('?')[0]}`}
                  className="w-full h-full" allowFullScreen title="Preview" />
              </div>
            )}
          </div>
        )}

        {form.adType === 'content' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inyandiko y'Itangazo *</label>
            <textarea rows={4} value={form.adContent} onChange={(e) => set('adContent', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Andika ubutumwa bw'itangazo ryawe hano..." />
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL y'Aho Bajyana (Click-through)</label>
          <input value={form.destinationUrl} onChange={(e) => set('destinationUrl', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://www.website.rw" />
        </div>
      </div>

      {/* ─── Selected summary ─── */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 max-w-3xl mx-auto">
        <h3 className="font-bold text-gray-900 mb-3">📋 Incamake y'Ubusabe Bwawe</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-400">Pacute</p>
            <p className="font-bold text-gray-900">{selectedPkg.emoji} {selectedPkg.name}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-400">Igihe</p>
            <p className="font-bold text-gray-900">{selectedDur.label}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-400">Ubwoko</p>
            <p className="font-bold text-gray-900 capitalize">{AD_TYPES.find((t) => t.id === form.adType)?.label}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-400">Igiciro</p>
            <p className="font-bold text-primary text-lg">{currentPrice}</p>
          </div>
        </div>
      </div>

      {/* ─── Contact Form ─── */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center max-w-2xl mx-auto mb-12">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-gray-900">Ubusabe bwawe bwakiriwe!</h3>
          <p className="text-gray-600 mt-2">Tuzakuvugisha kuri <strong>{submittedEmail}</strong> vuba.</p>
          <p className="text-sm text-gray-500 mt-1">
            Pacute: <strong>{selectedPkg.name}</strong> — {selectedDur.label} — {currentPrice}
          </p>
          <button onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }} className="btn-primary mt-5">
            Ohereza Ubundi Busabe
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">📬 Amakuru Yawe</h2>
          <p className="text-sm text-gray-500 mb-6">Uzuza amazina n'aderesi kugirango tukuvugishe.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izina ry'Ikigo *</label>
                <input name="companyName" value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amazina yawe *</label>
                <input name="contactName" value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" value={form.email}
                  onChange={(e) => set('email', e.target.value)} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefoni</label>
                <input name="phone" value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubutumwa Bwongeye</label>
              <textarea name="message" value={form.message}
                onChange={(e) => set('message', e.target.value)} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Amakuru yongeye..." />
            </div>

            {/* Summary in form */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p>📦 <strong>{selectedPkg.name}</strong> — {selectedDur.label} — <span className="text-primary font-bold">{currentPrice}</span></p>
              <p>📍 {PLACEMENTS.find((p) => p.id === form.placement)?.label} · {AD_TYPES.find((t) => t.id === form.adType)?.label}</p>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
              {submitting ? 'Kohereza...' : '📨 Ohereza Ubusabe Bwose'}
            </button>
          </form>
        </div>
      )}

      {/* ─── Status Check ─── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-12 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-2">🔍 Reba Status y'Ubusabe Bwawe</h2>
        <p className="text-sm text-gray-500 mb-4">Andika email yawe ubone ko bimeze bite.</p>
        <form onSubmit={handleCheckStatus} className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="email" value={checkEmail} onChange={(e) => setCheckEmail(e.target.value)} required
              className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="email@example.com" />
          </div>
          <button type="submit" disabled={checking} className="btn-secondary px-5 disabled:opacity-60">
            {checking ? '...' : 'Reba'}
          </button>
        </form>
        {statusResults && (
          <div className="mt-5 space-y-3">
            {statusResults.length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">Nta busabe bubonetse kuri iyi email.</p>
            ) : statusResults.map((req, i) => {
              const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.new;
              return (
                <div key={i} className={`border-2 rounded-xl p-4 ${sc.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{sc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{sc.label}</p>
                      <p className="text-xs mt-0.5">
                        {req.companyName} — <span className="capitalize">{req.requestedPackage}</span>
                        {req.duration && <> · {DURATIONS.find((d) => d.id === req.duration)?.label}</>}
                      </p>
                      {req.adminNote && <p className="text-xs mt-1 italic">"{req.adminNote}"</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
