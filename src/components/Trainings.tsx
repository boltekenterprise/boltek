"use client";
import { useEffect, useRef, useState } from 'react';
import { PlayCircle, BookOpen, Share2, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface TrainingProject {
  id: string;
  title: string;
  client: string;
  date: string;
  image: string;
  images?: string[];
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: string;
}
export default function Trainings() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [pastTrainings, setPastTrainings] = useState<TrainingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestBlog, setLatestBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const q = query(
          collection(db, 'portfolio_projects'),
          where('category', '==', 'training')
        );
        const snap = await getDocs(q);
        // Map and sort in memory if needed, or rely on simple query
        const fetched = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as TrainingProject[];
        
        // Sort by newest first (assuming string dates or just reverse order)
        setPastTrainings(fetched.slice(0, 3)); // show top 3 on homepage
      } catch (err) {
        console.error('Error fetching trainings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  useEffect(() => {
    const fetchLatestBlog = async () => {
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setLatestBlog({ id: snap.docs[0].id, ...snap.docs[0].data() } as BlogItem);
        }
      } catch (err) {
        console.error('Error fetching latest blog:', err);
      }
    };
    fetchLatestBlog();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="education" ref={sectionRef} className="min-h-screen py-20 bg-transparent text-stone-900 border-t border-burgundy/10">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
            <span className="text-[#6B1724] text-xs font-bold uppercase tracking-[0.25em] font-heading">
              Our Educational Mission
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-stone-900 mt-3 mb-5 leading-[1.15]">
              Spreading Fire <span className="text-[#6B1724]">Safety Awareness</span>
            </h2>
            <div className="section-divider mx-auto mb-5" />
            <p className="text-stone-600 text-base leading-relaxed font-light">
              BolteK is committed to building a fire-safe nation. Through corporate workshops, public tutorials, community campaigns, and expert articles, we empower individuals to prevent, respond to, and mitigate fire hazards.
            </p>
          </div>

          {/* Grid for the 4 Educational Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-on-scroll">
              
              {/* Pillar 1: Writing Blog Posts */}
              <div className="bg-white p-8 border border-burgundy/10 shadow-[0_4px_20px_rgba(107,23,36,0.04)] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between rounded-xl">
                <div>
                  <div className="w-14 h-14 bg-burgundy/5 flex items-center justify-center mb-6 text-[#6B1724] group-hover:bg-[#6B1724] group-hover:text-white transition-colors rounded-lg">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-2xl text-stone-900 mb-3">1. Safety Blogs & Articles</h4>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                    We write regular, in-depth guides covering NFPA standards, Nepal Building Codes, fire protection compliance, and daily safety tips.
                  </p>
                  
                  {/* Latest Blog Card Integration */}
                  {latestBlog && (
                    <div className="border border-stone-100 bg-[#fbfbf9] p-4 rounded-lg mb-6 group-hover:border-burgundy/20 transition-all">
                      <div className="flex gap-4">
                        {latestBlog.image && (
                          <img src={latestBlog.image} alt={latestBlog.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                        )}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ED2100]">Latest Post</span>
                          <h5 className="font-semibold text-sm text-stone-900 line-clamp-1 mb-1">{latestBlog.title}</h5>
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{latestBlog.excerpt}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Link href="/education/blogs" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ED2100] hover:text-[#6B1724] transition-colors mt-4">
                  Read Articles <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Pillar 2: Training People */}
              <div className="bg-white p-8 border border-burgundy/10 shadow-[0_4px_20px_rgba(107,23,36,0.04)] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between rounded-xl">
                <div>
                  <div className="w-14 h-14 bg-burgundy/5 flex items-center justify-center mb-6 text-[#6B1724] group-hover:bg-[#6B1724] group-hover:text-white transition-colors rounded-lg">
                    <ShieldAlert className="w-7 h-7 text-[#ED2100]" />
                  </div>
                  <h4 className="font-heading font-bold text-2xl text-stone-900 mb-3">2. Fire Safety Trainings</h4>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                    We conduct structured corporate and community training programs covering fire extinguisher operations, exit routes mapping, and safety drills.
                  </p>
                  
                  <div className="bg-stone-50 p-4 rounded-lg text-xs text-stone-600 mb-4 space-y-2">
                    <div className="flex items-center gap-2">✓ Evacuation Drill Orchestration</div>
                    <div className="flex items-center gap-2">✓ First Responder Certified Training</div>
                    <div className="flex items-center gap-2">✓ Hands-on Extinguisher Operations</div>
                  </div>
                </div>
                
                <Link href="/education/trainings" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ED2100] hover:text-[#6B1724] transition-colors mt-4">
                  Explore Training details <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Pillar 3: Videos & Tutorials */}
              <div className="bg-white p-8 border border-burgundy/10 shadow-[0_4px_20px_rgba(107,23,36,0.04)] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between rounded-xl">
                <div>
                  <div className="w-14 h-14 bg-burgundy/5 flex items-center justify-center mb-6 text-[#6B1724] group-hover:bg-[#6B1724] group-hover:text-white transition-colors rounded-lg">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-2xl text-stone-900 mb-3">3. Videos & Tutorials</h4>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                    Short tutorials, maintenance guidance, and simulation videos visualising immediate safety measures, evacuation protocols, and product operations.
                  </p>
                  
                  <div className="bg-stone-50 p-4 rounded-lg text-xs text-stone-600 mb-4 space-y-2">
                    <div className="flex items-center gap-2">▶ How to Operate a Fire Extinguisher (PASS Method)</div>
                    <div className="flex items-center gap-2">▶ Maintain Hydrants & Sprinkler Networks</div>
                  </div>
                </div>
                
                <Link href="/education/videos" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ED2100] hover:text-[#6B1724] transition-colors mt-4">
                  Watch Video Library <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Pillar 4: Making Community */}
              <div className="bg-[#6B1724] p-8 shadow-[0_4px_20px_rgba(107,23,36,0.1)] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between text-white rounded-xl">
                <div>
                  <div className="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-white group-hover:bg-white group-hover:text-[#6B1724] transition-colors rounded-lg">
                    <Share2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-2xl mb-3">4. Community Campaigns</h4>
                  <p className="text-sm text-white/80 mb-6 leading-relaxed">
                    Promoting community-driven campaigns to make neighborhoods safer. Share safety advice, participate in neighborhood drills, and join awareness groups.
                  </p>
                  
                  <div className="bg-white/5 p-4 rounded-lg text-xs text-white/90 mb-4 space-y-2">
                    <div>📢 Safety campaigns on local media</div>
                    <div>🤝 Evacuation safety support groups</div>
                  </div>
                </div>
                
                <Link href="/education/social" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-ivory transition-colors mt-4">
                  Join Campaigns <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

          </div>

          {/* Past Trainings Section (Hidden on Homepage) */}
          {!isHomePage && (
            <div className="mt-20 animate-on-scroll">
              <div className="flex items-center justify-between mb-8 border-b border-burgundy/10 pb-4">
                <h3 className="font-heading font-bold text-2xl text-stone-900 flex items-center gap-3">
                  <ShieldAlert className="w-8 h-8 text-[#ED2100]" />
                  Recent Public & Corporate Drills
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-3 text-center py-10">
                    <div className="inline-block w-6 h-6 border-2 border-t-transparent border-[#ED2100] rounded-full animate-spin mb-2" />
                    <p className="text-sm text-stone-500">Loading recent trainings...</p>
                  </div>
                ) : pastTrainings.length === 0 ? (
                  <div className="col-span-3 text-center py-10 bg-white border border-burgundy/10">
                    <p className="text-sm text-stone-500">No training sessions uploaded yet.</p>
                  </div>
                ) : (
                  pastTrainings.map((t, i) => {
                    const displayImg = t.images && t.images.length > 0 ? t.images[0] : t.image;
                    return (
                    <div key={t.id || i} className="group relative bg-white border border-burgundy/10 overflow-hidden shadow-[0_4px_20px_rgba(107,23,36,0.04)] hover:shadow-xl transition-all duration-300 rounded-xl">
                      <div className="h-56 overflow-hidden relative bg-stone-100">
                        {displayImg ? (
                          <img src={displayImg} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center p-3">
                              <div className="flex flex-col items-center gap-3">
                                {['Nepal Building Code Compliant','NFPA Standards Adherent','Govt. of Nepal Registered'].map((t,i)=>(
                                  <div key={i} className="bg-white px-3 py-2 rounded shadow-sm text-sm font-semibold text-burgundy">{t}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#ED2100] bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                            <Calendar className="w-3 h-3" /> {t.date}
                          </p>
                          <h4 className="font-heading font-bold text-lg leading-tight drop-shadow-md text-white line-clamp-2">{t.title}</h4>
                        </div>
                      </div>
                      <div className="p-5 bg-white border-t border-burgundy/5">
                        <p className="text-sm text-stone-600 font-medium flex items-center justify-between">
                          <span className="truncate pr-4">{t.client}</span>
                          <ArrowRight className="w-4 h-4 text-[#6B1724] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </p>
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>
          )}

          {/* View All Details Button */}
          {isHomePage && (
            <div className="text-center mt-16 animate-on-scroll">
              <Link
                href="/education"
                className="inline-flex items-center justify-center gap-2 font-bold font-heading px-8 py-3.5 text-xs tracking-wider uppercase border transition-all duration-200 hover:scale-105 shadow-md hover:shadow-xl bg-white"
                style={{ color: '#6B1724', borderColor: '#6B1724' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#6B1724';
                  (e.currentTarget as HTMLElement).style.color      = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#fff';
                  (e.currentTarget as HTMLElement).style.color      = '#6B1724';
                }}
              >
                Explore Full Education Hub <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
       </div>
    </section>
  );
}
