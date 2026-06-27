import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import EducationBlogs from "@/admin-pages/EducationBlogs";
import { Metadata } from "next";

export const revalidate = 3600; // ISR: refresh every hour

export const metadata: Metadata = {
  title: 'Fire Safety Blogs & Articles Nepal | BolteK Enterprise',
  description: 'Read expert insights on fire protection standards, building regulations, mock drills, and sprinkler/hydrant maintenance guidelines in Nepal.',
  alternates: { canonical: 'https://boltekenterprise.com/education/blogs' }
};

interface Blog {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  image?: string;
  createdAt?: { seconds: number } | any;
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
    return items;
  } catch (err) {
    console.error("Error fetching blogs server-side:", err);
    return [];
  }
}

export default async function Page() {
  const blogs = await getBlogs();
  return <EducationBlogs initialBlogs={blogs} />;
}
