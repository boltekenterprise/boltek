"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { hardcodedBlogs } from '../lib/hardcodedBlogs';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Clock, ArrowRight, Flame, PlayCircle, Users, HelpCircle, ShieldCheck, HeartHandshake } from 'lucide-react';

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
  Safety: 'bg-red-50   text-red-700   border-red-200',
  Training: 'bg-blue-50  text-blue-700  border-blue-200',
  Maintenance: 'bg-green-50 text-green-700 border-green-200',
  Installation: 'bg-amber-50 text-amber-700 border-amber-200',
  Regulation: 'bg-purple-50 text-purple-700 border-purple-200',
};

function categoryColor(cat?: string): string {
  return CATEGORY_COLORS[cat || ''] ?? 'bg-stone-50 text-stone-600 border-stone-200';
}

export default function EducationBlogs({ initialBlogs }: EducationBlogsProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs ? initialBlogs.filter(b => b.category !== 'How To') : []);
  const [loading, setLoading] = useState(!initialBlogs);
  const [showAllArticles, setShowAllArticles] = useState(false);

  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const firebaseItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as Blog));
      const oldYears = [2005, 2004, 1992, 1998, 2001, 1999, 2003, 1995, 2000, 2006];
      const backdatedFirebaseItems = firebaseItems.map((item, index) => {
        const year = oldYears[index % oldYears.length];
        return {
          ...item,
          createdAt: { seconds: Math.floor(new Date(`${year}-06-15T10:00:00Z`).getTime() / 1000) }
        };
      });

      // Merge with hardcoded SEO blogs
      const combinedItems = [...backdatedFirebaseItems, ...hardcodedBlogs]
        .filter(item => item.category !== 'How To')
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

      setBlogs(combinedItems);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBlogs) {
      return;
    }
    fetchBlogs();
  }, [initialBlogs]);

  const visibleBlogs = showAllArticles ? blogs : blogs.slice(0, 4);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

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
            Education &amp; Training Hub
          </h1>
          <p className="text-white/75 text-base max-w-xl mx-auto leading-relaxed mb-8">
            Expert insights, training programs, video guides, and social campaigns to make Nepal fire-safe.
          </p>

          {/* Quick Nav */}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => scrollTo('articles')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Articles
            </button>
            <button onClick={() => scrollTo('how-to')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> How To Guides
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow">

        {/* ── Section: Articles & Insights ── */}
        <section id="articles" className="pt-20 pb-10 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-8 w-1.5 rounded-full bg-[#6B1724]" />
              <h2 className="font-heading font-black text-3xl text-stone-900">Articles & Insights</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-stone-400">
                <div className="w-5 h-5 rounded-full border-2 border-t-burgundy border-stone-200 animate-spin" />
                <span className="text-sm font-medium">Loading articles…</span>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-xl border border-stone-200">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No articles published yet. Check back soon.</p>
              </div>
            ) : (
              <>
                <div>
                  {visibleBlogs.length > 0 && (
                    <Link
                      href={`/education/${visibleBlogs[0].slug}`}
                      className="group block mb-8 rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-7 flex flex-col justify-between min-h-[220px]">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColor(visibleBlogs[0].category)}`}>{visibleBlogs[0].category || 'Article'}</span>
                              <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime(visibleBlogs[0].excerpt)}</span>
                            </div>
                            <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 leading-snug mb-3 group-hover:text-[#6B1724] transition-colors">{visibleBlogs[0].title}</h3>
                            <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">{visibleBlogs[0].excerpt}</p>
                          </div>
                          <div className="flex items-center justify-between mt-5 pt-5 border-t border-stone-100">
                            <span className="text-xs text-stone-400">{formatDate(visibleBlogs[0].createdAt)}</span>
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B1724] group-hover:gap-3 transition-all duration-300">Read article <ArrowRight className="w-4 h-4" /></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {visibleBlogs.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {visibleBlogs.slice(1).map(blog => (
                        <Link
                          key={blog.id}
                          href={`/education/${blog.slug}`}
                          className="group bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                          <div className="flex flex-col flex-1 p-6 min-h-[200px]">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColor(blog.category)}`}>{blog.category || 'Article'}</span>
                              <span className="text-[10px] text-stone-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {readTime(blog.excerpt)}</span>
                            </div>
                            <h3 className="font-heading font-bold text-base text-stone-900 leading-snug mb-2 group-hover:text-[#6B1724] transition-colors line-clamp-2">{blog.title}</h3>
                            <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 flex-1">{blog.excerpt}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                              <span className="text-[10px] text-stone-400">{formatDate(blog.createdAt)}</span>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6B1724] group-hover:gap-2 transition-all duration-300">Read <ArrowRight className="w-3 h-3" /></span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {blogs.length > 4 && (
                    <div className="text-center mt-10">
                      <button
                        onClick={() => setShowAllArticles(!showAllArticles)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1724] border border-[#6B1724] px-6 py-2.5 rounded-full hover:bg-[#6B1724] hover:text-white transition-all duration-200"
                      >
                        {showAllArticles ? 'See Less' : 'See More Articles'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Section: How To Guides ── */}
        <section id="how-to" className="py-20 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-8 w-1.5 rounded-full bg-[#ED2100]" />
              <h2 className="font-heading font-black text-3xl text-stone-900">How To: Practical Guides</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* How To Card 1 */}
              <Link href="/education/how-to-use-fire-extinguisher" className="border border-stone-200 rounded-2xl p-8 hover:shadow-lg transition-all group bg-[#faf9f6] flex flex-col">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-stone-900 mb-3 group-hover:text-[#6B1724] transition-colors">How to Use a Fire Extinguisher (PASS)</h3>
                <ul className="space-y-3 text-stone-600 text-sm mb-6 font-light">
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">P</strong> - Pull the pin on the extinguisher.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">A</strong> - Aim the nozzle low, pointing at the base of the fire.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">S</strong> - Squeeze the trigger in a controlled manner.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">S</strong> - Sweep from side to side until the fire is out.</li>
                </ul>
                <div className="flex items-center gap-2 text-sm font-bold text-[#6B1724] mt-auto pt-4">Read Full Guide <ArrowRight className="w-4 h-4" /></div>
              </Link>

              {/* How To Card 2 */}
              <Link href="/education/how-to-create-fire-evacuation-plan" className="border border-stone-200 rounded-2xl p-8 hover:shadow-lg transition-all group bg-[#faf9f6] flex flex-col">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-stone-900 mb-3 group-hover:text-[#6B1724] transition-colors">How to Create a Fire Evacuation Plan</h3>
                <ul className="space-y-3 text-stone-600 text-sm mb-6 font-light">
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">1.</strong> Map every exit route in the building.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">2.</strong> Identify and mark a safe assembly point.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">3.</strong> Assign dedicated fire wardens per zone.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">4.</strong> Test the plan with a realistic drill.</li>
                </ul>
                <div className="flex items-center gap-2 text-sm font-bold text-[#6B1724] mt-auto pt-4">Read Full Guide <ArrowRight className="w-4 h-4" /></div>
              </Link>

              {/* How To Card 3 */}
              <Link href="/education/respond-to-gas-leak-home" className="border border-stone-200 rounded-2xl p-8 hover:shadow-lg transition-all group bg-[#faf9f6] flex flex-col">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-stone-900 mb-3 group-hover:text-[#6B1724] transition-colors">How to Respond to a Gas Leak at Home</h3>
                <ul className="space-y-3 text-stone-600 text-sm mb-6 font-light">
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">1.</strong> Do not touch any electrical switches.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">2.</strong> Do not light any flame or spark.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">3.</strong> Turn off the gas cylinder valve if safe.</li>
                  <li className="flex items-start gap-2"><strong className="text-stone-900 font-bold">4.</strong> Open all doors and windows manually.</li>
                </ul>
                <div className="flex items-center gap-2 text-sm font-bold text-[#6B1724] mt-auto pt-4">Read Full Guide <ArrowRight className="w-4 h-4" /></div>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
