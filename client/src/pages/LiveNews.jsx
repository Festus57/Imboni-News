import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiRadio, FiClock, FiCalendar } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import LiveTVPlayer from '../components/video/LiveTVPlayer.jsx';
import { getLiveStreams } from '../services/videoService.js';
import Loader from '../components/common/Loader.jsx';

// Status badge config
const STATUS = {
  live:      { label: 'LIVE',        cls: 'bg-red-600 text-white animate-pulse' },
  scheduled: { label: 'Gitegereje',  cls: 'bg-blue-100 text-blue-700' },
  ended:     { label: 'Byarangiye', cls: 'bg-gray-100 text-gray-600' },
};

export default function LiveNews() {
  const [streams, setStreams]  = useState([]);
  const [active, setActive]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveStreams()
      .then((res) => {
        // Server returns newest first (createdAt: -1)
        const s = res.data.data.streams || [];
        setStreams(s);
        // Auto-select: first stream with status=live, otherwise the newest one (index 0)
        const liveNow = s.find((x) => x.status === 'live') || s[0] || null;
        setActive(liveNow);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <Helmet><title>LIVE TV — Imboni News</title></Helmet>

      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse flex-shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Imboni News LIVE</h1>
        {streams.filter((s) => s.status === 'live').length > 0 && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {streams.filter((s) => s.status === 'live').length} Live ubu
          </span>
        )}
      </div>

      {/* Main player */}
      <LiveTVPlayer stream={active} />

      {/* Stream list — newest at TOP, oldest at BOTTOM */}
      {streams.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <FiRadio size={18} className="text-primary" />
            Gusohora Kwose
            <span className="text-sm font-normal text-gray-400 ml-1">({streams.length})</span>
          </h3>

          {/* Grid: newest first (server already sorted createdAt: -1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((s, index) => {
              const st = STATUS[s.status] || STATUS.scheduled;
              const isActive = active?._id === s._id;
              const isNewest = index === 0;

              return (
                <button
                  key={s._id}
                  onClick={() => setActive(s)}
                  className={`rounded-xl overflow-hidden text-left border-2 transition-all hover:shadow-md ${
                    isActive
                      ? 'border-primary shadow-md ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="bg-gray-900 h-36 flex items-center justify-center relative overflow-hidden">
                    {s.thumbnailUrl ? (
                      <img
                        src={s.thumbnailUrl}
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-4xl">📡</span>
                    )}

                    {/* Status badge */}
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${st.cls}`}>
                      {st.label}
                    </span>

                    {/* Newest badge */}
                    {isNewest && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Nshya
                      </span>
                    )}

                    {/* Currently playing indicator */}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <span className="bg-primary/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ▶ Reba ubu
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-white">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{s.title}</p>
                    {s.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{s.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                      {s.scheduledAt && (
                        <span className="flex items-center gap-1">
                          <FiCalendar size={10} />
                          {format(new Date(s.scheduledAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      )}
                      {s.createdAt && (
                        <span className="flex items-center gap-1">
                          <FiClock size={10} />
                          {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {streams.length === 0 && (
        <div className="mt-10 text-center py-16 bg-gray-50 rounded-xl">
          <FiRadio size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-600">Nta gusohora kuri Live ubu</p>
          <p className="text-sm text-gray-400 mt-1">Subira ejo cyangwa reba ibiherezo vya video</p>
        </div>
      )}
    </>
  );
}
