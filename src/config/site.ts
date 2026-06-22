export const siteConfig = {
  name: '翠雀 JADE.AI',
  description: '翠雀 JADE.AI · 竞技麻将管理后台',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jade-mahjong.com',
  locale: 'zh_CN',
  author: {
    name: 'JADE.AI Team',
    url: 'https://github.com/hao-ni-walker'
  },
  metadata: {
    keywords: ['麻将', '管理后台', '竞技麻将', 'Admin Dashboard', '翠雀'],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: '翠雀 JADE.AI Admin',
    }
  }
};
