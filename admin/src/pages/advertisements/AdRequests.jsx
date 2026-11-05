import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCheck, FiX, FiClock, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

export default function AdRequests() {
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [decliningId, setDecliningId]   = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const load = () => {
    api.get('/ads/requests')
      .then((res) => setRequests(res.data.data.requests || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleContact = async (id) => {
    try {
      await api.patch(`/ads/requests/${id}/contact`, {});
      toast.success('Ubusabe bwashyizwe muri Twavuganye.');
      load();
    } catch { toast.error('Gukira byanze.'); }
  };

  const handleDecline = async (id) => {
    try {
      await api.patch(`/ads/requests/${id}/decline`, { reason: declineReason });
      toast.success('Ubusabe buranzwe.');
      setDecliningId(null); setDeclineReason(''); load();
    } catch { toast.error('Kuranza byanze.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iki busabe?')) return;
    try {
      await api.delete(`/ads/requests/${id}`);
      toast.success('Ubusabe busibwe.'); load();
    } catch { toast.error('Gusiba byanze.'); }
  };

  const STATUS = {
    new:       { color: 'bg-red-100 text-red-600',      label: 'Gishya',     icon: <FiClock size={11} /> },
    contacted: { color: 'bg-yellow-100 text-yellow-700', label: 'Byagezweho', icon: <FiMail size={11} /> },
    converting: { color: 'bg-blue-100 text-blue-700', label: 'Birimo gukorwa', icon: <FiClock size={11} /> },
    converted: { color: 'bg-green-100 text-green-700',   label: 'Byemewe',    icon: <FiCheck size={11} /> },
    declined:  { color: 'bg-gray-100 text-gray-500',     label: 'Byaranzwe',  icon: <FiX size={11} /> },
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ubusabe bw'Itangazo</h1>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((r) => {
          const sc = STATUS[r.status] || STATUS.new;
          return (
            <div key={r._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{r.companyName}</h3>
                    <span className={`badge text-xs flex items-center gap-1 ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700 text-xs">{r.requestedPackage}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Umuntu:</span> {r.contactName}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><FiMail size={11} />{r.email}</span>
                    {r.phone && <span className="flex items-center gap-1"><FiPhone size={11} />{r.phone}</span>}
                  </div>
                  {r.message && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-2">{r.message}</p>
                  )}
                  {r.adminNote && (
                    <p className="text-sm text-gray-500 bg-blue-50 rounded p-2 mb-2">
                      <span className="font-medium">Icyo mwaduze:</span> {r.adminNote}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {r.status === 'new' && (
                    <>
                      <button onClick={() => handleContact(r._id)}
                        className="btn-primary text-xs flex items-center gap-1.5">
                        <FiCheck size={14} /> Twavuganye
                      </button>
                      <button onClick={() => setDecliningId(r._id)}
                        className="btn-danger text-xs flex items-center gap-1.5">
                        <FiX size={14} /> Ranza
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(r._id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 self-end" title="Siba">
                    <FiTrash2 size={15} />
                  </button>
                  <p className="text-xs text-gray-400 text-right">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Decline reason form */}
              {decliningId === r._id && (
                <div className="mt-4 border-t pt-4">
                  <label className="label">Impamvu yo Kuranza</label>
                  <textarea rows={2} value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="input mb-2" placeholder="Vuga impamvu..." />
                  <div className="flex gap-2">
                    <button onClick={() => handleDecline(r._id)} className="btn-danger text-sm">
                      Emeza Kuranza
                    </button>
                    <button onClick={() => { setDecliningId(null); setDeclineReason(''); }}
                      className="btn-ghost text-sm">Reka</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!requests.length && (
          <div className="card p-8 text-center text-gray-500">Nta busabe bubonetse.</div>
        )}
      </div>
    </div>
  );
}
