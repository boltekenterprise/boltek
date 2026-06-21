import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIndices, setSlideIndices] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const q = query(
          collection(db, 'portfolio_projects'),
          where('featured', '==', true),
          limit(5)
        );
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching featured projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

  // Start per-card auto-slide intervals after projects load
  useEffect(() => {
    if (projects.length === 0) return;

    // Initialise all indices to 0
    const init: Record<number, number> = {};
    projects.forEach((_, i) => { init[i] = 0; });
    setSlideIndices(init);

    // Create one interval per card that has more than 1 image
    const timers: ReturnType<typeof setInterval>[] = [];
    projects.forEach((project, i) => {
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
  }, [projects]);

  /** Normalise: new projects store images[], old ones stored image string */
  const getImages = (project: any): string[] => {
    if (project.images && Array.isArray(project.images) && project.images.length > 0) {
      return project.images;
    }
    if (project.image) return [project.image];
    return [];
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-ivory text-stone-900 border-b border-burgundy/10 pt-20"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* ── Left Side: Text and CTAs (70% whitespace vibe) ── */}
        <div className="w-full lg:w-[45%] text-left z-10 pt-10 lg:pt-0">
          <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] tracking-tight leading-[1.05] text-[#111111] mb-6">
            Engineering <span style={{ color: '#6B1724' }}>Fire Safe Nepal !</span>
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-lg mb-8 leading-relaxed font-light">
            Engineering world-class fire protection systems, safety trainings, and equipment supply across Nepal for 20+ years.
          </p>
          <div className="flex flex-wrap items-center gap-4">
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

        {/* ── Right Side: Masonry Gallery ── */}
        <div className="w-full lg:w-[55%] relative h-[50vh] sm:h-[60vh] lg:h-[85vh] z-0 flex items-center justify-center">
          {loading ? (
             <div className="w-full h-full flex items-center justify-center">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy"></div>
             </div>
          ) : projects.length === 0 ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-center">
               <div className="text-4xl mb-2">⭐</div>
               <p className="text-gray-500 text-sm font-medium">No featured projects yet.</p>
               <Link to="/admin" className="mt-4 text-xs font-bold text-burgundy border border-burgundy px-4 py-2 hover:bg-burgundy hover:text-white transition-colors rounded-full">
                 Go to Admin Portal
               </Link>
             </div>
          ) : (
             <div className="w-full h-full overflow-hidden mask-image-bottom-fade">
               {/* Using CSS columns for a perfect masonry layout */}
               <div className="columns-2 sm:columns-3 gap-4 space-y-4 p-2 h-[120%] pt-4 pb-20">
                 {projects.map((project, i) => {
                   const imgs = getImages(project);
                   const currentIdx = slideIndices[i] ?? 0;
                   // Pre-defined heights to force a varied masonry look
                   const heights = ['h-[280px]', 'h-[180px]', 'h-[340px]', 'h-[220px]', 'h-[260px]', 'h-[190px]', 'h-[300px]'];
                   const cardHeight = heights[i % heights.length];
                   
                   return (
                     <div
                       key={project.id || i}
                       className={`relative w-full break-inside-avoid rounded-[2rem] overflow-hidden group shadow-lg border border-black/5 hover:-translate-y-1 transition-transform duration-300 mb-6 ${cardHeight}`}
                     >
                       {/* Crossfading image slides */}
                       {imgs.map((src, si) => (
                         <img
                           key={si}
                           src={src}
                           alt={project.title}
                           className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                             si === currentIdx ? 'opacity-100' : 'opacity-0'
                           } group-hover:scale-105 transition-[transform] duration-700`}
                           loading={i < 4 && si === 0 ? "eager" : "lazy"}
                           fetchpriority={i < 2 && si === 0 ? "high" : "auto"}
                           decoding="async"
                         />
                       ))}
                       
                       {/* Slide indicator dots */}
                       {imgs.length > 1 && (
                         <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                           {imgs.map((_, di) => (
                             <div
                               key={di}
                               className={`rounded-full transition-all duration-300 ${
                                 di === currentIdx ? 'w-2.5 h-1.5 bg-white shadow-md' : 'w-1.5 h-1.5 bg-white/50'
                               }`}
                             />
                           ))}
                         </div>
                       )}

                       {/* Hover Gradient Overlay & Details */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none flex flex-col justify-end p-5 transition-opacity duration-300">
                         {/* scale-75 scales everything 0.75x. w-[133.33%] counters the scale so it still spans the card width */}
                         <div className="transform scale-75 origin-bottom-left translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-[133.33%]">
                           
                           {/* Badges: Type & Date */}
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             {project.type && (
                               <span className="text-[9px] font-bold tracking-wider uppercase bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ color: '#ED2100' }}>
                                 {project.type}
                               </span>
                             )}
                             {project.date && (
                               <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">
                                 {project.date}
                               </span>
                             )}
                           </div>
                           
                           {/* Project Title — White */}
                           <h3 className="font-sans font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 drop-shadow-md text-white">
                             {project.title}
                           </h3>
                           
                           {/* Client / Location */}
                           {project.client && (
                             <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                               </svg>
                               <span className="truncate">{project.client}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          )}
        </div>
        
      </div>
      
      <style>{`
        .mask-image-bottom-fade {
          -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
        }
      `}</style>
    </section>
  );
}
