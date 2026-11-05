import { useState, useEffect } from 'react';
import { FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

export default function Readers() {
  const [readers, setReaders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    api.get('/users/readers', { params: { page: p, limit: 20 } })
      .then((res) => { setReaders(res.data.data.readers); setPagination(res.data.data.pagination); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(page), [page]);

  const handleToggle = async (id) => {
    await api.patch(`/users/${id}/toggle-status`);
    toast.success('Status yahinduwe.'); load(page);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Urakeneye guhagarika konti ya ${name}? Amateka azagumaho.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Konti y’umusomyi yahagaritswe.'); load(page);
    } catch { toast.error('Gusiba byanze.'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abasomyi ({pagination.total})</h1>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Amazina</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Imeyili</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Ururimi</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Iyandikishwa</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {readers.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell uppercase text-xs">{u.preferredLanguage}</td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                  {format(new Date(u.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive ? 'Akora' : 'Asiwe Akora'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(u._id)} className="text-gray-400 hover:text-secondary">
                      {u.isActive ? <FiToggleRight size={20} className="text-green-500" /> : <FiToggleLeft size={20} />}
                    </button>
                    <button onClick={() => handleDelete(u._id, u.name)} className="text-gray-300 hover:text-red-500 ml-1">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!readers.length && <p className="text-center text-gray-500 py-8 text-sm">Nta basomyi babonetse.</p>}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded disabled:opacity-40 hover:bg-gray-50">
            <FiChevronLeft />
          </button>
          <span className="text-sm text-gray-600">Urupapuro {page} / {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 border rounded disabled:opacity-40 hover:bg-gray-50">
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
