import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/job/', '/login/'],
    },
    sitemap: 'https://boltekenterprise.com/sitemap.xml',
  };
}
