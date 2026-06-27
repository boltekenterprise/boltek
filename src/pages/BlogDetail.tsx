import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Calendar, Clock, Share2, BookOpen, Flame } from 'lucide-react';

function formatDate(value: any): string {
  try {
    if (!value) return '';
    const ts = value.seconds ? value.seconds * 1000 : new Date(value).getTime();
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return ''; }
}

function readTime(content?: string, excerpt?: string): string {
  const words = ((content || '') + ' ' + (excerpt || '')).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Safety:       'bg-red-50   text-red-700   border-red-200',
  Training:     'bg-blue-50  text-blue-700  border-blue-200',
  Maintenance:  'bg-green-50 text-green-700 border-green-200',
  Installation: 'bg-amber-50 text-amber-700 border-amber-200',
  Regulation:   'bg-purple-50 text-purple-700 border-purple-200',
};
function categoryColor(cat?: string): string {
  return CATEGORY_COLORS[cat || ''] ?? 'bg-stone-50 text-stone-600 border-stone-200';
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      try {
        const q = query(collection(db, 'blogs'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBlog({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setBlog(null);
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] gap-3 text-stone-400">
            <div className="w-5 h-5 rounded-full border-2 border-t-[#6B1724] border-stone-200 animate-spin" />
            <span className="text-sm font-medium">Loading article…</span>
          </div>
        ) : !blog ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <BookOpen className="w-12 h-12 text-stone-300 mb-4" />
            <h2 className="font-heading font-black text-2xl text-stone-800 mb-2">Article not found</h2>
            <p className="text-stone-500 text-sm mb-6">This article may have been moved or deleted.</p>
            <Link to="/education/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1724] border border-[#6B1724] px-5 py-2.5 rounded-full hover:bg-[#6B1724] hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Articles
            </Link>
          </div>
        ) : (
          <>
            {/* ── Hero image or colour banner ── */}
            {blog.image ? (
              <div className="relative w-full h-[45vh] sm:h-[55vh] overflow-hidden pt-16">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                {/* Back link overlaid on image */}
                <div className="absolute top-20 left-0 right-0 max-w-3xl mx-auto px-6">
                  <Link to="/education/blogs" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> All Articles
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative bg-[#6B1724] h-40 pt-16 overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                <div className="max-w-3xl mx-auto px-6 pt-6 relative">
                  <Link to="/education/blogs" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> All Articles
                  </Link>
                </div>
              </div>
            )}

            {/* ── Article card ── */}
            <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
              {/* Header card that overlaps the banner */}
              <div className={`bg-white rounded-2xl shadow-xl border border-stone-100 p-8 ${blog.image ? '-mt-16 relative z-10' : 'mt-8'}`}>
                {/* Category + meta */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {blog.category && (
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${categoryColor(blog.category)}`}>
                      {blog.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    {readTime(blog.content, blog.excerpt)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-snug mb-4">
                  {blog.title}
                </h1>

                {/* Author row */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#6B1724] flex items-center justify-center text-white">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">BolteK Safety Team</p>
                      <p className="text-xs text-stone-400">Certified Fire Safety Engineers</p>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#6B1724] border border-stone-200 hover:border-[#6B1724]/40 px-3 py-1.5 rounded-full transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>

              {/* ── Article body ── */}
              <div
                className="mt-8 prose prose-stone prose-lg max-w-none
                  prose-headings:font-heading prose-headings:font-black prose-headings:text-stone-900
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-[#6B1724] prose-h2:pl-4
                  prose-h3:text-xl prose-h3:mt-8
                  prose-p:text-stone-600 prose-p:leading-relaxed prose-p:text-[1.05rem]
                  prose-a:text-[#6B1724] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-stone-800
                  prose-ul:my-4 prose-li:text-stone-600 prose-li:my-1
                  prose-blockquote:border-[#6B1724] prose-blockquote:bg-red-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-hr:border-stone-200"
                dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt || '' }}
              />

              {/* ── Footer actions ── */}
              <div className="mt-12 pt-8 border-t border-stone-200 flex items-center justify-between">
                <Link
                  to="/education/blogs"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1724] border border-[#6B1724] px-5 py-2.5 rounded-full hover:bg-[#6B1724] hover:text-white transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" /> All Articles
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-[#6B1724] border border-stone-200 hover:border-[#6B1724]/40 px-5 py-2.5 rounded-full transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" /> Share this article
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
