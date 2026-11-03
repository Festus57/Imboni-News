import ReactPlayer from 'react-player';

export default function VideoPlayer({ url, thumbnail }) {
  if (!url) return null;

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        light={thumbnail || true}
        playing={false}
        config={{
          youtube: { playerVars: { showinfo: 1 } },
          file: { attributes: { controlsList: 'nodownload' } },
        }}
      />
    </div>
  );
}
