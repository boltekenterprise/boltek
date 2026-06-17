import { useEffect, useRef } from 'react';
import {
  Wrench,
  GraduationCap,
  Flame,
  Truck,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Flame,
    title: 'Fire Risk Assessment & Consulting',
    description:
      'Detailed building safety audits, hazard identification, and risk analysis conducted under NFPA guidelines and Nepal National Building Codes.',
    features: ['Audit compliance certifications', 'Emergency exit path optimization', 'Building safety load calculations'],
    color: 'from-flame-700 to-flame-500',
  },
  {
    icon: ShieldCheck,
    title: 'Engineering & Systems Installation',
    description:
      'Turnkey engineering, design, and installation of wet/dry hydrants, automated sprinkler networks, addressable alarm grids, and kitchen hood systems.',
    features: ['Auto-sprinkler & hydrant piping', 'Addressable alarm panel matrices', 'Clean-agent gas suppression'],
    color: 'from-red-700 to-red-500',
  },
  {
    icon: Truck,
    title: 'Certified Fire Equipment Supplies',
    description:
      'Authorized supply of ISO-certified fire extinguishers, UL-listed fire doors, high-tensile fire hose reels, fire jackets, and PPE gear across Nepal.',
    features: ['ISO & UL-certified hardware', 'Fire doors & smoke barriers', 'Signages & safety detection gear'],
    color: 'from-flame-600 to-orange-500',
  },
  {
    icon: Wrench,
    title: '24/7 Maintenance & certified AMC',
    description:
      'Annual Maintenance Contracts (AMC), periodic testing, line pressure monitoring, and certified fire extinguisher refilling services.',
    features: ['Quarterly system checkups', 'Pressure-testing & cylinder refilling', 'Emergency response support'],
    color: 'from-red-800 to-flame-600',
  },
  {
    icon: GraduationCap,
    title: 'Fire Drills & Safety Trainings',
    description:
      'Hands-on training, structured fire drills, first-responder workshops, and emergency evacuation protocols for corporate and educational teams.',
    features: ['Practical extinguisher operations', 'Evacuation drill orchestration', 'First-responder certifications'],
    color: 'from-flame-800 to-flame-600',
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="min-h-screen flex flex-col justify-center bg-transparent text-white relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-on-scroll">
          <div className="text-left">
            <span className="text-flame-700 text-sm font-semibold uppercase tracking-[0.15em] font-heading">
              Elite Engineering & Consultation
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2 mb-3">
              Engineered Safety <span className="text-flame-500">Systems</span>
            </h2>
            <div className="section-divider mb-3" />
            <p className="text-gray-400 max-w-2xl text-base leading-relaxed font-light">
              Delivering uncompromising fire and life safety engineering — installations, maintenance, and executive-level consulting across Nepal.
            </p>
          </div>
          <Link
            to="/services"
            className="group flex items-center gap-2 text-sm font-semibold text-flame-700 hover:text-flame-800 transition-colors whitespace-nowrap"
          >
            View All Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                className="animate-on-scroll bg-[#1a1a1a]/60 border border-white/5 rounded-none p-5 hover:border-flame-500 group transition-colors"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-none bg-transparent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-9 h-9 text-[#f83939]" />
                </div>
                <h3 className="font-heading font-bold text-base text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{service.description}</p>
                <ul className="space-y-1 mb-3">
                  {service.features.slice(0, 2).map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-1 h-1 rounded-full bg-flame-600 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 text-flame-700 text-xs font-semibold font-heading hover:gap-3 transition-all duration-200"
                >
                  Inquire Now <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 animate-on-scroll">
          <div className="bg-gradient-to-br from-flame-800 to-flame-600 rounded-none p-6 text-center text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-heading font-black text-xl mb-1">Ensure NFPA & NBC Compliance Today</h3>
                <p className="text-white/80 text-sm">Our engineers will assess your facility and recommend a bespoke fire safety plan.</p>
              </div>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-flame-700 font-bold font-heading px-6 py-3 rounded-none text-sm hover:bg-flame-50 transition-colors shadow-xl whitespace-nowrap flex-shrink-0"
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
