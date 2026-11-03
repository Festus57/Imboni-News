import { useState, useEffect } from 'react';
import { FiEye, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';
import StatsCard from '../../components/StatsCard.jsx';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [topArticles, setTopArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/dashboard'), api.get('/analytics/top-articles')])
      .then(([s, t]) => { setStats(s.data.data.stats); setTopArticles(t.data.data.articles); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const chartData = topArticles.slice(0, 8).map((a) => ({
    name: a.title.slice(0, 20) + '…',
    views: a.views,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatsCard label="Inkuru Zasohowe" value={stats?.publishedArticles} icon={<FiFileText />} color="bg-blue-50 text-blue-600" />
        <StatsCard label="Ingano y'Ibisomwa" value={stats?.totalViews?.toLocaleString()} icon={<FiEye />} color="bg-green-50 text-green-600" />
        <StatsCard label="Abasomyi" value={stats?.totalReaders} icon={<FiTrendingUp />} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Chart */}
      <div className="card mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Inkuru 8 Zisomwa Cyane</h2>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#E63946" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm">Nta makuru ahagije.</p>
        )}
      </div>

      {/* Top articles table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Inkuru Zisomwa Cyane</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">#</th>
              <th className="text-left px-4 py-2 font-semibold">Inkuru</th>
              <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Umwanditsi</th>
              <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Icyiciro</th>
              <th className="text-right px-4 py-2 font-semibold">Ibisomwa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topArticles.map((a, i) => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 font-mono">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                  <span className="line-clamp-1">{a.title}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{a.author?.name}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{a.category?.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary">{a.views.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!topArticles.length && <p className="text-center text-gray-500 py-8 text-sm">Nta makuru abonetse.</p>}
      </div>
    </div>
  );
}
