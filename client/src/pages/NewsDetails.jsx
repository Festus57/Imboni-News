import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow, format } from 'date-fns';
import { FiShare2, FiBookmark, FiEye, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getArticle, toggleSave } from '../services/newsService.js';
import { useAuth } from '../context/AuthContext.jsx';
import VideoPlayer from '../components/video/VideoPlayer.jsx';
import AudioPlayer from '../components/audio/AudioPlayer.jsx';
import AdBanner from '../components/ads/AdBanner.jsx';
import SidebarAd from '../components/ads/SidebarAd.jsx';
import TrendingNews from '../components/news/TrendingNews.jsx';
import Loader from '../components/common/Loader.jsx';

// ─── Split raw HTML content into 3 balanced paragraphs ───────────────────────
function ArticleBody({ content }) {
  if (!content) return null;

  // If content already has <p> tags, extract them and group into 3 sections
  const pTagMatches = content.match(/<p[\s\S]*?<\/p>/gi) || [];

  if (pTagMatches.length >= 3) {
    // Group existing <p> tags into 3 sections
    const size = Math.ceil(pTagMatches.length / 3);
    const groups = [
      pTagMatches.slice(0, size).join(''),
      pTagMatches.slice(size, size * 2).join(''),
      pTagMatches.slice(size * 2).join(''),
    ].filter(Boolean);

    return (
      <div className="space-y-6">
        {groups.map((chunk, i) => (
          <div
            key={i}
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: chunk }}
          />
        ))}
      </div>
    );
  }

  // Plain text — split on sentence boundaries into 3 groups
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = plain.match(/[^.!?]+[.!?]+/g) || [plain];
  const size = Math.ceil(sentences.length / 3);
  const groups = [
    sentences.slice(0, size).join(' '),
    sentences.slice(size, size * 2).join(' '),
    sentences.slice(size * 2).join(' '),
  ].filter((g) => g.trim());

  if (groups.length > 0) {
    return (
      <div className="space-y-6">
        {groups.map((g, i) => (
          <p key={i} className="text-gray-800 leading-relaxed text-base">{g.trim()}</p>
        ))}
      </div>
    );
  }

  // Fallback — render as-is
  return (
    <div
      className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default function NewsDetails() {
  const { slug } = useParams();
  const { user, updateUser } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    getArticle(slug)
      .then((res) => {
        const a = res.data.data.article;
        setArticle(a);
        if (user) setSaved(user.savedArticles?.some((s) => s._id === a._id || s === a._id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!user) { toast.error('Injira kugirango ubike!'); return; }
    try {
      await toggleSave(article._id);
      setSaved(!saved);
      toast.success(saved ? 'Ibyaremoye!' : 'Ibitswe neza!');
    } catch {
      toast.error('Habaye ikosa. Ongera ugerageze.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Aderesi yakopwe!');
    }
  };

  if (loading) return <Loader />;
  if (!article) return (
    <div className="text-center py-20 text-gray-500">
      <div className="text-5xl mb-3">😕</div>
      <p>Iyi nkuru ntiboneka.</p>
      <Link to="/" className="btn-primary mt-4 inline-block">Subira Ahabanza</Link>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{article.title} — Imboni News</title>
        <meta name="description" content={article.summary} />
        {article.featuredImage && <meta property="og:image" content={article.featuredImage} />}
      </Helmet>

      <div className="flex gap-6">
        <article className="flex-1 min-w-0">
          {/* Category & flags */}
          <div className="flex gap-2 flex-wrap mb-3">
            {article.category && (
              <Link
                to={`/category/${article.category.slug}`}
                className="badge text-white"
                style={{ backgroundColor: article.category.color || '#E63946' }}
              >
                {article.category.nameKiny}
              </Link>
            )}
            {article.isBreaking && <span className="badge bg-red-600 text-white">Breaking</span>}
            {article.isFactCheck && <span className="badge bg-yellow-500 text-white">Fact Check</span>}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5 pb-5 border-b">
            {article.author && (
              <span className="font-medium text-gray-700">By {article.author.name}</span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <FiClock size={13} />
                {format(new Date(article.publishedAt), 'dd MMM yyyy, HH:mm')}
              </span>
            )}
            <span className="flex items-center gap-1"><FiEye size={13} />{article.views} ibisomwa</span>
            {article.readTime > 0 && <span>⏱ {article.readTime} min</span>}
          </div>

          {/* Featured image */}
          {article.featuredImage && (
            <figure className="mb-5">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full rounded-lg object-cover max-h-96"
              />
              {article.featuredImageCaption && (
                <figcaption className="text-xs text-gray-500 mt-1 text-center">
                  {article.featuredImageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Video player — uses direct videoUrl from article */}
          {(article.videoUrl || article.featuredVideo?.videoUrl) && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">▶ Reba Video ya Raporo</h3>
              <VideoPlayer
                url={article.videoUrl || article.featuredVideo?.videoUrl}
                thumbnail={article.featuredImage}
              />
            </div>
          )}

          {/* Audio player — file audio if provided, otherwise AI voice reader */}
          <div className="mb-5">
            <AudioPlayer
              url={article.audioUrl || null}
              title={article.title}
              content={article.content || article.contentKiny}
            />
          </div>

          {/* Inline ad */}
          <AdBanner placement="article_inline" />

          {/* Article body — split into 3 visible paragraphs */}
          <ArticleBody content={article.content} />

          {/* Share & Save */}
          <div className="flex items-center gap-3 mt-8 pt-5 border-t flex-wrap">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
            >
              <FiShare2 /> Sangira kuri WhatsApp
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded border text-sm transition-colors ${
                saved ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {saved ? <FiBookmark /> : <FiBookmark />}
              {saved ? 'Ibitswe' : 'Bika Inkuru'}
            </button>
          </div>

          {/* Author bio */}
          {article.author?.staffBio && (
            <div className="mt-8 bg-gray-50 rounded-lg p-4 flex gap-4 items-start">
              {article.author.avatar && (
                <img src={article.author.avatar} alt={article.author.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-gray-900">{article.author.name}</p>
                <p className="text-xs text-primary capitalize">{article.author.role?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600 mt-1">{article.author.staffBio}</p>
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <SidebarAd />
          <TrendingNews articles={[]} />
        </aside>
      </div>
    </>
  );
}
