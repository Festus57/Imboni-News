import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulated send — wire to email service or news tip endpoint
    await new Promise((r) => setTimeout(r, 1200));
    toast.success('Ubutumwa bwawe bwoherejwe! Tuzakugarukaho.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <>
      <Helmet><title>Twandikire — Imboni News</title></Helmet>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Twandikire</h1>
        <div className="w-16 h-1 bg-primary mb-6" />

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amazina *</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insanganyamatsiko *</label>
              <input required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubutumwa *</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button type="submit" disabled={submitting} className="w-full btn-primary py-3 font-semibold disabled:opacity-60">
              {submitting ? 'Kohereza...' : 'Ohereza Ubutumwa'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-sm text-gray-600 space-y-1">
          <p>📧 info@imboni.rw</p>
          <p>📞 +250 788 000 000</p>
          <p>📍 Kigali, Rwanda</p>
        </div>
      </div>
    </>
  );
}
