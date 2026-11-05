import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiPhone, FiMapPin, FiSend, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { submitNewsTip } from '../services/newsService.js';

const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rutsiro','Rusizi','Karongi'];

export default function Contact() {
  const [tab, setTab] = useState('contact'); // 'contact' | 'tip'
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', district: '', attachmentUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitNewsTip({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        district: form.district,
        attachmentUrl: form.attachmentUrl,
      });
      setDone(true);
      toast.success(tab === 'tip' ? 'Ikibazo cyawe cyakiriwe!' : 'Ubutumwa bwoherejwe!');
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDone(false);
    setForm({ name: '', email: '', phone: '', subject: '', message: '', district: '', attachmentUrl: '' });
  };

  return (
    <>
      <Helmet><title>Twandikire — Imboni News</title></Helmet>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Twandikire</h1>
        <div className="w-16 h-1 bg-primary mb-6" />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setTab('contact'); setDone(false); }}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              tab === 'contact' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            ✉️ Tuganirira
          </button>
          <button onClick={() => { setTab('tip'); setDone(false); }}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors flex items-center gap-1.5 ${
              tab === 'tip' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <FiAlertCircle size={14} /> Tanga Ikibazo cy'Inkuru
          </button>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
            <div className="text-5xl mb-3">{tab === 'tip' ? '📰' : '✅'}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {tab === 'tip' ? 'Ikibazo cyawe cyakiriwe!' : 'Ubutumwa bwoherejwe!'}
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              {tab === 'tip'
                ? 'Intiti zacu zisuzuma iki kibazo. Tuzakugarukaho iyo bikenewe.'
                : 'Tuzakugarukaho vuba. Murakoze!'}
            </p>
            <button onClick={reset} className="btn-primary">Subira</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8">
            {tab === 'tip' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 flex items-start gap-2 text-sm text-amber-800">
                <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>Tanga ikibazo cy'inkuru — amakuru ashobora kuba afite akamaro. Tuzagenzura tubone niba bishobora gukoreshwa.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amazina</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Amazina (Ntibangombwa)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com" />
                </div>
              </div>

              {tab === 'tip' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefoni</label>
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+250 7xx xxx xxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Akarere</label>
                    <select value={form.district} onChange={(e) => set('district', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">-- Hitamo Akarere --</option>
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tab === 'tip' ? 'Insanganyamatsiko y\'Ikibazo *' : 'Insanganyamatsiko *'}
                </label>
                <input required value={form.subject} onChange={(e) => set('subject', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={tab === 'tip' ? "Urugero: Inkuru y'inzara mu Kayonza..." : "Urugero: Ikibazo cy'itangazo..."} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tab === 'tip' ? 'Gusobanura Ikibazo *' : 'Ubutumwa *'}
                </label>
                <textarea required rows={5} value={form.message} onChange={(e) => set('message', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={tab === 'tip' ? 'Sobanura ikibazo cyawe neza...' : 'Ubutumwa bwawe...'} />
              </div>

              {tab === 'tip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL y'Inyandiko / Ifoto (Ntibangombwa)
                  </label>
                  <input value={form.attachmentUrl} onChange={(e) => set('attachmentUrl', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://drive.google.com/..." />
                  <p className="text-xs text-gray-400 mt-1">Shyira ifoto cyangwa inyandiko ku rubuga maze wandike URL.</p>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                <FiSend size={16} />
                {submitting ? 'Kohereza...' : tab === 'tip' ? 'Ohereza Ikibazo' : 'Ohereza Ubutumwa'}
              </button>
            </form>
          </div>
        )}

        {/* Contact info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-5 space-y-2 text-sm text-gray-600">
          <p className="font-semibold text-gray-900 mb-2">Amakuru yo Kuduhamagarira</p>
          <p className="flex items-center gap-2"><FiMail size={14} className="text-primary flex-shrink-0" /> info@imboni.rw</p>
          <p className="flex items-center gap-2"><FiPhone size={14} className="text-primary flex-shrink-0" /> +250 788 000 000</p>
          <p className="flex items-center gap-2"><FiMapPin size={14} className="text-primary flex-shrink-0" /> Kigali, Rwanda</p>
        </div>
      </div>
    </>
  );
}
