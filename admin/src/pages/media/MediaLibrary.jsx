import { useState, useEffect, useRef, useCallback } from 'react';
import { FiUpload, FiTrash2, FiImage, FiVideo, FiMusic, FiCopy, FiCheck, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const TYPE_ICONS = {
  image: <FiImage className="text-blue-400" size={28} />,
  video: <FiVideo className="text-purple-400" size={28} />,
  audio: <FiMusic className="text-green-400" size={28} />,
  document: <FiFile className="text-orange-400" size={28} />,
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  const load = useCallback(() => {
    api.get('/media', { params: typeFilter ? { type: typeFilter } : {} })
      .then((res) => setItems(res.data.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      toast.success(`"${file.name}" yashyizweho!`);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload byanze';
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFileChange = (e) => doUpload(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const copyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item._id);
    toast.success('URL yakopejwe mu clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Urakeneye gusiba iki gikoresho?')) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success('Yasibwe.');
      load();
    } catch { toast.error('Gusiba byanze.'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Ububiko bw'Amafoto n'Amajwi</h1>
        <span className="text-sm text-gray-500">{items.length} ibikorwa</span>
      </div>

      {/* ── Drag & Drop Upload Zone ── */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-red-50' : 'border-gray-300 hover:border-primary bg-gray-50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="media-upload"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">Ohereza... {uploadProgress}%</p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <FiUpload size={36} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              Shyira faili hano cyangwa{' '}
              <label htmlFor="media-upload" className="text-primary font-bold cursor-pointer hover:underline">
                hitamo faili
              </label>
            </p>
            <p className="text-xs text-gray-400">Afata: Ifoto, Video, Audio, PDF • Max 100MB</p>
            <p className="text-xs text-green-600 mt-1 font-medium">✓ Nta API key isdwebwa — files zibitswaho kuri server yawe</p>
          </>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { v: '', l: 'Yose' },
          { v: 'image', l: '🖼 Ifoto' },
          { v: 'video', l: '🎬 Video' },
          { v: 'audio', l: '🎵 Audio' },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setTypeFilter(t.v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              typeFilter === t.v
                ? 'bg-secondary text-white border-secondary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-secondary'
            }`}
          >
            {t.l} {t.v && `(${items.filter((i) => i.type === t.v).length})`}
          </button>
        ))}
      </div>

      {/* ── Media grid ── */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiImage size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-base font-medium text-gray-500">Nta mafoto abonetse</p>
          <p className="text-sm mt-1">Shyiraho faili nshya hejuru</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item._id} className="card p-0 overflow-hidden group">
              {/* Preview area */}
              <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    {TYPE_ICONS[item.type] || TYPE_ICONS.document}
                    <span className="text-xs text-gray-400 uppercase">{item.mimeType?.split('/')[1] || 'file'}</span>
                  </div>
                )}

                {/* Hover overlay with size */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1">
                  <span className="text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                    {formatBytes(item.size)}
                  </span>
                </div>
              </div>

              {/* Info & actions */}
              <div className="p-2">
                <p className="text-xs text-gray-700 font-medium truncate" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>

                {/* Action buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => copyUrl(item)}
                    className={`flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded transition-colors ${
                      copiedId === item._id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 hover:bg-secondary hover:text-white text-gray-600'
                    }`}
                    title="Kopi URL"
                  >
                    {copiedId === item._id ? <FiCheck size={12} /> : <FiCopy size={12} />}
                    {copiedId === item._id ? 'Kopiye!' : 'Kopi URL'}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1 text-red-400 hover:bg-red-50 rounded"
                    title="Siba"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
