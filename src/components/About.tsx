import { useEffect, useRef, useState } from 'react';
import { Target, Eye, CheckCircle, Award, MapPin, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const values = [
  {
    icon: CheckCircle,
    title: 'Reliability',
    description: 'We install systems that work when it matters most — every single time.',
  },
  {
    icon: Award,
    title: 'Compliance',
    description: 'All our designs meet Nepal Building Code, NFPA, and IS standards.',
  },
  {
    icon: Globe,
    title: 'Innovation',
    description: 'We stay current with global fire safety technology and best practices.',
  },
  {
    icon: MapPin,
    title: 'Local Expertise',
    description: 'Deep understanding of Nepal\'s building landscape and regulatory environment.',
  },
];

const certifications = [
  'Nepal Building Code Compliant',
  'NFPA Standards Adherent',
  'Govt. of Nepal Registered',
  'Pan-Nepal Service Coverage',
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [bgUrl, setBgUrl] = useState('https://images.pexels.com/photos/4483613/pexels-photo-4483613.jpeg?auto=compress&cs=tinysrgb&w=1600');

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'backgrounds');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().about) {
          setBgUrl(docSnap.data().about);
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
      id="about"
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center text-white relative py-16"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      {/* Charcoal overlay */}
      <div className="absolute inset-0 bg-[#111]/88" />
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Image Side */}
          <div className="relative animate-on-scroll">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/6195129/pexels-photo-6195129.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="BolteK Enterprise fire protection team Nepal"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-flame-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="bg-white/90 text-flame-800 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience badge */}
            <div className="absolute -top-5 -right-5 w-28 h-28 bg-flame-700 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl shadow-flame-700/40 rotate-3">
              <span className="font-heading font-black text-3xl">20+</span>
              <span className="text-xs font-medium text-white/80 text-center leading-tight">Years Experience</span>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6 animate-on-scroll">
              <div>
                <span className="text-[#f83939] text-sm font-semibold uppercase tracking-[0.15em] font-heading">
                  The Vanguard of Fire Safety
                </span>
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2 mb-3 leading-tight">
                  Nepal's Premier Fire{' '}
                  <span className="text-[#f83939]">Engineering</span> Authority
                </h2>
                <div className="section-divider" />
              </div>
              <Link
                to="/about"
                className="group flex items-center gap-2 text-sm font-semibold text-flame-700 hover:text-flame-800 transition-colors whitespace-nowrap"
              >
                Learn More About Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="animate-on-scroll space-y-4 text-gray-300 leading-relaxed font-light mb-8">
              <p>
                <strong className="text-white font-semibold">BolteK Enterprise Pvt. Ltd.</strong> stands at the pinnacle of fire protection engineering in Nepal. Driven by an uncompromising commitment to life safety, we have spent over two decades engineering bespoke, code-compliant protection architectures for elite hotels, hospitals, corporate headquarters, and high-risk industrial facilities.
              </p>
              <p>
                Our distinguished roster of engineers and safety strategists collaborate exclusively with top-tier developers and institutions, ensuring our systems transcend standard regulatory baselines to combat the unique risks presented by Nepal's expanding skyline.
              </p>
              <p>
                From the historic heart of Kathmandu to the nation's most demanding industrial zones, our legacy of flawless execution makes us the definitive choice for those who refuse to compromise on safety.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="animate-on-scroll grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#1a1a1a]/60 border border-white/5 rounded-none p-5">
                <div className="w-10 h-10 bg-transparent flex items-center justify-center mb-3">
                  <Target className="w-8 h-8 text-[#f83939]" />
                </div>
                <h4 className="font-heading font-bold text-white mb-1">Our Mission</h4>
                <p className="text-gray-400 text-sm">
                  Deliver world-class fire protection systems and training that save lives and
                  protect property across Nepal.
                </p>
              </div>
              <div className="bg-[#1a1a1a]/60 border border-white/5 rounded-none p-5">
                <div className="w-10 h-10 bg-transparent flex items-center justify-center mb-3">
                  <Eye className="w-8 h-8 text-[#f83939]" />
                </div>
                <h4 className="font-heading font-bold text-white mb-1">Our Vision</h4>
                <p className="text-gray-400 text-sm">
                  A Nepal where every building, community, and institution is equipped and prepared
                  against fire emergencies.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="animate-on-scroll grid grid-cols-2 gap-3">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon className="w-5 h-5 text-[#f83939] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">{value.title}</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-20">
          <div className="text-center mb-10 animate-on-scroll">
            <h3 className="font-heading font-black text-3xl text-white">
              Why Choose <span className="text-flame-500">BolteK Enterprise?</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                stat: '16+',
                label: 'Fire Safety Projects',
                desc: 'Across Nepal',
                bg: 'bg-flame-700',
              },
              {
                stat: '30+',
                label: 'Buildings Protected',
                desc: 'Hotels, Hospitals, Industries & More',
                bg: 'bg-flame-800',
              },
              {
                stat: '8+',
                label: 'Training Programs',
                desc: 'Evacuation Drills & Workshops',
                bg: 'bg-red-700',
              },
              {
                stat: '20+',
                label: 'Years of Expertise',
                desc: 'In Fire Protection',
                bg: 'bg-flame-900',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`animate-on-scroll ${item.bg} text-white rounded-none p-6 text-center hover:-translate-y-1 transition-transform duration-300`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="font-heading font-black text-4xl mb-1">{item.stat}</div>
                <div className="font-bold text-base mb-1">{item.label}</div>
                <div className="text-white/70 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
