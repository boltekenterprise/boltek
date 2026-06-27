import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://boltekenterprise.com';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/research',
    '/education',
    '/education/trainings',
    '/education/videos',
    '/education/social',
    '/education/blogs',
    '/shop',
    '/portfolio',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic Blog Routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const snap = await getDocs(collection(db, 'blogs'));
    blogRoutes = snap.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      return {
        url: `${baseUrl}/education/blogs/${slug}`,
        lastModified: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    });
  } catch (err) {
    console.error('Error generating blog sitemap paths:', err);
  }

  // Dynamic Shop Routes
  let shopRoutes: MetadataRoute.Sitemap = [];
  try {
    const snap = await getDocs(collection(db, 'shop_products'));
    shopRoutes = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/shop/${doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });
  } catch (err) {
    console.error('Error generating shop sitemap paths:', err);
  }

  return [...staticRoutes, ...blogRoutes, ...shopRoutes];
}
