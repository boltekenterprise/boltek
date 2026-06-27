"use client";
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, ArrowRight, Download, Award } from 'lucide-react';

const resources = [
  {
    icon: BookOpen,
    title: 'NBC 107: Fire Safety',
    description: 'Detailed fire protection criteria and compliance checklist under Nepal National Building Code 107.',
    format: 'PDF (2.4 MB)',
  },
  {
    icon: FileText,
    title: 'NFPA Compliance Guide',
    description: 'Essential inspection checklists for corporate offices, commercial centers, and hotels based on NFPA standards.',
    format: 'PDF (1.8 MB)',
  },
  {
    icon: Award,
    title: 'Industrial Fire Audits',
    description: 'Comprehensive risk assessment framework and structural analysis guidelines for manufacturing facilities.',
    format: 'PDF (3.1 MB)',
  },
];

export default function ResearchGlimpse() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-transparent text-stone-900 relative border-b border-burgundy/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-on-scroll">
          <div className="text-left">
            <span className="text-[#6B1724] text-xs font-bold uppercase tracking-[0.2em] font-heading">
              Technical Resources
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 mt-2 mb-3 leading-tight">
              Research & <span className="text-[#6B1724]">Regulations</span>
            </h2>
            <div className="section-divider mb-3" />
            <p className="text-stone-600 max-w-2xl text-base font-light leading-relaxed">
              Equipping engineers, architects, and building administrators with certified compliance checklists and structural fire safety engineering codebooks.
            </p>
          </div>
          <Link
            href="/research"
            className="group flex items-center gap-2 text-sm font-semibold text-[#6B1724] hover:text-white border border-[#6B1724] hover:bg-[#6B1724] px-4 py-2 transition-all whitespace-nowrap"
          >
            Explore Knowledge Base <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((res, i) => {
            const Icon = res.icon;
            return (
              <div
                key={i}
                className="animate-on-scroll bg-white border border-burgundy/10 rounded-xl p-6 hover:border-[#6B1724]/30 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_20px_rgba(107,23,36,0.04)]"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-burgundy/10 border border-burgundy/20 flex items-center justify-center mb-5 text-[#6B1724]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">{res.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{res.description}</p>
                </div>
                <div className="pt-4 border-t border-burgundy/10 flex items-center justify-between text-xs text-stone-500">
                  <span>{res.format}</span>
                  <Link
                    href="/research"
                    className="flex items-center gap-1.5 text-[#6B1724] hover:text-[#ED2100] transition-colors font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
