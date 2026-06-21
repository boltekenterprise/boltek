import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Home',      href: '/' },
  { label: 'Services',  href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Education', href: '/education' },
  { label: 'About',     href: '/about' },
  { label: 'Shop',      href: '/shop' },
];

export default function Navbar() {
  const [isOpen, setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ivory border-b border-burgundy/10 shadow-[0_2px_16px_rgba(107,23,36,0.06)] py-2'
          : 'bg-ivory/92 backdrop-blur-sm py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between min-h-[80px]">

          {/* Logo */}
          <button onClick={() => handleNavClick('/')} className="flex items-center gap-2 group z-10">
            <img src="/logo.png" alt="BolteK Enterprise Logo" className="h-20 w-auto object-contain py-1" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full justify-center pointer-events-none z-0">
            <div className="flex items-center gap-7 pointer-events-auto">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`nav-link-underline text-xs font-bold font-heading tracking-wider uppercase transition-colors ${
                    location.pathname === link.href
                      ? 'text-[#6B1724] active'
                      : 'text-[#111111] hover:text-[#6B1724]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* (Removed Desktop CTA buttons as per user request) */}
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-burgundy hover:text-burgundy/80 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-ivory border-t border-burgundy/10 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-left px-4 py-3 text-xs font-bold font-heading tracking-wider uppercase transition-colors ${
                location.pathname === link.href
                  ? 'bg-burgundy/10 text-burgundy'
                  : 'text-[#111111] hover:bg-burgundy/5 hover:text-burgundy'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
