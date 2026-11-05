import { useState, useEffect } from 'react';
import { FiPlus, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLES = ['admin', 'editor', 'journalist', 'photographer', 'video_editor', 'ad_manager'];
const EMPTY = { name: '', email: '', password: '', role: 'journalist', staffBio: '' };

export default function StaffUsers() {
  const { user } = useAuth();
  const availableRoles = user?.role === 'super_admin' ? ROLES : ROLES.filter((role) => role !== 'admin');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get('/users/staff').then((res) => setStaff(res.data.data.staff)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/staff', form);
      toast.success('Umukozi woshyizweho!');
      setForm(EMPTY); setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo.');
    }
  };

  const handleToggle = async (id) => {
    await api.patch(`/users/${id}/toggle-status`);
    toast.success('Status yahinduwe.'); load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Urakeneye guhagarika konti ya ${name}? Amateka azagumaho.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Konti y’umukozi yahagaritswe.'); load();
    } catch { toast.error('Gusiba byanze.'); }
  };

  const roleColor = (r) => ({
    super_admin: 'bg-red-100 text-red-700',
    admin: 'bg-purple-100 text-purple-700',
    editor: 'bg-blue-100 text-blue-700',
    journalist: 'bg-green-100 text-green-700',
    photographer: 'bg-yellow-100 text-yellow-700',
    video_editor: 'bg-pink-100 text-pink-700',
    ad_manager: 'bg-orange-100 text-orange-700',
  }[r] || 'bg-gray-100 text-gray-600');

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abakozi ba CMS</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Umukozi Mushya
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Umukozi Mushya</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Amazina *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Imeyili *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Ijambobanga *</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" minLength={8} />
            </div>
            <div>
              <label className="label">Uruhare</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
                {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio y'Umukozi</label>
              <textarea value={form.staffBio} onChange={(e) => setForm({ ...form, staffBio: e.target.value })} className="input" rows={2} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Ongera</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Reka</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Amazina</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Imeyili</th>
              <th className="text-left px-4 py-3 font-semibold">Uruhare</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Yinjiriye Ubwa Nyuma</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${roleColor(u.role)}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                  {u.lastLogin ? format(new Date(u.lastLogin), 'dd/MM/yyyy HH:mm') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive ? 'Akora' : 'Asiwe Akora'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {u.role !== 'super_admin' && (
                      <button onClick={() => handleToggle(u._id)} title="Hindura Status" className="text-gray-400 hover:text-secondary">
                        {u.isActive ? <FiToggleRight size={20} className="text-green-500" /> : <FiToggleLeft size={20} />}
                      </button>
                    )}
                    {u.role !== 'super_admin' && (
                      <button onClick={() => handleDelete(u._id, u.name)} title="Hagarika konti" className="text-gray-300 hover:text-red-500 ml-1">
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!staff.length && <p className="text-center text-gray-500 py-8 text-sm">Nta bakozi babonetse.</p>}
      </div>
    </div>
  );
}
