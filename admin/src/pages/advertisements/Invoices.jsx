import { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const EMPTY = { campaign: '', advertiser: '', amountRwf: '', dueDate: '', notes: '' };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([api.get('/ads/invoices'), api.get('/ads/campaigns'), api.get('/ads/advertisers')])
      .then(([inv, c, a]) => {
        setInvoices(inv.data.data.invoices);
        setCampaigns(c.data.data.campaigns);
        setAdvertisers(a.data.data.advertisers);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ads/invoices', form);
      toast.success('Fagitire yoherejwe!');
      setForm(EMPTY); setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ikibazo.');
    }
  };

  const handlePaid = async (id) => {
    await api.patch(`/ads/invoices/${id}/pay`);
    toast.success('Itishyurwa ryarangiye!'); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iyi fagitire?')) return;
    try {
      await api.delete(`/ads/invoices/${id}`);
      toast.success('Fagitire yasibwe.'); load();
    } catch { toast.error('Gusiba byanze.'); }
  };

  const statusColor = (s) => ({
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-red-100 text-red-600',
    overdue: 'bg-orange-100 text-orange-600',
    cancelled: 'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-600');

  if (loading) return <Loader />;

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amountRwf, 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.amountRwf, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fagitire</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Fagitire Nshya
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4 bg-green-50 border border-green-200">
          <p className="text-xs text-green-600 font-medium uppercase">Yishyuwe</p>
          <p className="text-xl font-bold text-green-700">{totalPaid.toLocaleString()} RWF</p>
        </div>
        <div className="card p-4 bg-red-50 border border-red-200">
          <p className="text-xs text-red-500 font-medium uppercase">Itishyuwe</p>
          <p className="text-xl font-bold text-red-600">{totalUnpaid.toLocaleString()} RWF</p>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Fagitire Nshya</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Umutwe w'Itangazo *</label>
              <select required value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} className="input">
                <option value="">Hitamo...</option>
                {campaigns.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Umushoramari *</label>
              <select required value={form.advertiser} onChange={(e) => setForm({ ...form, advertiser: e.target.value })} className="input">
                <option value="">Hitamo...</option>
                {advertisers.map((a) => <option key={a._id} value={a._id}>{a.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amafaranga (RWF) *</label>
              <input required type="number" value={form.amountRwf} onChange={(e) => setForm({ ...form, amountRwf: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Itariki Yo Kwishyura *</label>
              <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Ibisobanuro</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Ohereza</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Reka</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Numero</th>
              <th className="text-left px-4 py-3 font-semibold">Umushoramari</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Umutwe</th>
              <th className="text-right px-4 py-3 font-semibold">Amafaranga</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Itariki</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">{inv.advertiser?.companyName}</td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">{inv.campaign?.name}</td>
                <td className="px-4 py-3 text-right font-semibold">{inv.amountRwf?.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                  {format(new Date(inv.dueDate), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${statusColor(inv.status)}`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {inv.status === 'unpaid' && (
                      <button onClick={() => handlePaid(inv._id)} title="Emeza Kwishyurwa" className="p-1 text-green-500 hover:text-green-700">
                        <FiCheck size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(inv._id)} title="Siba" className="p-1 text-gray-300 hover:text-red-500">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!invoices.length && <p className="text-center text-gray-500 py-8 text-sm">Nta fagitire zibonetse.</p>}
      </div>
    </div>
  );
}
