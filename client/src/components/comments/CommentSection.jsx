import { useState, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiCornerDownRight } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

function CommentItem({ comment, articleId, onReplyPosted }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting]     = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      await api.post('/comments', { article: articleId, content: replyText.trim(), parent: comment._id });
      toast.success('Igisubizo cyawe cyakiriwe kandi giri mu gusubirwaho.');
      setReplyText('');
      setShowReply(false);
      onReplyPosted?.();
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {comment.author?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{comment.author?.name || 'Anonymous'}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
          </div>
          {/* Reply button */}
          {user && (
            <button onClick={() => setShowReply((v) => !v)}
              className="text-xs text-gray-400 hover:text-primary mt-1 ml-2 flex items-center gap-1 transition-colors">
              <FiCornerDownRight size={11} /> Subiza
            </button>
          )}
          {/* Reply form */}
          {showReply && (
            <form onSubmit={handleReply} className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Andika igisubizo..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={1000}
                required
              />
              <button type="submit" disabled={posting}
                className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-60 transition-colors">
                <FiSend size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-11 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {reply.author?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0 bg-blue-50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-900">{reply.author?.name}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ articleId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [posting, setPosting]   = useState(false);

  const load = () => {
    api.get('/comments', { params: { article: articleId } })
      .then((res) => setComments(res.data.data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (articleId) load(); }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await api.post('/comments', { article: articleId, content: text.trim() });
      toast.success('Igitekerezo cyawe cyakiriwe kandi giri mu gusubirwaho.');
      setText('');
      load();
    } catch {
      toast.error('Habaye ikosa. Injira kugirango wandike igitekerezo.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-10 border-t pt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <FiMessageSquare size={18} className="text-primary" />
        Ibitekerezo {comments.length > 0 && <span className="text-gray-400 font-normal text-sm">({comments.length})</span>}
      </h3>

      {/* Post form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Andika igitekerezo cyawe..."
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{text.length}/1000</span>
                <button type="submit" disabled={posting || !text.trim()}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
                  <FiSend size={14} /> {posting ? 'Kohereza...' : 'Ohereza'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 bg-gray-50 border rounded-xl p-4 text-sm text-gray-600 text-center">
          <a href="/login" className="text-primary font-semibold hover:underline">Injira</a> kugirango wandike igitekerezo.
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 py-6 text-sm">Nta bitekerezo biriho. Uba uwa mbere!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} articleId={articleId} onReplyPosted={load} />
          ))}
        </div>
      )}
    </div>
  );
}
