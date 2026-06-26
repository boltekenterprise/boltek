import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Wrench, GraduationCap, Flame, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const detailedServices = [
  {
    id: 'assessment',
    icon: Flame,
    title: 'Fire Risk Assessment & Consulting',
    description: 'Our comprehensive fire risk assessments are the cornerstone of proactive building safety. We conduct meticulous audits, hazard identification, and risk analysis in strict adherence to NFPA guidelines and Nepal National Building Codes. Our expert consultants evaluate structural layouts, occupancy types, and existing safety measures to provide actionable insights.',
    features: [
      'Comprehensive safety audits & compliance certifications',
      'Emergency exit path optimization and evacuation planning',
      'Building safety load and fire propagation calculations',
      'Regulatory compliance checks for commercial & industrial facilities',
      'Executive-level consultation for new constructions'
    ],
    fallbackImage: 'https://images.pexels.com/photos/7731326/pexels-photo-7731326.jpeg?auto=compress&cs=tinysrgb&w=800',
    accent: '#6B1724',
  },
  {
    id: 'installation',
    icon: ShieldCheck,
    title: 'Engineering & Systems Installation',
    description: 'We deliver turnkey engineering, design, and precision installation of advanced fire suppression and detection systems. From high-rise commercial buildings to sprawling industrial complexes, our certified engineers ensure flawless integration of wet/dry hydrants, automated sprinklers, and intelligent alarm networks.',
    features: [
      'Auto-sprinkler & wet/dry hydrant piping systems',
      'Intelligent, addressable fire alarm panel matrices',
      'Clean-agent gas suppression (FM-200, Novec 1230)',
      'Commercial kitchen hood fire suppression systems',
      'End-to-end project management and commissioning'
    ],
    fallbackImage: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=800',
    accent: '#6B1724',
  },
  {
    id: 'supplies',
    icon: Truck,
    title: 'Certified Fire Equipment Supplies',
    description: 'BolteK is a trusted supplier of top-tier, ISO and UL-certified fire safety equipment. We provide a complete range of hardware designed to withstand extreme conditions and guarantee reliability when it matters most. Our extensive inventory ensures quick deployment across Nepal.',
    features: [
      'ISO & UL-certified fire extinguishers (ABC, CO2, Foam, Water)',
      'High-durability fire doors & intelligent smoke barriers',
      'High-tensile fire hose reels and hydrants',
      'Photoluminescent signages & safety detection gear',
      'Premium Personal Protective Equipment (PPE) & fire jackets'
    ],
    fallbackImage: 'https://images.pexels.com/photos/2083549/pexels-photo-2083549.jpeg?auto=compress&cs=tinysrgb&w=800',
    accent: '#6B1724',
  },
  {
    id: 'maintenance',
    icon: Wrench,
    title: '24/7 Maintenance & Certified AMC',
    description: 'Fire safety systems require rigorous, ongoing maintenance to guarantee operational readiness. Our Annual Maintenance Contracts (AMC) provide peace of mind through periodic testing, preventative maintenance, and 24/7 rapid response support.',
    features: [
      'Comprehensive Annual Maintenance Contracts (AMC)',
      'Quarterly system checkups and line pressure monitoring',
      'Certified fire extinguisher refilling and hydro-testing',
      '24/7 emergency response and technical support',
      'Detailed maintenance logging and compliance reporting'
    ],
    fallbackImage: 'https://images.pexels.com/photos/8960965/pexels-photo-8960965.jpeg?auto=compress&cs=tinysrgb&w=800',
    accent: '#6B1724',
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Fire Drills & Safety Trainings',
    description: 'Empower your workforce with life-saving skills. We conduct hands-on training, structured fire drills, and first-responder workshops tailored for corporate offices, hospitals, factories, and educational institutions.',
    features: [
      'Practical, hands-on fire extinguisher operations',
      'Structured emergency evacuation drill orchestration',
      'First-responder training and certifications',
      'Customized safety protocol workshops for staff',
      'Post-drill evaluation and readiness reporting'
    ],
    fallbackImage: 'https://images.pexels.com/photos/6393327/pexels-photo-6393327.jpeg?auto=compress&cs=tinysrgb&w=800',
    accent: '#6B1724',
  },
];

