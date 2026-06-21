import { useEffect, useRef } from 'react';
import { Wrench, GraduationCap, Flame, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const services = [
  {
    icon: Flame,
    title: 'Fire Risk Assessment & Consulting',
    description: 'Detailed building safety audits, hazard identification, and risk analysis conducted under NFPA guidelines and Nepal National Building Codes.',
    features: ['Audit compliance certifications', 'Emergency exit path optimization', 'Building safety load calculations'],
    accent: '#6B1724',   // Burgundy
  },
  {
    icon: ShieldCheck,
    title: 'Engineering & Systems Installation',
    description: 'Turnkey engineering, design, and installation of wet/dry hydrants, automated sprinkler networks, addressable alarm grids, and kitchen hood systems.',
    features: ['Auto-sprinkler & hydrant piping', 'Addressable alarm panel matrices', 'Clean-agent gas suppression'],
    accent: '#6B1724',   // Burgundy
  },
  {
    icon: Truck,
    title: 'Certified Fire Equipment Supplies',
    description: 'Authorized supply of ISO-certified fire extinguishers, UL-listed fire doors, high-tensile fire hose reels, fire jackets, and PPE gear across Nepal.',
    features: ['ISO & UL-certified hardware', 'Fire doors & smoke barriers', 'Signages & safety detection gear'],
    accent: '#6B1724',   // Burgundy
  },
  {
    icon: Wrench,
    title: '24/7 Maintenance & Certified AMC',
    description: 'Annual Maintenance Contracts (AMC), periodic testing, line pressure monitoring, and certified fire extinguisher refilling services.',
    features: ['Quarterly system checkups', 'Pressure-testing & cylinder refilling', 'Emergency response support'],
    accent: '#6B1724',   // Burgundy
  },
  {
    icon: GraduationCap,
    title: 'Fire Drills & Safety Trainings',
    description: 'Hands-on training, structured fire drills, first-responder workshops, and emergency evacuation protocols for corporate and educational teams.',
    features: ['Practical extinguisher operations', 'Evacuation drill orchestration', 'First-responder certifications'],
    accent: '#6B1724',   // Burgundy
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="min-h-screen flex flex-col justify-center bg-transparent text-stone-900 relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-on-scroll">
          <div className="text-left">
            {/* Burgundy eyebrow */}
            <span className="text-xs font-semibold tracking-[0.2em] uppercase font-heading" style={{ color: '#6B1724' }}>
              Elite Engineering &amp; Consultation
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-900 mt-2 mb-3 leading-[1.15]">
              Engineered Safety <span style={{ color: '#6B1724' }}>Systems</span>
            </h2>
            <div className="section-divider mb-3" />
            <p className="text-stone-600 max-w-2xl text-base leading-relaxed font-light">
              Delivering uncompromising fire and life safety engineering — installations, maintenance, and executive-level consulting across Nepal.
            </p>
          </div>
        </div>

        {/* ── Service Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                className="animate-on-scroll bg-white border border-burgundy/10 p-5 group transition-all duration-300 hover:border-[#6B1724]/30 hover:bg-white/80 shadow-[0_4px_20px_rgba(107,23,36,0.04)]"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  // subtle left accent bar
                  borderLeftColor: service.accent,
                  borderLeftWidth: '2px',
                }}
              >
                <Icon
                  className="w-9 h-9 mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{ color: service.accent }}
                />
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">{service.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">{service.description}</p>
                <ul className="space-y-1.5 mb-4">
                  {service.features.slice(0, 2).map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: service.accent }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold font-heading hover:gap-3 transition-all duration-200"
                  style={{ color: service.accent }}
                >
                  Inquire Now <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* ── View All Details Button ── */}
        {useLocation().pathname === '/' && (
          <div className="text-center mt-12 mb-8 animate-on-scroll">
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 font-bold font-heading px-8 py-3.5 text-xs tracking-wider uppercase border transition-all duration-200 hover:scale-105 shadow-md hover:shadow-xl"
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
              View All Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="animate-on-scroll">
          <div
            className="p-6 text-center text-white relative overflow-hidden"
            style={{ background: '#6B1724' }}
          >
            {/* Subtle radial highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)' }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-heading font-black text-2xl mb-1">Ensure NFPA &amp; NBC Compliance Today</h3>
                <p className="text-white/80 text-sm">Our engineers will assess your facility and recommend a bespoke fire safety plan.</p>
              </div>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white font-bold font-heading px-8 py-3.5 text-xs tracking-wider uppercase hover:bg-ivory transition-colors shadow-xl whitespace-nowrap flex-shrink-0"
                style={{ color: '#6B1724' }}
              >
                Book Free Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
