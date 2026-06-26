import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  image?: string;
  createdAt?: { seconds: number } | any;
}

export default function EducationBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Blog));
        setBlogs(items);
        // choose default category
        const categories = Array.from(new Set(items.map(b => (b.category || 'Uncategorized').trim())));
        if (categories.includes('Safety')) setSelectedCategory('Safety');
        else setSelectedCategory(categories[0] || null);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const groups: Record<string, Blog[]> = {};
  blogs.forEach(b => {
    const cat = (b.category || 'Uncategorized').trim();
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(b);
  });

  const categories = Object.keys(groups);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-black text-3xl">Education — Articles</h1>
            <p className="text-stone-600 mt-2">Browse articles by topic. Click a category like "Safety" to see related posts.</p>
            <div className="mt-4">
              <Link to="/education/blogs" className="inline-block px-4 py-2 bg-burgundy text-white rounded">Read all articles</Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading…</div>
          ) : (
            <div>
              <div className="flex gap-3 flex-wrap mb-6">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCategory === cat ? 'bg-flame-50 text-flame-700 border border-flame-200' : 'bg-white text-gray-700 border border-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {selectedCategory ? (
                <section>
                  <h2 className="font-bold text-xl mb-4">{selectedCategory}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups[selectedCategory]?.map(blog => (
                      <article key={blog.id} className="bg-white p-4 border rounded shadow-sm">
                        {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-40 object-cover rounded mb-3" />}
                        <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
                        <p className="text-sm text-stone-600 mb-3">{blog.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{blog.createdAt ? new Date((blog.createdAt.seconds || 0) * 1000).toLocaleDateString() : ''}</span>
                          <Link to={`/education/blogs/${blog.slug}`} className="text-sm font-bold text-burgundy">Read article</Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="text-center py-12">No categories found.</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
