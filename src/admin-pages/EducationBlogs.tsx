"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Clock, ArrowRight, Flame } from 'lucide-react';
import { SAMPLE_BLOGS } from '../lib/seedData';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  image?: string;
  createdAt?: { seconds: number } | any;
}

interface EducationBlogsProps {
  initialBlogs?: Blog[];
}

function formatDate(value: any): string {
  try {
    if (!value) return '';
    const ts = value.seconds ? value.seconds * 1000 : new Date(value).getTime();
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function readTime(excerpt?: string): string {
  const words = (excerpt || '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Safety:        'bg-red-50   text-red-700   border-red-200',
  Training:      'bg-blue-50  text-blue-700  border-blue-200',
  Maintenance:   'bg-green-50 text-green-700 border-green-200',
  Installation:  'bg-amber-50 text-amber-700 border-amber-200',
  Regulation:    'bg-purple-50 text-purple-700 border-purple-200',
};

function categoryColor(cat?: string): string {
  return CATEGORY_COLORS[cat || ''] ?? 'bg-stone-50 text-stone-600 border-stone-200';
}

export default function EducationBlogs({ initialBlogs }: EducationBlogsProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs || []);
  const [loading, setLoading] = useState(!initialBlogs);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Blog));
      setBlogs(items);
      const categories = Array.from(new Set(items.map(b => (b.category || 'Uncategorized').trim())));
      if (categories.includes('Safety')) setSelectedCategory('Safety');
      else if (categories.includes('Regulation')) setSelectedCategory('Regulation');
      else setSelectedCategory(categories[0] || null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBlogs) {
      const categories = Array.from(new Set(initialBlogs.map(b => (b.category || 'Uncategorized').trim())));
      if (categories.includes('Safety')) setSelectedCategory('Safety');
      else if (categories.includes('Regulation')) setSelectedCategory('Regulation');
      else setSelectedCategory(categories[0] || null);
      return;
    }
    fetchBlogs();
  }, [initialBlogs]);

  const handleSeedBlogs = async () => {
    setSeeding(true);
    try {
      for (const sample of SAMPLE_BLOGS) {
        await addDoc(collection(db, 'blogs'), {
          ...sample,
          createdAt: serverTimestamp(),
        });
      }
      alert('Fire safety guides seeded successfully!');
      await fetchBlogs();
    } catch (err) {
      console.error('Error seeding blogs:', err);
      alert('Failed to seed blogs.');
    } finally {
      setSeeding(false);
    }
  };

  const groups: Record<string, Blog[]> = {};
  blogs.forEach(b => {
    const cat = (b.category || 'Uncategorized').trim();
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(b);
  });
  const categories = Object.keys(groups);
  const filtered = selectedCategory ? (groups[selectedCategory] ?? []) : [];

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Navbar />

      {/* ── Hero Banner ── */}
      <div className="relative bg-[#6B1724] overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest uppercase mb-5">
            <Flame className="w-3.5 h-3.5" /> Fire Safety Knowledge Base
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-white leading-tight mb-4">
            Education &amp; Articles
          </h1>
          <p className="text-white/75 text-base max-w-xl mx-auto leading-relaxed">
            Expert insights on fire safety standards, installation guides, and regulation updates — written by our certified engineers.
          </p>
        </div>
      </div>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14">

          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-stone-400">
              <div className="w-5 h-5 rounded-full border-2 border-t-burgundy border-stone-200 animate-spin" />
              <span className="text-sm font-medium">Loading articles…</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm mb-6">No articles published yet. Check back soon.</p>
              <button
                onClick={handleSeedBlogs}
                disabled={seeding}
                className="inline-flex items-center gap-2 bg-[#6B1724] text-white px-6 py-3 rounded-full hover:bg-[#8B1E30] transition-all text-sm font-semibold shadow-md disabled:bg-stone-300"
              >
                {seeding ? 'Seeding...' : 'Seed Premium Fire Safety Guides'}
              </button>
            </div>
          ) : (
            <>
              {/* ── Category Tabs ── */}
              <div className="flex gap-2 flex-wrap mb-10">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-[#6B1724] text-white border-[#6B1724] shadow-md shadow-[#6B1724]/20'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-[#6B1724]/40 hover:text-[#6B1724]'
                    }`}
                  >
                    {cat}
                    <span className={`ml-1.5 text-xs font-bold ${selectedCategory === cat ? 'text-white/70' : 'text-stone-400'}`}>
                      {groups[cat].length}
                    </span>
                  </button>
                ))}
              </div>

              {/* ── Article Grid ── */}
              {selectedCategory && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-6 w-1 rounded-full bg-[#6B1724]" />
                    <h2 className="font-heading font-black text-xl text-stone-900">{selectedCategory}</h2>
                    <span className="text-sm text-stone-400 font-medium">{filtered.length} articles</span>
                  </div>

                  {/* Featured first article */}
                  {filtered.length > 0 && (
                    <Link
                      href={`/education/blogs/${filtered[0].slug}`}
                      className="group block mb-8 rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">
                        {filtered[0].image ? (
                          <div className="md:w-[45%] h-56 md:h-auto overflow-hidden flex-shrink-0">
                            <img
                              src={filtered[0].image}
                              alt={filtered[0].title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ) : (
                          <div className="md:w-[45%] h-56 md:h-auto bg-gradient-to-br from-[#6B1724] to-[#9B1B30] flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-12 h-12 text-white/30" />
                          </div>
                        )}
                        <div className="flex-1 p-7 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColor(filtered[0].category)}`}>
                                {filtered[0].category || 'Article'}
                              </span>
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {readTime(filtered[0].excerpt)}
                              </span>
                            </div>
                            <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 leading-snug mb-3 group-hover:text-[#6B1724] transition-colors">
                              {filtered[0].title}
                            </h3>
                            <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">
                              {filtered[0].excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-5 pt-5 border-t border-stone-100">
                            <span className="text-xs text-stone-400">{formatDate(filtered[0].createdAt)}</span>
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B1724] group-hover:gap-3 transition-all duration-300">
                              Read article <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Remaining articles grid */}
                  {filtered.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtered.slice(1).map(blog => (
                        <Link
                          key={blog.id}
                          href={`/education/blogs/${blog.slug}`}
                          className="group bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                          {blog.image ? (
                            <div className="h-44 overflow-hidden flex-shrink-0">
                              <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="h-44 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-stone-300" />
                            </div>
                          )}

                          <div className="flex flex-col flex-1 p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColor(blog.category)}`}>
                                {blog.category || 'Article'}
                              </span>
                              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {readTime(blog.excerpt)}
                              </span>
                            </div>
                            <h3 className="font-heading font-bold text-base text-stone-900 leading-snug mb-2 group-hover:text-[#6B1724] transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 flex-1">
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                              <span className="text-[10px] text-stone-400">{formatDate(blog.createdAt)}</span>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6B1724] group-hover:gap-2 transition-all duration-300">
                                Read <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          {blogs.length > 0 && (
            <div className="mt-16 text-center border-t border-stone-100 pt-8">
              <button
                onClick={handleSeedBlogs}
                disabled={seeding}
                className="text-xs font-semibold text-stone-400 hover:text-[#6B1724] transition-colors"
              >
                {seeding ? 'Seeding...' : 'Admin: Seed Sample Fire Safety Guides'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
