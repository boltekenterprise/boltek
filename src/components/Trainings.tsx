import { useEffect, useRef, useState } from 'react';
import { Users, ClipboardList, Zap, GraduationCap, Calendar, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const trainingTypes = [
  {
    icon: Zap,
    title: 'Fire Emergency Response',
    description:
      'Prepare teams for real-world fire emergencies with customized, scenario-based training sessions.',
    ideal: 'Offices, Hotels, Hospitals',
  },
  {
    icon: GraduationCap,
    title: 'Fire Safety Awareness',
    description:
      'Foundational fire safety knowledge covering hazards, battery fires, home safety, and prevention techniques.',
    ideal: 'Schools, Communities, Institutions',
  },
  {
    icon: ClipboardList,
    title: 'Evacuation Drills',
    description:
      'Planned and executed evacuation drills with debrief sessions to identify gaps and improve response times.',
    ideal: 'Government Buildings, Co-working Spaces',
  },
  {
    icon: Users,
    title: 'Capacity Building Programs',
    description:
      'Multi-day training programs for engineers, safety officers, and community leaders on fire protection systems.',
    ideal: 'Engineering Firms, Municipalities',
  },
];

const pastTrainings = [
  {
    title: 'Fire Safety Training',
    client: 'Robotics Club @ Pulchowk Campus',
    date: 'December 2025',
    icon: GraduationCap,
  },
  {
    title: 'Fire Safety Training',
    client: 'Agni Group — Mahindra Showroom Tangal',
    date: 'August 2025',
    icon: Building2,
  },
  {
    title: 'Fire Drill & Safety Training',
    client: 'Tarakeshwor Municipality Office',
    date: 'March 2025',
    icon: Users,
  },
  {
    title: 'Fire Safety Training',
    client: 'Chilime Building, Dhumbarahi',
    date: 'February 2025',
    icon: Building2,
  },
];

export default function Trainings() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [bgUrl, setBgUrl] = useState('https://images.pexels.com/photos/6195129/pexels-photo-6195129.jpeg?auto=compress&cs=tinysrgb&w=1600');

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'backgrounds');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().trainings) {
          setBgUrl(docSnap.data().trainings);
        }
      } catch (err) {
        console.error('Error fetching bg:', err);
      }
    };
    fetchBg();
  }, []);

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
    <section
      id="trainings"
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center text-white relative py-16"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      {/* Deep red-dark overlay */}
      <div className="absolute inset-0 bg-[#1a0000]/90" />
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-on-scroll">
          <div className="text-left">
            <span className="text-[#f83939] text-xs font-bold uppercase tracking-[0.2em] font-heading">
              Executive Safety Programs
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2 mb-3 leading-tight">
              Cultivating Elite <span className="text-[#f83939]">Preparedness</span>
            </h2>
            <div className="section-divider mb-3" />
            <p className="text-gray-300 max-w-2xl text-base font-light leading-relaxed">
              We deliver executive-tier fire safety programs, advanced evacuation protocols, and elite tactical drills for enterprise teams, corporate staff, and institutions across Nepal.
            </p>
          </div>
          <Link
            to="/trainings"
            className="group flex items-center gap-2 text-sm font-semibold text-flame-700 hover:text-flame-800 transition-colors whitespace-nowrap"
          >
            View All Trainings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Training types */}
          <div className="lg:col-span-3 space-y-5">
            <h3 className="font-heading font-bold text-xl text-white mb-6 animate-on-scroll">
              Training Programs We Offer
            </h3>
            {trainingTypes.map((type, i) => {
              const Icon = type.icon;
              return (
                <div
                  key={i}
                  className="animate-on-scroll flex gap-4 p-5 bg-[#1a1a1a]/60 rounded-none border border-white/5 hover:border-[#f83939] transition-all duration-300 group"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-12 h-12 bg-transparent rounded-none flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-8 h-8 text-[#f83939]" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-white mb-1">{type.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-2">{type.description}</p>
                    <span className="text-xs text-[#f83939] font-medium">
                      Ideal for: {type.ideal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Past trainings + CTA */}
          <div className="lg:col-span-2 space-y-5">
            <div className="animate-on-scroll bg-[#1a1a1a]/60 border border-white/5 rounded-none p-6">
              <h3 className="font-heading font-bold text-xl text-white mb-5">
                Recent Trainings
              </h3>
              <div className="space-y-4">
                {pastTrainings.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 pb-4 border-b border-white/10 last:border-0 last:pb-0"
                    >
                      <div className="w-9 h-9 bg-transparent rounded-none flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#f83939]" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold leading-tight">
                          {t.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">{t.client}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-500 text-xs">{t.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Card */}
            <div className="animate-on-scroll bg-[#f83939] rounded-none p-6 text-white text-center">
              <h4 className="font-heading font-bold text-xl mb-2 uppercase">
                Book a Training
              </h4>
              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                Customized fire safety training programs for your organization — delivered
                on-site anywhere in Nepal.
              </p>
              <button
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="w-full bg-[#1a1a1a] text-white font-bold font-heading py-3 rounded-none text-sm hover:bg-black transition-colors"
              >
                SCHEDULE NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
