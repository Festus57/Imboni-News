import ReactPlayer from 'react-player';
import { FiRadio } from 'react-icons/fi';

export default function LiveTVPlayer({ stream }) {
  if (!stream) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex flex-col items-center justify-center rounded-xl text-white gap-3">
        <FiRadio size={48} className="text-gray-600" />
        <p className="text-gray-400 font-medium">Nta gusohora kuri Live ubu.</p>
        <p className="text-xs text-gray-600">Subira ejo cyangwa reba ikarita yo hasi</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg">
      {/* Player wrapper — aspect-video with badge overlaid */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {/* LIVE badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Stream title overlay — bottom */}
        {stream.title && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 pointer-events-none">
            <p className="text-white font-semibold text-sm sm:text-base truncate">{stream.title}</p>
            {stream.description && (
              <p className="text-white/60 text-xs line-clamp-1 mt-0.5">{stream.description}</p>
            )}
          </div>
        )}

        {/* ReactPlayer — fills the padded container */}
        <div className="absolute top-0 left-0 w-full h-full">
          <ReactPlayer
            url={stream.streamUrl}
            width="100%"
            height="100%"
            controls
            playing
            config={{
              youtube: {
                playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
