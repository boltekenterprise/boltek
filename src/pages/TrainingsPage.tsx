import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Trainings from '../components/Trainings';

export default function TrainingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Trainings />
      </main>
      <Footer />
    </div>
  );
}
