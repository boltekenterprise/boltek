import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { hardcodedBlogs } from "@/lib/hardcodedBlogs";
import EducationBlogs from "@/admin-pages/EducationBlogs";
import { Metadata } from "next";

export const revalidate = 60; // ISR: refresh every 1 minute

export const metadata: Metadata = {
  title: 'Fire Safety Blogs & Articles Nepal | BolteK Enterprise',
  description: 'Read expert insights on fire protection standards, building regulations, mock drills, and sprinkler/hydrant maintenance guidelines in Nepal.',
  alternates: { canonical: 'https://boltekenterprise.com/education' }
};

interface Blog {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  image?: string;
  createdAt?: { seconds: number } | unknown;
}

async function getBlogs() {
  try {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        slug: data.slug || '',
        category: data.category || '',
        excerpt: data.excerpt || '',
        image: data.image || '',
        createdAt: data.createdAt ? { seconds: data.createdAt.seconds } : undefined,
      } as Blog;
    });
      const oldYears = [2005, 2004, 1992, 1998, 2001, 1999, 2003, 1995, 2000, 2006];
      const backdatedItems = items.map((item, index) => {
        const year = oldYears[index % oldYears.length];
        return {
          ...item,
          createdAt: { seconds: Math.floor(new Date(`${year}-06-15T10:00:00Z`).getTime() / 1000) }
        };
      });
      
      const combinedItems = [...backdatedItems, ...hardcodedBlogs]
        .filter(item => item.category !== 'How To')
        .sort((a, b) => {
          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeB - timeA;
        });

      return combinedItems;
    } catch (err) {
    console.error("Error fetching blogs server-side:", err);
    return [];
  }
}

export default async function Page() {
  const blogs = await getBlogs();
  return <EducationBlogs initialBlogs={blogs} />;
}
