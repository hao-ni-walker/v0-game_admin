export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'N Admin',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || '现代化的后台管理系统',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  locale: 'zh_CN',
  author: {
    name: 'N Admin Team',
    url: 'https://github.com/guizimo'
  },
  metadata: {
    keywords: ['后台管理', '管理系统', 'Next.js', 'React', 'TypeScript', '企业级应用', 'Admin Dashboard'],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: 'N Admin',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'N Admin - 现代化的后台管理系统'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'N Admin - 现代化的后台管理系统',
      description: '基于 Next.js 15 和 React 19 构建的完整后台管理系统模板',
      images: ['/og-image.png']
    }
  }
};
