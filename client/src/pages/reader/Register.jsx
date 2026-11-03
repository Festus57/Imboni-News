import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Amagambo banga ntabwo ahura!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Ijambo banga rigomba kuba rifite inyuguti 6 cyangwa zirenga.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Konti yawe yashyizweho neza!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Iyandikishwa ryanze. Ongera ugerageze.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Iyandikishe — Imboni News</title></Helmet>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold text-primary">IMBONI</span>
              <span className="text-2xl font-bold text-secondary">NEWS</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Fungura Konti Yawe</h1>
            <p className="text-sm text-gray-500 mt-1">Bika inkuru, kurikira ibiganiro, bigenzure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amazina *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Amazina yawe yose" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ijambo Banga *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nibura inyuguti 6"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? 'Hisha' : 'Raga'}>
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emeza Ijambo Banga *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ongera ijambo banga"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? 'Hisha' : 'Raga'}>
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 font-semibold disabled:opacity-60">
              {loading ? 'Gutegereza...' : 'Fungura Konti'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Usanzwe ufite konti?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Injira</Link>
          </p>
        </div>
      </div>
    </>
  );
}
