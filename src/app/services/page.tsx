import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fire Protection Services Nepal | Hydrant, Sprinkler & Alarm System Design | BolteK",
  description: "Nepal's premium fire protection services. We design and install NFPA-compliant fire hydrant systems, automatic fire sprinklers, addressable fire alarms, clean agent gas suppression, and kitchen hood systems in Kathmandu and across Nepal.",
  alternates: {
    canonical: "https://boltekenterprise.com/services",
  }
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Services />
      </main>
      <Footer />
    </div>
  );
}
