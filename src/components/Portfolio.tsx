import { useEffect, useRef, useState } from 'react';
import { Calendar, Building2, Filter, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function Portfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';
  const [filter, setFilter]         = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [visibleCount, setVisibleCount] = useState(isHomePage ? 8 : 1000);
  const [slideIndices, setSlideIndices] = useState<Record<number, number>>({});

  interface Project {
    id: string;
    category: string;
    type: string;
    image: string;
    images?: string[];
    title: string;
    client: string;
    date: string;
  }

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [bgUrl, setBgUrl]             = useState(
    'https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=1600'
  );

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_settings', 'backgrounds'));
        if (snap.exists() && snap.data().portfolio) setBgUrl(snap.data().portfolio);
      } catch {}
    };
    fetchBg();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'portfolio_projects'));
        setAllProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Start per-card auto-slide intervals after projects load
  useEffect(() => {
    if (allProjects.length === 0) return;

    // Initialise all indices to 0
    const init: Record<number, number> = {};
    allProjects.forEach((_, i) => { init[i] = 0; });
    setSlideIndices(init);

    // Create one interval per card that has more than 1 image
    const timers: ReturnType<typeof setInterval>[] = [];
    allProjects.forEach((project, i) => {
      const imgs = getImages(project);
      if (imgs.length > 1) {
        const t = setInterval(() => {
          setSlideIndices(prev => ({
            ...prev,
            [i]: ((prev[i] ?? 0) + 1) % imgs.length,
          }));
        }, 2600 + i * 350); // stagger per card so they don't all flip together
        timers.push(t);
      }
    });

    return () => { timers.forEach(clearInterval); };
  }, [allProjects]);

  const filters = ['All', ...Array.from(new Set(allProjects.map(p => (p.category || '').trim().toLowerCase()).filter(Boolean)))];
  
  const uniqueTypesMap = new Map<string, string>();
  allProjects.forEach(p => {
    if (p.type) {
      const t = p.type.trim();
      if (!uniqueTypesMap.has(t.toLowerCase())) {
        uniqueTypesMap.set(t.toLowerCase(), t);
      }
    }
  });
  const typeFilters = ['All Types', ...Array.from(uniqueTypesMap.values())];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [allProjects]);

  const filtered = allProjects.filter(p => {
    const catMatch  = filter === 'All' || (p.category || '').trim().toLowerCase() === filter.toLowerCase();
    const typeMatch = typeFilter === 'All Types' || (p.type || '').trim().toLowerCase() === typeFilter.toLowerCase();
    return catMatch && typeMatch;
  });

  const getImages = (p: Project) => {
    if (p.images && p.images.length > 0) return p.images;
    if (p.image) return [p.image];
    return [];
  };

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center text-stone-900 relative py-20"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      {/* Soft Ivory overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(250,249,246,0.93)' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10 w-full">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-on-scroll">
          <div className="text-left">
            {/* Burgundy eyebrow */}
            <span className="text-xs font-bold uppercase tracking-[0.2em] font-heading" style={{ color: '#6B1724' }}>
              Exclusive Installations
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 mt-2 mb-3 leading-[1.15]">
              Our Elite <span style={{ color: '#6B1724' }}>Portfolio</span>
            </h2>
            <div className="section-divider mb-3" />
            <p className="text-stone-600 max-w-2xl text-sm leading-relaxed font-light">
              World-class fire protection systems engineered for Nepal's most prestigious commercial, healthcare, and industrial projects.
            </p>
          </div>
        </div>

        {/* ── Filters ── */}
        {filters.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-on-scroll">
            <Filter className="w-4 h-4 text-stone-500 mr-1 flex-shrink-0" />
            {filters.map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setVisibleCount(isHomePage ? 8 : 1000); }}
                className="px-4 py-1.5 text-xs font-bold tracking-wider font-heading uppercase transition-all capitalize"
                style={
                  filter === f
                    ? { background: '#6B1724', color: '#fff' }
                    : { background: 'rgba(107, 23, 36, 0.06)', color: '#6B1724', border: '1px solid rgba(107, 23, 36, 0.15)' }
                }
              >
                {f === 'All' ? 'All Projects' : f}
              </button>
            ))}
            <span className="w-px h-5 bg-burgundy/20 hidden sm:block" />
            {typeFilters.map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setVisibleCount(isHomePage ? 8 : 1000); }}
                className="px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all"
                style={
                  typeFilter === t
                    ? { background: 'rgba(107, 23, 36, 0.12)', color: '#6B1724', border: '1px solid rgba(107, 23, 36, 0.35)' }
                    : { background: 'transparent', color: '#555555', border: '1px solid rgba(107, 23, 36, 0.15)' }
                }
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: '#6B1724', borderTopColor: 'transparent' }} />
            <p className="text-gray-400 text-sm">Loading portfolio from database…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-base">No projects in database yet.</p>
            <p className="text-gray-500 text-sm mt-1">Add projects through the admin portal to see them here.</p>
            <Link to="/portfolio" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: '#6B1724' }}>
              View Portfolio Page →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.slice(0, visibleCount).map((project, i) => {
              // Find original index in allProjects to match slideIndices
              const origIndex = allProjects.findIndex(p => p.id === project.id);
              const imgs = getImages(project);
              const currentIdx = slideIndices[origIndex] ?? 0;

              return (
              <div
                key={project.id || i}
                className="animate-on-scroll group relative overflow-hidden shadow-xl border border-burgundy/10 transition-all duration-500"
                style={{ transitionDelay: `${(i % 4) * 60}ms`, height: '240px', borderColor: 'rgba(107,23,36,0.1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,23,36,0.55)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,23,36,0.1)'; }}
              >
                {imgs.length > 0 ? (
                  <>
                    {/* Crossfading image slides */}
                    {imgs.map((src, si) => (
                      <img
                        key={si}
                        src={src}
                        alt={project.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                          si === currentIdx ? 'opacity-100' : 'opacity-0'
                        } group-hover:scale-110 transition-[transform] duration-700`}
                        loading={i < 4 && si === 0 ? "eager" : "lazy"}
                        fetchPriority={i < 2 && si === 0 ? "high" : "auto"}
                        decoding="async"
                      />
                    ))}
                    {/* Slide indicator dots */}
                    {imgs.length > 1 && (
                      <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                        {imgs.map((_, di) => (
                          <div
                            key={di}
                            className={`rounded-full transition-all duration-300 ${
                              di === currentIdx
                                ? 'w-2 h-1 bg-white shadow'
                                : 'w-1 h-1 bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-gray-600 text-xs">No image uploaded</span>
                  </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 items-start">
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase bg-white/95 px-3 py-1 rounded-full backdrop-blur-sm shadow-md"
                    style={{ color: '#ED2100' }}
                  >
                    {project.type || 'Project'}
                  </span>
                  {project.category && (
                    <span className="text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full capitalize shadow-md">
                      {project.category}
                    </span>
                  )}
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-sans font-semibold text-white text-sm leading-tight mb-1.5 drop-shadow-lg">{project.title}</h3>
                  <div className="flex items-center gap-1.5 text-stone-200 text-xs mb-0.5">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{project.client}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300 text-xs">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{project.date}</span>
                  </div>
                </div>

                {/* Bottom accent bar on hover — Burgundy */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: '#6B1724' }}
                />
              </div>
            )})}
          </div>
        )}

        {/* View All / Load More Logic */}
        {isHomePage ? (
          <div className="text-center mt-12 mb-4 animate-on-scroll">
            <Link
              to="/portfolio"
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
              View All Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          !loading && visibleCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount(v => v + 8)}
                className="font-bold font-heading px-8 py-3.5 transition-all duration-200 text-xs tracking-wider uppercase border"
                style={{ color: '#6B1724', borderColor: '#6B1724' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#6B1724';
                  (e.currentTarget as HTMLElement).style.color      = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color      = '#6B1724';
                }}
              >
                Load More Projects
              </button>
            </div>
          )
        )}
      </div>
    </section>
  );
}
