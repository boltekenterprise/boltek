import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fire Safety Campaigns & Social Awareness Nepal | BolteK Enterprise",
  description: "Join BolteK Enterprise's fire safety awareness campaigns. Sharing critical fire prevention checklists, response tips, and safety updates across communities in Nepal.",
  alternates: {
    canonical: "https://boltekenterprise.com/education/social",
  }
};

export default function EducationSocial() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl mb-6 mt-8">Social Awareness</h1>
          <p className="text-stone-600 mb-6 font-light">Join our community campaigns. Share life-saving tips, drill updates, and community safety initiatives. Collaborate with us to raise awareness.</p>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-burgundy/10 text-stone-500 font-light">No campaigns yet.</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
