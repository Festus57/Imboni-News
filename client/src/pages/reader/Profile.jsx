import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rutsiro','Rusizi','Karongi'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    preferredLanguage: user?.preferredLanguage || 'rw',
    preferredDistrict: user?.preferredDistrict || '',
    newsletterSubscribed: user?.newsletterSubscribed || false,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data.user);
      toast.success('Imiterere yawe yahinduwe!');
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Amagambo banga ntahura!'); return; }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Ijambo banga ryahinduwe!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Habaye ikosa.');
    } finally {
      setChangingPw(false);
    }
  };

  const pwInputClass = "w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const pwToggle = (show, setShow) => (
    <button type="button" onClick={() => setShow(!show)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      aria-label={show ? 'Hisha' : 'Raga'}>
      {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
    </button>
  );

  return (
    <>
      <Helmet><title>Imiterere — Imboni News</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Imiterere Yanjye</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">Amakuru Yanjye</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amazina</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ibisobanuro</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ururimi</label>
              <select value={form.preferredLanguage} onChange={(e) => setForm({...form, preferredLanguage: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="rw">Kinyarwanda</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Akarere Kawe</label>
              <select value={form.preferredDistrict} onChange={(e) => setForm({...form, preferredDistrict: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">-- Hitamo Akarere --</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.newsletterSubscribed} onChange={(e) => setForm({...form, newsletterSubscribed: e.target.checked})}
                className="rounded text-primary" />
              Injira mu makuru ya email
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 disabled:opacity-60">
              {saving ? 'Kubika...' : 'Bika Impinduka'}
            </button>
          </form>
        </div>

        {/* Password change */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2">Hindura Ijambo Banga</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ijambo Banga rya Kera</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} required value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} className={pwInputClass} />
                {pwToggle(showCurrent, setShowCurrent)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ijambo Banga Rishya</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} required value={pwForm.newPassword}
                  onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} className={pwInputClass} />
                {pwToggle(showNew, setShowNew)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emeza Ijambo Banga</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required value={pwForm.confirm}
                  onChange={(e) => setPwForm({...pwForm, confirm: e.target.value})} className={pwInputClass} />
                {pwToggle(showConfirm, setShowConfirm)}
              </div>
            </div>
            <button type="submit" disabled={changingPw} className="btn-secondary w-full py-2.5 disabled:opacity-60">
              {changingPw ? 'Gutegereza...' : 'Hindura Ijambo Banga'}
            </button>
          </form>

          {/* Account info */}
          <div className="mt-6 pt-4 border-t text-sm text-gray-500 space-y-1">
            <p>📧 {user?.email}</p>
            <p>🏷 Role: <span className="capitalize">{user?.role}</span></p>
          </div>
        </div>
      </div>
    </>
  );
}
