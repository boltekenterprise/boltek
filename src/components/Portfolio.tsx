import { useEffect, useRef, useState } from 'react';
import { Calendar, Building2, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const typeBadgeColors: Record<string, string> = {
  Hotel: 'bg-blue-100 text-blue-700',
  Hospital: 'bg-green-100 text-green-700',
  Commercial: 'bg-amber-100 text-amber-700',
  Industrial: 'bg-gray-200 text-gray-700',
  Office: 'bg-cyan-100 text-cyan-700',
  Residential: 'bg-purple-100 text-purple-700',
  Institutional: 'bg-teal-100 text-teal-700',
};

export default function Portfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [visibleCount, setVisibleCount] = useState(8);
interface Project {
  id: string;
  category: string;
  type: string;
  image: string;
  title: string;
  client: string;
  date: string;
}

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgUrl, setBgUrl] = useState('https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=1600');

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'backgrounds');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().portfolio) {
          setBgUrl(docSnap.data().portfolio);
        }
      } catch (err) {
        console.error('Error fetching bg:', err);
      }
    };
    fetchBg();
  }, []);

  useEffect(() => {
    const fetchDbProjects = async () => {
      try {
        const q = collection(db, 'portfolio_projects');
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setAllProjects(data);
      } catch (err) {
        console.error('Error fetching db projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDbProjects();
  }, []);

  // Derive filters and categories dynamically
  const filters = ['All', ...Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean)))];
  const typeFilters = ['All Types', ...Array.from(new Set(allProjects.map((p) => p.type).filter(Boolean)))];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [allProjects]);

  const filtered = allProjects.filter((p) => {
    const catMatch = filter === 'All' || p.category === filter;
    const typeMatch = typeFilter === 'All Types' || p.type === typeFilter;
    return catMatch && typeMatch;
  });

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center text-white relative py-20"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/82" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-on-scroll">
          <div className="text-left">
            <span className="text-[#f83939] text-xs font-bold uppercase tracking-[0.2em] font-heading">
              Exclusive Installations
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2 mb-3 leading-tight">
              Our Elite <span className="text-[#f83939]">Portfolio</span>
            </h2>
            <div className="section-divider mb-3" />
            <p className="text-gray-300 max-w-2xl text-base font-light leading-relaxed">
              World-class fire protection systems engineered for Nepal's most prestigious commercial, healthcare, and industrial projects. All images are from actual project installations.
            </p>
          </div>
          <Link
            to="/portfolio"
            className="group flex items-center gap-2 text-sm font-semibold text-[#f83939] hover:text-white border border-[#f83939] hover:bg-[#f83939] px-4 py-2 transition-all whitespace-nowrap"
          >
            View All Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filters */}
        {filters.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-on-scroll">
            <Filter className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setVisibleCount(8); }}
                className={`px-4 py-1.5 text-xs font-semibold font-heading transition-all capitalize ${
                  filter === f
                    ? 'bg-[#f83939] text-white'
                    : 'bg-white/10 text-gray-300 border border-white/15 hover:border-[#f83939] hover:text-white'
                }`}
              >
                {f === 'All' ? 'All Projects' : f}
              </button>
            ))}
            <span className="w-px h-5 bg-white/20 hidden sm:block" />
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setVisibleCount(8); }}
                className={`px-4 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-white/20 text-white border border-white/40'
                    : 'bg-transparent text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#f83939] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading portfolio from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-base">No projects in database yet.</p>
            <p className="text-gray-500 text-sm mt-1">Add projects through the admin portal to see them here.</p>
            <Link to="/portfolio" className="inline-block mt-4 text-[#f83939] text-sm font-semibold hover:underline">
              View Portfolio Page →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.slice(0, visibleCount).map((project, i) => (
              <div
                key={project.id || i}
                className="animate-on-scroll group relative overflow-hidden shadow-xl border border-white/10 hover:border-[#f83939]/60 transition-all duration-500"
                style={{ transitionDelay: `${(i % 4) * 60}ms`, height: '240px' }}
              >
                {/* Full-card image from DB */}
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-gray-600 text-xs">No image uploaded</span>
                  </div>
                )}

                {/* Permanent dark gradient overlay — text always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

                {/* Badges top */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <span className="text-[10px] font-bold text-white bg-[#f83939] px-2 py-0.5 uppercase tracking-wide">
                    {project.type || 'Project'}
                  </span>
                  {project.category && (
                    <span className="text-[10px] font-medium text-white bg-black/60 border border-white/20 px-2 py-0.5 capitalize">
                      {project.category}
                    </span>
                  )}
                </div>

                {/* Content bottom — always visible */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-heading font-bold text-white text-sm leading-tight mb-1.5 drop-shadow-lg">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-300 text-xs mb-0.5">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{project.client}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{project.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && visibleCount < filtered.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount((v) => v + 8)}
              className="border border-[#f83939] text-[#f83939] hover:bg-[#f83939] hover:text-white font-semibold font-heading px-8 py-3 transition-all duration-200 text-sm"
            >
              Load More Projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
