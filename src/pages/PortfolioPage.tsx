import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Portfolio from '../components/Portfolio';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        {/* We can reuse the Portfolio component here, maybe without the section header if we want, or just wrap it */}
        <Portfolio />
      </main>
      <Footer />
    </div>
  );
}
