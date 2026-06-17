import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Trainings', href: '/trainings' },
  { label: 'About', href: '/about' },
  { label: 'Shop', href: '/shop' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-lg shadow-flame-200/30 py-2'
          : 'bg-white/90 backdrop-blur-sm py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#home')}
            className="flex items-center gap-2 group"
          >
            <img src="/logo.png" alt="BolteK Enterprise Logo" className="h-20 w-auto object-contain" />
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`nav-link-underline text-sm font-semibold font-heading tracking-wide transition-colors ${
                  location.pathname === link.href
                    ? 'text-[#f83939] active'
                    : 'text-[#c11111] hover:text-[#f83939]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+9779766866032"
              className="flex items-center gap-2 text-sm font-medium transition-colors text-[#c11111] hover:text-[#f83939]"
            >
              <Phone className="w-4 h-4" />
              <span>+977-9766866032</span>
            </a>
            <button
              onClick={() => handleNavClick('#contact')}
              className="bg-flame-700 hover:bg-flame-600 text-white text-sm font-semibold font-heading px-5 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-flame-700/30"
            >
              Free Quote
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#c11111] transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-flame-100 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium font-heading transition-colors ${
                location.pathname === link.href
                  ? 'bg-flame-50 text-flame-700'
                  : 'text-gray-700 hover:bg-flame-50 hover:text-flame-700'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('#contact')}
            className="mt-2 bg-flame-700 text-white text-sm font-semibold font-heading px-5 py-3 rounded-lg"
          >
            Get Free Quote
          </button>
        </div>
      </div>
    </nav>
  );
}
