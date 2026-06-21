import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-flame-700 text-sm font-semibold uppercase tracking-widest font-heading">
              Knowledge Base
            </span>
            <h1 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 mt-3 mb-4">
              Research & <span className="gradient-text">Resources</span>
            </h1>
            <div className="section-divider mx-auto mb-5" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Access building codes, fire safety guidelines, case studies, and engineering resources.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Research content and PDF downloads coming soon...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