export default function ServicesPage() {
  const [portfolioImages, setPortfolioImages] = useState<Record<string, string[]>>({});
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snap = await getDocs(collection(db, 'portfolio_projects'));
        const imagesMap: Record<string, string[]> = {};
        const projects: any[] = [];

        snap.docs.forEach(doc => {
          const data = doc.data();
          const cat = (data.category || '').trim().toLowerCase();

          let imgs: string[] = [];
          if (data.images && data.images.length > 0) {
            imgs = data.images;
          } else if (data.image) {
            imgs = [data.image];
          }

          // collect projects for relevance matching
          projects.push({ id: doc.id, ...data, images: imgs });

          if (imgs.length > 0) {
            if (!imagesMap[cat]) imagesMap[cat] = [];
            imagesMap[cat].push(...imgs);
          }
        });

        setPortfolioImages(imagesMap);
        setPortfolioProjects(projects);
      } catch (err) {
        console.error('Error fetching portfolio images:', err);
      }
    };
    
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-burgundy text-sm font-bold uppercase tracking-[0.2em] font-heading">
              Our Expertise
            </span>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-gray-900 mt-3 mb-4 leading-tight">
              Uncompromising <span className="text-burgundy">Services</span>
            </h1>
            <div className="section-divider mx-auto mb-6" />
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              We provide end-to-end fire and life safety engineering, from executive consulting and precision installations to certified 24/7 maintenance, ensuring absolute compliance and protection.
            </p>
          </div>

          <div className="space-y-32">
            {detailedServices.map((service, index) => {
              const isEven = index % 2 === 0;
              const Icon = service.icon;

              // Gather images from portfolio projects that match this service by category or type
              const matchedProjects = portfolioProjects.filter(p => {
                const cat = String(p.category || '').trim().toLowerCase();
                const type = String(p.type || '').trim().toLowerCase();
                const sid = String(service.id || '').trim().toLowerCase();
                return cat === sid || type === sid || cat.includes(sid) || type.includes(sid);
              });

              const catImages = matchedProjects.flatMap(p => (p.images && p.images.length > 0) ? p.images : (p.image ? [p.image] : []));

              // Prefer first DB image from matched projects; do not use external fallback images
              const displayImage = catImages.length > 0 ? catImages[0] : '';
              
              return (
                <div key={service.id} id={service.id} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 relative group">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                      {displayImage ? (
                        <>
                          <img
                            src={displayImage}
                            alt={service.title}
                            className="w-full h-[450px] object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        </>
                      ) : (
                        <div className="w-full h-[450px] bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center">
                          <div className="text-center p-6">
                            <div className="flex flex-col items-center gap-3">
                              {[
                                'Nepal Building Code Compliant',
                                'NFPA Standards Adherent',
                                'Govt. of Nepal Registered',
                                'Pan-Nepal Service Coverage'
                              ].map((t, i) => (
                                <div key={i} className="bg-white px-4 py-2 rounded shadow-sm text-sm font-semibold text-burgundy">
                                  {t}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 border-[6px] border-white/20 rounded-2xl z-10 m-4 pointer-events-none transition-all duration-500 group-hover:m-2" />
                      
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded shadow-lg">
                          <span className="font-heading font-bold text-xs uppercase tracking-wider text-burgundy">
                            {catImages.length > 0 ? 'Portfolio Reference' : 'Service Example'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Small Thumbnails */}
                    {catImages.length > 1 && (
                      <div className="flex gap-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                         {catImages.slice(1, 4).map((img, i) => (
                           <div key={i} className="flex-shrink-0 relative rounded-xl overflow-hidden shadow-md border-2 border-white cursor-pointer hover:border-burgundy transition-colors w-24 h-24">
                             <img src={img} className="w-full h-full object-cover" alt="Portfolio thumbnail" />
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-burgundy/10 mb-6 text-burgundy shadow-inner">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 mb-5 leading-tight">
                      {service.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                      {service.description}
                    </p>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                      <h3 className="font-heading font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-burgundy">Key Offerings</h3>
                      <ul className="space-y-3.5">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link 
                      to="/"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = '/#contact';
                      }}
                      className="inline-flex items-center justify-center px-8 py-4 bg-burgundy text-white font-bold font-heading uppercase tracking-wider text-sm hover:bg-[#5a131e] transition-all duration-300 rounded shadow-xl shadow-burgundy/20 hover:shadow-burgundy/40 hover:-translate-y-1"
                    >
                      Inquire About This Service
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
