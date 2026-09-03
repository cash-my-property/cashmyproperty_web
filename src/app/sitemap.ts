import { MetadataRoute } from 'next';
import { content } from '@/config/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cashmyproperty.com';
  const locales = ['en', 'ar'];

  const staticPages = [
    '',
    '/about',
    '/listings',
    '/auctions',
    '/blog',
    '/contact',
    '/terms',
    '/privacy-policy',
    '/cookie-policy',
  ];

  const blogPosts = content.blog.main.posts;
  const routes: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    // Add static pages
    staticPages.forEach((page) => {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' || page === '/blog' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/blog' ? 0.9 : 0.8,
      });
    });

    // Add dynamic SEO blog post URLs
    blogPosts.forEach((post) => {
      routes.push({
        url: `${baseUrl}/${locale}/blog/${(post as any).slug || post.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });
  });

  return routes;
}
