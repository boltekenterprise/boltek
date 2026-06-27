"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface Project {
  id: string;
  category: string;
  type: string;
  image: string;
  images?: string[];
  title: string;
  client: string;
  date: string;
  createdAt?: { seconds: number };
}

interface PortfolioProps {
  initialProjects?: Project[];
}

export default function Portfolio({ initialProjects }: PortfolioProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [visibleCount, setVisibleCount] = useState(isHomePage ? 8 : 1000);

  const getImages = (p: Project) => {
    if (p.images && p.images.length > 0) return p.images;
    if (p.image) return [p.image];
    return [];
  };

  const PortfolioCard = React.memo(({ project, i, isHomePage }: { project: Project; i: number; isHomePage: boolean }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const imgs = getImages(project);
    const imageLoadedRef = useRef<boolean[]>([]);

    useEffect(() => {
      if (imgs.length <= 1) return;
      const t = setInterval(() => {
        setCurrentIdx((prev) => {
          const next = (prev + 1) % imgs.length;
          if (!imageLoadedRef.current[next]) return prev;
          return next;
        });
      }, 2600 + (i % 10) * 350);
      return () => clearInterval(t);
    }, [imgs.length, i]);

    const height = isHomePage ? '240px' : '260px';
    const delay = isHomePage ? `${(i % 4) * 60}ms` : undefined;

    return (
      <div
        className={`${isHomePage ? 'animate-on-scroll ' : ''}group relative overflow-hidden shadow-xl border transition-all duration-500`}
        style={{
          transitionDelay: delay,
          height,
          borderColor: 'rgba(107,23,36,0.1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,23,36,0.55)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,23,36,0.1)'; }}
      >
        {imgs.length > 0 ? (
          <>
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
                onLoad={() => {
                  imageLoadedRef.current[si] = true;
                }}
              />
            ))}
            {isHomePage && imgs.length > 1 && (
              <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                {imgs.map((_, di) => (
                  <div
                    key={di}
                    className={`rounded-full transition-all duration-300 ${
                      di === currentIdx ? 'w-2 h-1 bg-white shadow' : 'w-1 h-1 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
            <div className="text-center p-3">
              <div className="flex flex-col items-center gap-3">
                {['Nepal Building Code Compliant','NFPA Standards Adherent','Govt. of Nepal Registered','Pan-Nepal Service Coverage'].map((t,idx)=>(
                  <div key={idx} className="bg-white px-3 py-2 rounded shadow-sm text-sm font-semibold text-burgundy">{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 items-start">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-white/95 px-3 py-1 rounded-full backdrop-blur-sm shadow-md" style={{ color: '#ED2100' }}>
            {project.type || 'Project'}
          </span>
          {project.category && (
            <span className="text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full capitalize shadow-md">
              {project.category}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="font-sans font-semibold text-white text-sm leading-tight mb-1.5 drop-shadow-lg">{project.title}</h4>
          <div className="flex items-center gap-1.5 text-stone-200 text-xs mb-0.5">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{project.client}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-300 text-xs">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{project.date}</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: '#6B1724' }} />
      </div>
    );
  });

  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects || []);
  const [loading, setLoading]         = useState(!initialProjects);
  // Do not default to an external internet image for the background.
  // Only use a local/background path returned from the CMS (starting with '/')
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_settings', 'backgrounds'));
        if (snap.exists() && snap.data().portfolio) {
          const val = String(snap.data().portfolio || '').trim();
          // Only accept local paths to avoid pulling remote internet images as background
          if (val.startsWith('/') || val.startsWith('./') || val.startsWith('assets/') ) {
            setBgUrl(val);
          } else {
            // ignore external URLs
            setBgUrl('');
          }
        }
      } catch {}
    };
    fetchBg();
  }, []);

  useEffect(() => {
    if (initialProjects) return;
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'portfolio_projects'));
        const projects = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        // Sort newest first
        projects.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setAllProjects(projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [initialProjects]);





  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [allProjects]);



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



        {/* ── Grid ── */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: '#6B1724', borderTopColor: 'transparent' }} />
            <p className="text-gray-400 text-sm">Loading portfolio from database…</p>
          </div>
        ) : allProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-base">No projects found yet.</p>
            <p className="text-gray-500 text-sm mt-1">Add projects through the admin portal to see them here.</p>
            <Link href="/portfolio" className="inline-block mt-4 text-sm font-semibold hover:underline" style={{ color: '#6B1724' }}>
              View Portfolio Page →
            </Link>
          </div>
        ) : (
          // If we're on the standalone Portfolio page, group by `type` and render sections
          !isHomePage ? (
            (() => {
              const groups: Record<string, Project[]> = {};
              allProjects.forEach((p: Project) => {
                const key = (p.type || 'Other').trim() || 'Other';
                if (!groups[key]) groups[key] = [];
                groups[key].push(p);
              });

              // Preferred ordering for sections (will include others afterwards)
              const preferred = ['Installations', 'Maintenance', 'Trainings', 'Consulting', 'Other'];
              const orderedKeys = Array.from(new Set([
                ...preferred.filter(k => groups[k]),
                ...Object.keys(groups).filter(k => !preferred.includes(k)),
              ]));

              return (
                <div className="flex flex-col gap-12">
                  {orderedKeys.map((key) => (
                    <section key={key} className="animate-on-scroll">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-heading font-black text-2xl text-stone-900">{key}</h3>
                          <p className="text-sm text-stone-600">{groups[key].length} projects</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups[key].slice(0, visibleCount).map((project: Project, i: number) => (
                          <PortfolioCard key={project.id || i} project={project} i={i} isHomePage={false} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allProjects.slice(0, visibleCount).map((project, i) => (
                <PortfolioCard key={project.id || i} project={project} i={i} isHomePage={true} />
              ))}
            </div>
          )
        )}

        {/* View All / Load More Logic */}
        {isHomePage ? (
          <div className="text-center mt-12 mb-4 animate-on-scroll">
            <Link
              href="/portfolio"
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
              Explore Full Portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          !loading && visibleCount < allProjects.length && (
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
