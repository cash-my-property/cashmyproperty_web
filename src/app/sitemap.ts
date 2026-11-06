import { MetadataRoute } from 'next';
import { features } from '@/config/features';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cmpdubai.com';
  const locales = ['en', 'ar'];

  const staticPages = [
    '',
    '/about',
    '/guide',
    '/listings',
    ...(features.realTimeOffers ? ['/auctions'] : []),
    '/agents',
    '/agencies',
    '/developers',
    '/transactions',
    '/blog',
    '/contact',
    '/terms',
    '/privacy-policy',
    '/cookie-policy',
  ];

  return locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' || page === '/listings' || page === '/auctions' ? 'daily' : 'weekly',
      priority: page === '' ? 1.0 : 0.8,
    }))
  );
}
