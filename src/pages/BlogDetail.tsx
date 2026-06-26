import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
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
    fetch();
  }, [slug]);

  const formatDate = (value: any) => {
    try {
      if (!value) return '';
      const ts = value.seconds ? value.seconds * 1000 : new Date(value).getTime();
      return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10">
          {loading ? (
            <div className="py-12 text-center">Loading…</div>
          ) : !blog ? (
            <div className="py-12 text-center">Article not found.</div>
          ) : (
            <article className="prose lg:prose-lg mx-auto">
              <div className="mb-6">
                <Link to="/education/blogs" className="text-sm text-gray-500 hover:underline">← Back to Articles</Link>
              </div>

              {blog.category && (
                <div className="inline-block text-xs font-semibold uppercase text-white bg-burgundy px-2 py-1 rounded mb-3">{blog.category}</div>
              )}

              <h1 className="font-heading font-black text-3xl lg:text-4xl mt-4">{blog.title}</h1>

              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>{formatDate(blog.createdAt)}</span>
                <span>•</span>
                <span>By <strong>Admin</strong></span>
              </div>

              {blog.image ? (
                <div className="mt-6 mb-6">
                  <img src={blog.image} alt={blog.title} className="w-full rounded shadow-sm" />
                </div>
              ) : null}

              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt || '' }} />
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to="/education/blogs" className="text-burgundy font-semibold">← Back to Articles</Link>
                </div>
                <div className="flex items-center gap-3">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="text-sm text-gray-600 hover:text-gray-900">Share</a>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
