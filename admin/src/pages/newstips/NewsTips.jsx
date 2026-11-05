import { useState, useEffect } from 'react';
import { FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiLink, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const STATUS_COLOR = {
  new:          'bg-red-100 text-red-600',
  under_review: 'bg-yellow-100 text-yellow-700',
  used:         'bg-green-100 text-green-700',
  dismissed:    'bg-gray-100 text-gray-500',
};
const STATUS_LABEL = {
  new:          'Gishya',
  under_review: 'Irimo Gusuzumwa',
  used:         'Yakoreshejwe',
  dismissed:    'Yaranzwe',
};

export default function NewsTips() {
  const [tips, setTips]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('new');
  const [staff, setStaff]       = useState([]);

  const load = (s = filter) => {
    setLoading(true);
    Promise.all([
      api.get('/newstips', { params: { status: s || undefined } }),
      staff.length ? Promise.resolve({ data: { data: { staff } } }) : api.get('/users/staff'),
    ]).then(([tRes, sRes]) => {
      setTips(tRes.data.data.tips || []);
      if (!staff.length) setStaff(sRes.data.data.staff || []);
    }).catch(() => toast.error('Gufata amakuru byanze.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleUpdate = async (id, updates) => {
    try {
      await api.patch(`/newstips/${id}`, updates);
      toast.success('Byahinduwe.');
      load(filter);
    } catch { toast.error('Byanze.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iki kibazo?')) return;
    try {
      await api.delete(`/newstips/${id}`);
      toast.success('Kibazo kyasibwe.');
      load(filter);
    } catch { toast.error('Gusiba byanze.'); }
  };

  const counts = {
    new:          tips.filter((t) => t.status === 'new').length,
    under_review: tips.filter((t) => t.status === 'under_review').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ikibazo cy'Inkuru</h1>
          <p className="text-sm text-gray-500 mt-0.5">Amakuru yoherejwe n'abasomyi</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">{counts.new} Bishya</span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">{counts.under_review} Birasuzumwa</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { v: 'new',          l: 'Bishya' },
          { v: 'under_review', l: 'Birasuzumwa' },
          { v: 'used',         l: 'Byakoreshejwe' },
          { v: 'dismissed',    l: 'Byaranzwe' },
          { v: '',             l: 'Byose' },
        ].map((t) => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === t.v ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'
            }`}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-gray-900">{tip.subject}</h3>
                  <span className={`badge text-xs ${STATUS_COLOR[tip.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[tip.status] || tip.status}
                  </span>
                  {tip.district && (
                    <span className="badge bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                      <FiMapPin size={10} /> {tip.district}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(tip.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Contact info */}
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 flex items-center gap-1.5">
                    <FiUser size={13} className="text-gray-400 flex-shrink-0" />
                    {tip.name || 'Anonymous'}
                  </p>
                  {tip.email && (
                    <p className="text-gray-700 flex items-center gap-1.5">
                      <FiMail size={13} className="text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${tip.email}`} className="hover:text-primary">{tip.email}</a>
                    </p>
                  )}
                  {tip.phone && (
                    <p className="text-gray-700 flex items-center gap-1.5">
                      <FiPhone size={13} className="text-gray-400 flex-shrink-0" /> {tip.phone}
                    </p>
                  )}
                  {tip.attachmentUrl && (
                    <p className="flex items-center gap-1.5 text-blue-600">
                      <FiLink size={13} className="flex-shrink-0" />
                      <a href={tip.attachmentUrl} target="_blank" rel="noopener noreferrer"
                        className="hover:underline truncate text-xs">Inyandiko / Attachment</a>
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="lg:col-span-2">
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border">
                    {tip.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-4 pt-3 border-t flex gap-3 flex-wrap items-center">
                {/* Status selector */}
                <select
                  value={tip.status}
                  onChange={(e) => handleUpdate(tip._id, { status: e.target.value })}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="new">Gishya</option>
                  <option value="under_review">Irimo Gusuzumwa</option>
                  <option value="used">Yakoreshejwe</option>
                  <option value="dismissed">Yaranzwe</option>
                </select>

                {/* Assign to journalist */}
                <select
                  value={tip.assignedTo?._id || tip.assignedTo || ''}
                  onChange={(e) => handleUpdate(tip._id, { assignedTo: e.target.value || null })}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white flex-1 max-w-xs"
                >
                  <option value="">-- Ohereza ku mukozi --</option>
                  {staff.filter((s) => ['journalist', 'editor', 'admin', 'super_admin'].includes(s.role)).map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                  ))}
                </select>

                {tip.assignedTo && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Nayo: {tip.assignedTo?.name || 'Umukozi'}
                  </span>
                )}

                <button onClick={() => handleDelete(tip._id)}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs rounded-lg transition-colors">
                  <FiTrash2 size={13} /> Siba
                </button>
              </div>
            </div>
          ))}

          {!tips.length && (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400 border">
              <FiAlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Nta makuru yoherejwe abonetse.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
