import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Portfolio from "@/components/Portfolio";
import { collection, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { Metadata } from "next";

export const revalidate = 3600; // ISR: refresh every hour

export const metadata: Metadata = {
  title: 'Fire Fighting System Projects & Clients in Nepal | BolteK Portfolio',
  description: 'View 20+ successfully completed fire fighting system projects across Nepal. Heavy industrial plants, commercial centers, hotels, and top hospitals (Grande, HAMS).',
  alternates: { canonical: 'https://boltekenterprise.com/portfolio' }
};

interface Project {
  id: string;
  category: string;
  type: string;
  image: string;
  images?: string[];
  title: string;
  client: string;
  date: string;
  createdAt?: { seconds: number };
}

async function getPortfolioProjects() {
  try {
    const snap = await getDocs(collection(db, 'portfolio_projects'));
    const projects = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        category: data.category || '',
        type: data.type || '',
        image: data.image || '',
        images: data.images || [],
        title: data.title || '',
        client: data.client || '',
        date: data.date || '',
        createdAt: data.createdAt ? { seconds: data.createdAt.seconds } : undefined,
      } as Project;
    });

    // Sort newest first
    projects.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return projects;
  } catch (err) {
    console.error("Error fetching projects server-side:", err);
    return [];
  }
}

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <Portfolio initialProjects={projects} />
      </main>
      <Footer />
    </div>
  );
}
