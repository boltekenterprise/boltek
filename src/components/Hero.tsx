"use client";
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import Link from 'next/link';

interface FeaturedProject {
  id: string;
  title?: string;
  type?: string;
  date?: string;
  client?: string;
  image?: string;
  images?: string[];
}

function getFirstImage(project: FeaturedProject): string {
  if (project.images && project.images.length > 0) return project.images[0];
  if (project.image) return project.image;
  return '';
}

const ProjectCard = ({ project, index }: { project: FeaturedProject; index: number }) => {
  const src = getFirstImage(project);

  return (
    <div className="relative rounded-2xl overflow-hidden isolate group shadow-md border border-black/5 bg-[#f7f2ea] w-full h-full hover:-translate-y-0.5 transition-transform duration-300">
      {src ? (
        <img
          src={src}
          alt={project.title || 'Featured project'}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading={index < 2 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burgundy text-white mb-2">BK</div>
            <div className="text-sm font-semibold text-stone-700">Image unavailable</div>
            <div className="text-xs text-stone-500">No visual provided</div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex flex-col justify-end p-4 transition-opacity duration-300">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {project.type && (
            <span className="text-[8px] font-bold tracking-wider uppercase bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ color: '#ED2100' }}>
              {project.type}
            </span>
          )}
          {project.date && (
            <span className="text-[9px] font-medium text-white/80 uppercase tracking-wide">
              {project.date}
            </span>
          )}
        </div>
        <h3 className="font-sans font-semibold text-xs leading-snug line-clamp-2 mb-1 drop-shadow-md text-white">
          {project.title}
        </h3>
        {project.client && (
          <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{project.client}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Hero() {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const q = query(
          collection(db, 'portfolio_projects'),
          where('featured', '==', true),
          limit(5)
        );
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedProject)));
      } catch (err) {
        console.error('Error fetching featured projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen overflow-hidden bg-ivory text-stone-900 border-b border-burgundy/10 pt-16 lg:pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 w-full h-full flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6 pt-20 lg:pt-0 pb-4 lg:pb-0">

        {/* ── Left: headline & CTAs ── */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center text-left z-10 shrink-0 py-4 lg:py-6">
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-[2.8rem] xl:text-[3.2rem] tracking-tight leading-[1.02] text-[#111111] mb-3 lg:mb-4">
            Engineering <span style={{ color: '#6B1724' }}>Fire Safe Nepal !</span>
          </h1>
          <p className="text-stone-600 text-sm lg:text-[0.9rem] max-w-md mb-5 lg:mb-6 leading-relaxed font-light">
            Engineering world-class fire protection systems, safety trainings, and equipment supply across Nepal for 20+ years.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white font-bold tracking-widest text-xs uppercase px-8 py-3.5 transition-all shadow-lg rounded-full"
              style={{ background: '#ED2100' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#6B1724'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ED2100'; }}
            >
              LEARN MORE
            </button>
            <a
              href="https://wa.me/9779766866032?text=Hello,%20I%20would%20like%20to%20schedule%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#25D366] text-[#111111] hover:bg-[#25D366]/5 font-bold tracking-widest text-xs uppercase px-8 py-3.5 rounded-full transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.99 0 1.764.46 3.48 1.334 4.996L2 22l5.176-1.358a9.89 9.89 0 0 0 4.832 1.258h.005c5.504 0 9.988-4.482 9.988-9.99A9.94 9.94 0 0 0 12.012 2zm4.72 13.882c-.258.73-1.498 1.348-2.072 1.408-.57.06-1.146.258-3.666-.78-3.218-1.326-5.276-4.606-5.436-4.82-.162-.214-1.298-1.728-1.298-3.298 0-1.57.82-2.342 1.116-2.656.294-.314.646-.392.862-.392.214 0 .428.002.614.01.192.008.452-.074.708.548.258.62.88 2.14.956 2.296.076.156.126.336.022.548-.104.212-.156.346-.31.524-.154.18-.324.4-.462.536-.154.152-.316.318-.136.626.18.308.8 1.308 1.718 2.128.918.818 1.69 1.072 1.996 1.226.306.152.484.128.664-.078.18-.208.78-.908.988-1.22.208-.31.416-.258.702-.152.288.106 1.83.864 2.142 1.02.31.156.518.232.596.366.078.136.078.784-.18 1.514z" />
              </svg>
              WHATSAPP
            </a>
          </div>
        </div>

        {/* ── Right: project gallery ── */}
        <div className="w-full lg:w-[58%] flex flex-col min-h-0 py-4 lg:py-6">

          {/* Mobile label */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy mb-2 lg:hidden">
            Featured Projects
          </p>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-burgundy/20 bg-white/50">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-gray-500 text-sm font-medium">No featured projects yet.</p>
              <Link href="/job" className="mt-4 text-xs font-bold text-burgundy border border-burgundy px-4 py-2 hover:bg-burgundy hover:text-white transition-colors rounded-full">
                Go to Admin Portal
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2 min-h-0">

              {/* ── Top row: 2 cards ── */}
              <div className="flex gap-2 flex-[45%] min-h-0">
                {projects.slice(0, 2).map((project, i) => (
                  <div key={project.id || i} className="flex-1 min-w-0 aspect-[4/3] lg:aspect-auto">
                    <ProjectCard project={project} index={i} />
                  </div>
                ))}
              </div>

              {/* ── Bottom row: 3 cards ── */}
              <div className="flex gap-2 flex-[55%] min-h-0">
                {projects.slice(2, 5).map((project, i) => (
                  <div key={project.id || (i + 2)} className="flex-1 min-w-0 aspect-[3/4] lg:aspect-auto">
                    <ProjectCard project={project} index={i + 2} />
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
}