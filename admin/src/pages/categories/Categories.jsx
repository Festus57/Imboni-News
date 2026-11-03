import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const EMPTY = { name: '', nameKiny: '', description: '', color: '#E63946', order: 0 };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = () => {
    api.get('/categories').then((res) => setCategories(res.data.data.categories)).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form);
        toast.success('Icyiciro cyahinduwe!');
      } else {
        await api.post('/categories', form);
        toast.success('Icyiciro cyashyizweho!');
      }
      setForm(EMPTY);
      setEditing(null);
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo cyabaye.');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, nameKiny: cat.nameKiny, description: cat.description, color: cat.color, order: cat.order });
    setEditing(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Siba iki cyiciro?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Cyasibwe.');
    fetch();
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ibyiciro</h1>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
          <FiPlus /> Icyiciro Gishya
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Hindura Icyiciro' : 'Icyiciro Gishya'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Izina (English) *</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Izina (Kinyarwanda) *</label>
                <input required value={form.nameKiny} onChange={(e) => setForm({...form, nameKiny: e.target.value})} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Isobanuro</label>
              <input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Icara</label>
                <input type="color" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} className="input h-10 p-1 cursor-pointer" />
              </div>
              <div>
                <label className="label">Urutonde</label>
                <input type="number" value={form.order} onChange={(e) => setForm({...form, order: Number(e.target.value)})} className="input" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Bika' : 'Ongera'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Reka</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Icyiciro</th>
              <th className="text-left px-4 py-3 font-semibold">Kinyarwanda</th>
              <th className="text-left px-4 py-3 font-semibold">Icara</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-600">{cat.nameKiny}</td>
                <td className="px-4 py-3">
                  <span className="inline-block w-6 h-6 rounded-full border" style={{ backgroundColor: cat.color }} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(cat)} className="text-accent hover:text-blue-800"><FiEdit2 size={15} /></button>
                    <button onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-700"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
