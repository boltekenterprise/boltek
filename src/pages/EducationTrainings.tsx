import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Trainings from '../components/Trainings';

export default function EducationTrainings() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl mb-6">Fire Safety Training</h1>
          <p className="text-stone-600 mb-8">Our structured training programs cover NFPA fundamentals, workplace drills, and practical hands-on sessions.</p>
          <Trainings />
        </div>
      </main>
      <Footer />
    </div>
  );
}
