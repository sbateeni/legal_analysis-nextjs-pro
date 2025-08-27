import type { GetServerSideProps } from 'next';

const PAGES = ['/', '/chat', '/analytics', '/history', '/about', '/privacy', '/templates'];

function generateSiteMap(baseUrl: string) {
  const urls = PAGES.map((path) => `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const forwardedHost = (req.headers?.['x-forwarded-host'] as string) || (req.headers?.host as string) || '';
  const forwardedProto = (req.headers?.['x-forwarded-proto'] as string) || '';
  const baseUrl = forwardedHost ? `${forwardedProto || 'https'}://${forwardedHost}` : envSite;
  const xml = generateSiteMap(baseUrl);
  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function Sitemap() {
  return null;
}

