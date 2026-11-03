import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiBookmark, FiUsers, FiBell, FiClock, FiMapPin, FiSettings, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api.js';

export default function ReaderDashboard() {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh user data to get latest counts
  const refreshUser = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/auth/me');
      updateUser(res.data.data.user);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const stats = [
    {
      icon: <FiBookmark size={22} />,
      label: 'Ibihungitswe',
      value: user?.savedArticles?.length ?? 0,
      link: '/saved',
      color: 'bg-red-50 text-primary border border-red-100',
      desc: 'Inkuru zabikirwa',
    },
    {
      icon: <FiUsers size={22} />,
      label: 'Abakurikiye',
      value: user?.followedJournalists?.length ?? 0,
      link: '/profile',
      color: 'bg-blue-50 text-blue-600 border border-blue-100',
      desc: 'Abanditsi bakurikiye',
    },
    {
      icon: <FiBell size={22} />,
      label: 'Ibiganiro',
      value: user?.followedTopics?.length ?? 0,
      link: '/profile',
      color: 'bg-green-50 text-green-600 border border-green-100',
      desc: 'Ibiganiro bikunda',
    },
    {
      icon: <FiClock size={22} />,
      label: 'Ahasomye',
      value: user?.readingHistory?.length ?? 0,
      link: '/profile',
      color: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
      desc: 'Inkuru wasomye',
    },
  ];

  return (
    <>
      <Helmet><title>Imboni Yanjye — Imboni News</title></Helmet>

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-secondary to-accent text-white rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Murakaza neza, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-200 text-sm mt-1">Ibi ni aho ubona amakuru akugereranye nawe.</p>
        </div>
        <button
          onClick={refreshUser}
          disabled={refreshing}
          className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          title="Vugurura"
        >
          <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className={`${s.color} rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-all hover:scale-105`}
          >
            <div className="mb-2">{s.icon}</div>
            <div className="text-2xl font-bold leading-none">{s.value}</div>
            <div className="text-xs font-semibold mt-1">{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">{s.desc}</div>
          </Link>
        ))}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          to="/saved"
          className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="bg-red-50 p-3 rounded-xl">
            <FiBookmark size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Inkuru Zabikirwa</h3>
            <p className="text-sm text-gray-500">Reba inkuru zawe zakagitswe</p>
          </div>
          <span className="ml-auto text-sm font-bold text-primary bg-red-50 px-2.5 py-1 rounded-full">
            {user?.savedArticles?.length ?? 0}
          </span>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="bg-blue-50 p-3 rounded-xl">
            <FiSettings size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Hindura Imiterere</h3>
            <p className="text-sm text-gray-500">Ijambo banga, inyungu, akarere</p>
          </div>
        </Link>
      </div>

      {/* Preferred district */}
      {user?.preferredDistrict && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3 text-sm">
            <FiMapPin className="text-primary" /> Akarere Kawe
          </h3>
          <Link
            to={`/akarere/${user.preferredDistrict}`}
            className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors"
          >
            📍 Amakuru ya {user.preferredDistrict} →
          </Link>
        </div>
      )}

      {/* Followed topics */}
      {user?.followedTopics?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <FiBell size={16} className="text-green-600" /> Ibiganiro Bikunda
          </h3>
          <div className="flex gap-2 flex-wrap">
            {user.followedTopics.map((t) => (
              <Link
                key={t._id}
                to={`/category/${t.slug}`}
                className="badge bg-secondary text-white hover:opacity-80 transition-opacity px-3 py-1.5 text-xs"
              >
                {t.nameKiny || t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
