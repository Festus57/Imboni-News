import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const EMPTY = { companyName: '', contactName: '', email: '', phone: '', website: '', address: '', notes: '' };

export default function Advertisers() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get('/ads/advertisers')
      .then((res) => setAdvertisers(res.data.data.advertisers))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/ads/advertisers/${editing}`, form);
        toast.success('Gutunganywa!');
      } else {
        await api.post('/ads/advertisers', form);
        toast.success('Umushoramari yongeweho!');
      }
      setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    }
  };

  const handleEdit = (a) => {
    setForm({ companyName: a.companyName, contactName: a.contactName, email: a.email, phone: a.phone, website: a.website || '', address: a.address || '', notes: a.notes || '' });
    setEditing(a._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Siba uyu mushoramari?')) return;
    await api.delete(`/ads/advertisers/${id}`);
    toast.success('Yasibwe.'); load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abatangazisha</h1>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
          <FiPlus /> Umushoramari Mushya
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Hindura' : 'Umushoramari Mushya'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Izina ry'Inzego *</label>
              <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Izina ry'Umuntu Bakunganira *</label>
              <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Imeyili *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Telefoni</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Website</label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Aderesi</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Ibisobanuro</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Bika' : 'Ongera'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Reka</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Inzego</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Umuntu Bakunganira</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Contacts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {advertisers.map((a) => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{a.companyName}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{a.contactName}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex gap-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1"><FiMail size={11} />{a.email}</span>
                    {a.phone && <span className="flex items-center gap-1"><FiPhone size={11} />{a.phone}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(a)} className="text-accent hover:text-blue-800"><FiEdit2 size={15} /></button>
                    <button onClick={() => handleDelete(a._id)} className="text-red-400 hover:text-red-700"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!advertisers.length && <p className="text-center text-gray-500 py-8 text-sm">Nta batangazisha babonetse.</p>}
      </div>
    </div>
  );
}
