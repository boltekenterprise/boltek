import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Padamsal, Tarakeshwor-2, Kathmandu, Bagmati, Nepal',
    href: 'https://maps.google.com/?q=Tarakeshwor,Kathmandu,Nepal',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+977-9766866032',
    href: 'tel:+9779766866032',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'boltekenterprise@gmail.com',
    href: 'mailto:boltekenterprise@gmail.com',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Sun–Fri: 9:00 AM – 6:00 PM (NST)',
    href: null,
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [bgUrl, setBgUrl] = useState('https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1600');

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'backgrounds');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().contact) {
          setBgUrl(docSnap.data().contact);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build mailto link for simple form submission
    const subject = encodeURIComponent(`Fire Protection Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nService: ${form.service}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:boltekenterprise@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center relative py-16"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      {/* Near-white overlay for form readability */}
      <div className="absolute inset-0 bg-white/92" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-on-scroll">
          <span className="text-flame-700 text-sm font-semibold uppercase tracking-widest font-heading">Get In Touch</span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 mt-2 mb-3">
            Request a <span className="gradient-text">Free Quote</span>
          </h2>
          <div className="section-divider mx-auto mb-3" />
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Tell us about your building and fire protection needs. Our expert will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="animate-on-scroll bg-gradient-to-br from-flame-800 to-flame-600 rounded-3xl p-7 text-white">
              <h3 className="font-heading font-bold text-xl mb-6">Contact Information</h3>
              <div className="space-y-5">
                {contactInfo.map((info, i) => {
                  const Icon = info.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-0.5 font-medium uppercase tracking-wide">
                          {info.label}
                        </p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-white text-sm font-medium hover:text-flame-200 transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-white text-sm font-medium">{info.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Social */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/60 text-xs uppercase tracking-wide font-medium mb-4">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/100063646503118"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/boltek.enterprise/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:boltekenterprise@gmail.com"
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="animate-on-scroll bg-gray-900 rounded-2xl p-5 text-white flex items-start gap-4">
              <div className="w-10 h-10 bg-flame-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                  Emergency / Urgent Inquiry
                </p>
                <a
                  href="tel:+9779766866032"
                  className="text-flame-400 font-bold text-lg font-heading hover:text-flame-300 transition-colors"
                >
                  +977-9766866032
                </a>
                <p className="text-gray-400 text-xs mt-0.5">Available during business hours</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 animate-on-scroll">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Your email client should have opened. We'll respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-flame-700 font-semibold text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-flame-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+977-XXXXXXXXXX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-flame-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Service Required
                    </label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 transition-all bg-white"
                    >
                      <option value="">Select a service...</option>
                      <option>Fire Hydrant System</option>
                      <option>Fire Sprinkler System</option>
                      <option>Fire Alarm System</option>
                      <option>Fire Suppression System</option>
                      <option>Annual Maintenance Contract (AMC)</option>
                      <option>Fire Safety Training</option>
                      <option>Fire Risk Assessment</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tell Us About Your Project <span className="text-flame-600">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your building type, location, current fire protection status, and what you need..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-flame-700 hover:bg-flame-600 text-white font-bold font-heading py-4 rounded-xl text-base transition-all duration-300 hover:shadow-xl hover:shadow-flame-700/30 flex items-center justify-center gap-2 group"
                  >
                    Send Inquiry
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-center text-gray-400 text-xs">
                    We typically respond within 24 business hours.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
