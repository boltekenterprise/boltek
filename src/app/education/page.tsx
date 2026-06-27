import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Trainings from "@/components/Trainings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fire Safety Training & Mock Evacuation Drills Nepal | BolteK Academy",
  description: "Certified fire warden training, corporate mock fire drills, first responder workshops, evacuation planning, and emergency safety courses in Kathmandu, Nepal.",
  alternates: {
    canonical: "https://boltekenterprise.com/education",
  }
};

export default function TrainingsPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Trainings />
      </main>
      <Footer />
    </div>
  );
}
