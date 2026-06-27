import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import About from "@/components/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About BolteK | Certified Fire Protection Company in Nepal",
  description: "BolteK Enterprise is a leading certified fire protection company in Nepal. We specialize in engineering fire-safe environments compliant with Nepal National Building Code NBC 107 and international NFPA standards.",
  keywords: ["boltek", "boltek enterprise", "boltekenterprise", "about boltek", "fire protection company nepal", "certified fire protection"],
  alternates: {
    canonical: "https://boltekenterprise.com/about",
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <About />
      </main>
      <Footer />
    </div>
  );
}
