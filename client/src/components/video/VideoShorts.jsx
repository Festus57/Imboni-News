import { useState } from 'react';
import ReactPlayer from 'react-player';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

export default function VideoShorts({ shorts }) {
  const [current, setCurrent] = useState(0);

  if (!shorts?.length) return (
    <div className="text-center py-16 text-gray-500">Nta shorts zihari ubu.</div>
  );

  const video = shorts[current];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Shorts player — vertical 9/16 */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ width: 360, aspectRatio: '9/16', maxWidth: '100%' }}>
        <ReactPlayer
          key={video._id}
          url={video.videoUrl}
          width="100%"
          height="100%"
          controls
          playing
        />
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white font-semibold text-sm">{video.title}</p>
          {video.uploadedBy && <p className="text-gray-300 text-xs">{video.uploadedBy.name}</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="p-2 rounded-full bg-gray-200 disabled:opacity-30 hover:bg-gray-300 transition-colors"
          aria-label="Previous short"
        >
          <FiChevronUp size={22} />
        </button>
        <span className="text-sm text-gray-600">{current + 1} / {shorts.length}</span>
        <button
          onClick={() => setCurrent((c) => Math.min(shorts.length - 1, c + 1))}
          disabled={current === shorts.length - 1}
          className="p-2 rounded-full bg-gray-200 disabled:opacity-30 hover:bg-gray-300 transition-colors"
          aria-label="Next short"
        >
          <FiChevronDown size={22} />
        </button>
      </div>
    </div>
  );
}
