import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiVideo, FiUsers, FiDollarSign, FiEye, FiClock, FiGlobe, FiUserCheck } from 'react-icons/fi';
import StatsCard from '../../components/StatsCard.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const s = stats?.stats || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* ── Visitor banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-secondary to-gray-800 text-white rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white/10 rounded-full p-3 flex-shrink-0"><FiGlobe size={22} /></div>
          <div>
            <p className="text-xs text-white/60 uppercase font-semibold">Visitors Today</p>
            <p className="text-3xl font-extrabold">{(s.siteVisitorsToday || 0).toLocaleString()}</p>
            <p className="text-xs text-white/50">Unique IP addresses</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white/10 rounded-full p-3 flex-shrink-0"><FiUsers size={22} /></div>
          <div>
            <p className="text-xs text-white/60 uppercase font-semibold">All Visitors (Total)</p>
            <p className="text-3xl font-extrabold">{(s.siteVisitorsTotal || 0).toLocaleString()}</p>
            <p className="text-xs text-white/50">Since server start</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-700 to-green-900 text-white rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white/10 rounded-full p-3 flex-shrink-0"><FiUserCheck size={22} /></div>
          <div>
            <p className="text-xs text-white/60 uppercase font-semibold">Registered Readers</p>
            <p className="text-3xl font-extrabold">{(s.totalReaders || 0).toLocaleString()}</p>
            <p className="text-xs text-white/50">Have accounts</p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard label="Inkuru Zose"       value={s.totalArticles}           icon={<FiFileText />}   color="bg-blue-50 text-blue-600" />
        <StatsCard label="Inkuru Zasohowe"   value={s.publishedArticles}       icon={<FiFileText />}   color="bg-green-50 text-green-600" />
        <StatsCard label="Zitegereje"         value={s.pendingReview}           icon={<FiClock />}      color="bg-yellow-50 text-yellow-600" />
        <StatsCard label="Videos"             value={s.totalVideos}             icon={<FiVideo />}      color="bg-purple-50 text-purple-600" />
        <StatsCard label="Abakozi ba CMS"     value={s.totalStaff}             icon={<FiUsers />}      color="bg-indigo-50 text-indigo-600" />
        <StatsCard label="Itangazo Rigendera" value={s.activeCampaigns}         icon={<FiDollarSign />} color="bg-orange-50 text-orange-600" />
        <StatsCard label="Ubusabe Bushya"     value={s.newAdRequests}           icon={<FiDollarSign />} color="bg-red-50 text-red-600" />
        <StatsCard label="Ibisomwa Byose"     value={s.totalViews?.toLocaleString()} icon={<FiEye />}  color="bg-teal-50 text-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent articles */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Inkuru Zasohowe Vuba</h2>
            <Link to="/articles" className="text-xs text-primary hover:underline">Reba Zose →</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentArticles?.map((a) => (
              <div key={a._id} className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <Link to={`/articles/${a._id}/edit`}
                    className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-1">
                    {a.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {a.author?.name} — {a.category?.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {a.publishedAt ? format(new Date(a.publishedAt), 'dd MMM') : ''}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <FiEye size={11} />{a.views}
                  </p>
                </div>
              </div>
            ))}
            {!stats?.recentArticles?.length && (
              <p className="text-sm text-gray-500 text-center py-4">Nta nkuru zabonetse.</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Ibikorwa Vuba</h2>
          <div className="space-y-2">
            {[
              { to: '/articles/create', label: '✍️ Andika Inkuru Nshya', color: 'btn-primary' },
              { to: '/articles/review', label: '✅ Suzuma Inkuru',        color: 'btn-secondary' },
              { to: '/videos/upload',   label: '🎬 Shyiraho Video',       color: 'btn-ghost' },
              {
                to: '/ads/kwamamaza',
                label: `📢 Ubusabe Bushya${s.newAdRequests > 0 ? ` (${s.newAdRequests})` : ''}`,
                color: s.newAdRequests > 0 ? 'btn-danger' : 'btn-ghost',
              },
              { to: '/ads/campaigns',   label: '📊 Gucunga Itangazo',    color: 'btn-ghost' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className={`btn ${item.color} w-full text-left block`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
