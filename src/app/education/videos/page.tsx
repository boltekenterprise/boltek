import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fire Safety Videos & Visual Guides Nepal | BolteK Enterprise",
  description: "Watch video tutorials on operating fire extinguishers, hydrant systems, clean-agent suppression, and workplace evacuation protocols.",
  alternates: {
    canonical: "https://boltekenterprise.com/education/videos",
  }
};

export default function EducationVideos() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl mb-6 mt-8">Video Resources</h1>
          <p className="text-stone-600 mb-6 font-light">Visual tutorials on operating fire extinguishers, system maintenance, and proper evacuation protocols. Browse our curated videos for quick learning.</p>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-burgundy/10 text-stone-500 font-light">No videos uploaded yet.</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
