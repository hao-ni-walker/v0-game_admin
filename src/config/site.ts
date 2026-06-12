export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'BTC 秒合约管理后台',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'BTC 秒合约后台管理系统',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  locale: 'zh_CN',
  author: {
    name: 'CryptoExchange Team',
    url: 'https://github.com'
  },
  metadata: {
    keywords: ['BTC', '秒合约', '后台管理', '风控', '结算', 'Next.js', 'React', 'TypeScript'],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: 'BTC 秒合约管理后台',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'BTC 秒合约管理后台'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BTC 秒合约管理后台',
      description: 'BTC 秒合约后台管理系统 — 风控、结算、资金管理',
      images: ['/og-image.png']
    }
  }
};
