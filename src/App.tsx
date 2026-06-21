import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Trainings from './components/Trainings';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import JobPage from './pages/JobPage';

function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Trainings />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import ResearchPage from './pages/ResearchPage';
import TrainingsPage from './pages/TrainingsPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';

import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/education" element={<TrainingsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/job"
            element={
              <ProtectedRoute>
                <JobPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
