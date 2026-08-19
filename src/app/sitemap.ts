import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://shivrajpatilnew.vercel.app'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    // Add all your specific pages here:
    {
      url: `${baseUrl}/login`, // Replace with your actual paths
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Example: add more pages like this
    // {
    //   url: `${baseUrl}/contact`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.5,
    // },
  ]
}
