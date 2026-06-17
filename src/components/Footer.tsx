import { Phone, Mail, MapPin, ArrowUp } from 'lucide-react';

const footerLinks = {
  Services: [
    { label: 'Fire Hydrant Systems', href: '#services' },
    { label: 'Sprinkler Systems', href: '#services' },
    { label: 'Fire Alarm Systems', href: '#services' },
    { label: 'Suppression Systems', href: '#services' },
    { label: 'Maintenance & AMC', href: '#services' },
    { label: 'Fire Safety Training', href: '#trainings' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Portfolio', href: '#portfolio' },
    { label: 'Past Projects', href: '#portfolio' },
    { label: 'Trainings', href: '#trainings' },
    { label: 'Contact Us', href: '#contact' },
  ],
  Industries: [
    { label: 'Hotels & Hospitality', href: '#portfolio' },
    { label: 'Hospitals & Healthcare', href: '#portfolio' },
    { label: 'Industrial Buildings', href: '#portfolio' },
    { label: 'Commercial Offices', href: '#portfolio' },
    { label: 'Residential Buildings', href: '#services' },
    { label: 'Educational Institutions', href: '#trainings' },
  ],
};

const seoKeywords = [
  'fire protection company nepal',
  'fire hydrant system kathmandu',
  'fire alarm installation nepal',
  'sprinkler system nepal',
  'fire suppression system',
  'fire safety training nepal',
  'AMC fire systems nepal',
  'fire risk assessment nepal',
];

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="BolteK Enterprise Logo" className="h-12 w-auto object-contain brightness-0 invert" />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-sm">
              BolteK Enterprise Pvt. Ltd. — Nepal's leading fire protection company. On a mission
              to make Nepal fire-safe through world-class systems, training, and maintenance.
            </p>

            <div className="space-y-2.5 mb-6">
              <a
                href="tel:+9779766866032"
                className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-flame-500" />
                +977-9766866032
              </a>
              <a
                href="mailto:boltekenterprise@gmail.com"
                className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-flame-500" />
                boltekenterprise@gmail.com
              </a>
              <div className="flex items-start gap-2.5 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-flame-500 mt-0.5 flex-shrink-0" />
                Padamsal, Tarakeshwor-2, Kathmandu, Nepal
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {[
                {
                  href: 'https://www.facebook.com/100063646503118',
                  label: 'Facebook',
                  path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                },
                {
                  href: 'https://www.instagram.com/boltek.enterprise/',
                  label: 'Instagram',
                  path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-flame-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-gray-400 hover:text-white text-sm transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SEO keywords (hidden visually but present for crawlers) */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="flex flex-wrap gap-2 mb-6">
            {seoKeywords.map((kw) => (
              <span
                key={kw}
                className="text-xs text-gray-600 bg-gray-900 px-3 py-1 rounded-full border border-gray-800"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} BolteK Enterprise Pvt. Ltd. All rights reserved.
            Registered in Nepal.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">boltekenterprise.com</span>
            <button
              onClick={scrollTop}
              className="w-8 h-8 bg-flame-700 hover:bg-flame-600 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
