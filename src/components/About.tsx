import { useEffect, useRef, useState } from 'react';
import { Target, Eye, CheckCircle, Award, MapPin, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const values = [
  { icon: CheckCircle, title: 'Reliability',      description: 'We install systems that work when it matters most — every single time.' },
  { icon: Award,       title: 'Compliance',        description: 'All our designs meet Nepal Building Code, NFPA, and IS standards.' },
  { icon: Globe,       title: 'Innovation',        description: 'We stay current with global fire safety technology and best practices.' },
  { icon: MapPin,      title: 'Local Expertise',   description: 'Deep understanding of Nepal\'s building landscape and regulatory environment.' },
];

const certifications = [
  'Nepal Building Code Compliant',
  'NFPA Standards Adherent',
  'Govt. of Nepal Registered',
  'Pan-Nepal Service Coverage',
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Default values before Firebase loads
  const [stats, setStats] = useState({
    projects: 16,
    buildings: 30,
    trainings: 8,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snap = await getDocs(collection(db, 'portfolio_projects'));
        if (snap.empty) return;
        
        let totalProjects = 0;
        let trainingCount = 0;
        const uniqueClients = new Set<string>();

        snap.docs.forEach(doc => {
          const data = doc.data();
          if ((data.category || '').trim().toLowerCase() === 'training') {
            trainingCount++;
          } else {
            totalProjects++;
          }
          if (data.client) {
            uniqueClients.add(data.client.trim().toLowerCase());
          }
        });

        // Use the actual DB counts, but keep minimums of 1 just in case
        setStats({
          projects: Math.max(1, totalProjects),
          buildings: Math.max(1, uniqueClients.size),
          trainings: Math.max(0, trainingCount),
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Stat cards: gradient Burgundy
  const statCards = [
    { stat: `${stats.projects}+`, label: 'Fire Safety Projects',   desc: 'Across Nepal',                         bg: '#7C1929' },
    { stat: `${stats.buildings}+`, label: 'Buildings Protected',     desc: 'Hotels, Hospitals, Industries & More', bg: '#6B1724' },
    { stat: `${stats.trainings}+`,  label: 'Training Programs',       desc: 'Evacuation Drills & Workshops',         bg: '#5A121E' },
    { stat: '20+', label: 'Years of Expertise',      desc: 'In Fire Protection',                    bg: '#4B0F19' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center text-stone-900 relative py-16 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* ── Image Side ── */}
          <div className="relative animate-on-scroll">
            <div className="relative overflow-hidden shadow-2xl">
              {/* External hero image removed — render neutral placeholder block instead */}
              <div className="w-full h-[480px] bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="flex flex-col items-center gap-3">
                    {certifications.map((cert, i) => (
                      <div key={i} className="bg-white px-4 py-2 rounded shadow-md text-sm font-semibold text-burgundy">
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Burgundy → transparent overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(107,23,36,0.35) 0%, transparent 60%)' }}
              />
              {/* Certifications now shown in the main placeholder area */}
            </div>

            {/* Experience badge — Burgundy */}
            <div
              className="absolute -top-5 -right-5 w-28 h-28 flex flex-col items-center justify-center text-white shadow-xl rotate-3"
              style={{ background: '#6B1724', boxShadow: '0 12px 32px rgba(107,23,36,0.45)' }}
            >
              <span className="font-heading font-black text-3xl">20+</span>
              <span className="text-xs font-medium text-white/80 text-center leading-tight">Years Experience</span>
            </div>
          </div>

          {/* ── Content Side ── */}
          <div>
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6 animate-on-scroll">
              <div>
                {/* Burgundy eyebrow */}
                <span className="text-xs font-semibold tracking-[0.2em] uppercase font-heading" style={{ color: '#6B1724' }}>
                  The Vanguard of Fire Safety
                </span>
                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 mt-2 mb-3 leading-[1.15]">
                  Nepal's Premier Fire{' '}
                  {/* Burgundy highlight */}
                  <span style={{ color: '#6B1724' }}>Engineering</span> Authority
                </h2>
                <div className="section-divider" />
              </div>
              <Link
                to="/about"
                className="group flex items-center gap-2 text-xs font-bold tracking-wider font-heading uppercase transition-colors whitespace-nowrap"
                style={{ color: '#6B1724' }}
              >
                Learn More About Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="animate-on-scroll space-y-4 text-stone-600 leading-relaxed font-light mb-8">
              <p>
                <strong className="text-stone-900 font-semibold">BolteK Enterprise Pvt. Ltd.</strong> stands at the pinnacle of fire protection engineering in Nepal. Driven by an uncompromising commitment to life safety, we have spent over two decades engineering bespoke, code-compliant protection architectures for elite hotels, hospitals, corporate headquarters, and high-risk industrial facilities.
              </p>
              <p>
                Our distinguished roster of engineers and safety strategists collaborate exclusively with top-tier developers and institutions, ensuring our systems transcend standard regulatory baselines to combat the unique risks presented by Nepal's expanding skyline.
              </p>
              <p>
                From the historic heart of Kathmandu to the nation's most demanding industrial zones, our legacy of flawless execution makes us the definitive choice for those who refuse to compromise on safety.
              </p>
            </div>

            {/* Mission & Vision — White card with Burgundy icons */}
            <div className="animate-on-scroll grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Target, label: 'Our Mission', text: 'Deliver world-class fire protection systems and training that save lives and protect property across Nepal.' },
                { icon: Eye,    label: 'Our Vision',  text: 'A Nepal where every building, community, and institution is equipped and prepared against fire emergencies.' },
              ].map(({ icon: Icon, label, text }, i) => (
                <div key={i} className="bg-white border border-burgundy/10 p-5 shadow-[0_4px_20px_rgba(107,23,36,0.04)]" style={{ borderLeftColor: '#6B1724', borderLeftWidth: '3px' }}>
                  <Icon className="w-8 h-8 mb-3" style={{ color: '#6B1724' }} />
                  <h4 className="font-heading font-bold text-lg text-stone-900 mb-1">{label}</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {/* Values */}
            <div className="animate-on-scroll grid grid-cols-2 gap-3">
              {values.map((value, i) => {
                const Icon = value.icon;
                const colors = ['#6B1724', '#6B1724', '#6B1724', '#6B1724'];
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors[i] }} />
                    <div>
                      <p className="text-stone-900 font-bold text-base">{value.title}</p>
                      <p className="text-stone-600 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Why Choose Us — stat cards ── */}
        <div className="mt-20">
          <div className="text-center mb-10 animate-on-scroll">
            <h3 className="font-heading font-black text-3xl text-stone-900">
              Why Choose <span style={{ color: '#6B1724' }}>BolteK Enterprise?</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((item, i) => (
              <div
                key={i}
                className="animate-on-scroll text-white p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                style={{ background: item.bg, transitionDelay: `${i * 80}ms` }}
              >
                <div className="font-heading font-black text-4xl mb-1">{item.stat}</div>
                <div className="font-heading font-bold text-base mb-1">{item.label}</div>
                <div className="text-white/80 text-xs font-medium">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
