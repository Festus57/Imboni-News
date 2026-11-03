import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiBarChart2, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';
import StatsCard from '../../components/StatsCard.jsx';

export default function AdDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/ads/campaigns'),
      api.get('/ads/requests'),
      api.get('/ads/invoices'),
    ])
      .then(([c, r, i]) => {
        setCampaigns(c.data.data.campaigns);
        setRequests(r.data.data.requests);
        setInvoices(i.data.data.invoices);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const active = campaigns.filter((c) => c.status === 'active').length;
  const pending = campaigns.filter((c) => c.status === 'pending').length;
  const newRequests = requests.filter((r) => r.status === 'new').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid').length;

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amountRwf, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Itangazo — Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard label="Itangazo Rigendera" value={active} icon={<FiCheckCircle />} color="bg-green-50 text-green-600" />
        <StatsCard label="Ritegereje Kwemezwa" value={pending} icon={<FiClock />} color="bg-yellow-50 text-yellow-600" />
        <StatsCard label="Ubusabe Bushya" value={newRequests} icon={<FiAlertCircle />} color="bg-red-50 text-red-500" />
        <StatsCard label="Amafaranga Yinjiye (RWF)" value={totalRevenue.toLocaleString()} icon={<FiDollarSign />} color="bg-blue-50 text-blue-600" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Ibikorwa Vuba</h2>
          <div className="space-y-2">
            <Link to="/ads/advertisers" className="btn-ghost btn w-full text-left block">👔 Abatangazisha</Link>
            <Link to="/ads/campaigns" className="btn-ghost btn w-full text-left block">📢 Imitwe y'Itangazo</Link>
            <Link to="/ads/requests" className="btn-ghost btn w-full text-left block">📋 Ubusabe ({newRequests} bushya)</Link>
            <Link to="/ads/invoices" className="btn-ghost btn w-full text-left block">🧾 Fagitire ({unpaidInvoices} itishyuwe)</Link>
          </div>
        </div>

        {/* Recent campaigns */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Imitwe Iheruka</h2>
            <Link to="/ads/campaigns" className="text-xs text-primary hover:underline">Reba Yose →</Link>
          </div>
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((c) => (
              <div key={c._id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.advertiser?.companyName}</p>
                </div>
                <span className={`badge text-xs ${
                  c.status === 'active' ? 'bg-green-100 text-green-700' :
                  c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  c.status === 'expired' ? 'bg-gray-100 text-gray-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
            {!campaigns.length && <p className="text-sm text-gray-500 py-2">Nta mitwe ibonetse.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
