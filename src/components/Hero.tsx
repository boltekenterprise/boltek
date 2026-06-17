import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        // Simple query — no orderBy so no composite index required
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

  // Curved height offsets — centre tallest, outer shortest
  const getCardStyle = (index: number): { height: string; marginTop: string } => {
    if (index === 2) return { height: '100%', marginTop: '0%' };
    if (index === 1 || index === 3) return { height: '82%', marginTop: '9%' };
    return { height: '65%', marginTop: '17.5%' };
  };

  return (
    <section
      id="home"
      className="relative h-screen max-h-screen flex flex-col overflow-hidden bg-white text-gray-900 border-b border-gray-100"
    >
      {/* Subtle red tint */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(248,57,57,0.05) 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 lg:px-8 pt-20">

        {/* Badge */}
        <div className="inline-block bg-[#f83939] text-white text-[9px] font-extrabold tracking-[0.2em] uppercase px-4 py-1.5 mb-4">
          NEPAL'S PREMIER FIRE ENGINEERING EXPERTS
        </div>

        {/* Heading */}
        <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight max-w-3xl text-gray-900 mb-3">
          Making Nepal{' '}<span className="text-[#f83939]">Fire-Safe.</span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mb-5 leading-relaxed">
          Engineering world-class fire protection systems, safety trainings, and equipment supply across Nepal for 20+ years.
        </p>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#f83939] hover:bg-[#cc2222] text-white font-bold tracking-widest text-xs uppercase px-8 py-3 transition-all shadow-lg"
          >
            LEARN MORE
          </button>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-[#f83939] text-[#f83939] hover:bg-[#f83939] hover:text-white font-bold tracking-widest text-xs uppercase px-8 py-3 transition-all bg-transparent"
          >
            CONTACT US
          </button>
        </div>

        {/* Featured Project Card Showcase */}
        <div
          className="w-full max-w-5xl flex items-end justify-center gap-2 md:gap-3 px-2 overflow-hidden select-none"
          style={{ height: '50vh', minHeight: '260px' }}
        >
          {loading ? (
            // Skeleton placeholders
            Array.from({ length: 5 }).map((_, i) => {
              const s = getCardStyle(i);
              return (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 sm:w-52 md:w-60 bg-gray-100 animate-pulse rounded-sm"
                  style={{ height: s.height, marginTop: s.marginTop }}
                />
              );
            })
          ) : projects.length === 0 ? (
            // Empty state — visible only to admins
            <div className="flex flex-col items-center justify-center gap-3 text-center pb-8">
              <div className="w-14 h-14 rounded-full bg-[#f83939]/10 flex items-center justify-center mb-1">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">No featured projects yet.</p>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                In <strong>Admin Portal → Portfolio Manager</strong>, click <strong>"Set Featured"</strong> on any project to display it here.
              </p>
              <Link
                to="/admin"
                className="mt-2 text-xs font-bold text-[#f83939] border border-[#f83939] px-4 py-1.5 hover:bg-[#f83939] hover:text-white transition-colors"
              >
                Go to Admin Portal
              </Link>
            </div>
          ) : (
            // Featured project cards from Firestore
            projects.map((project, i) => {
              const cardStyle = getCardStyle(i);
              return (
                <div
                  key={project.id || i}
                  className="flex-shrink-0 w-40 sm:w-52 md:w-60 rounded-sm overflow-hidden relative group shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                  style={{ height: cardStyle.height, marginTop: cardStyle.marginTop }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f83939] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  <div className="absolute inset-0 p-3 flex flex-col justify-end text-left">
                    <span className="text-[8px] font-bold text-red-400 tracking-widest uppercase mb-0.5">
                      {project.type}
                    </span>
                    <h3 className="font-heading font-black text-white text-xs leading-tight uppercase group-hover:text-red-400 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-white/50 text-[9px] font-semibold mt-0.5">{project.client}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
