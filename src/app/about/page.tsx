import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Shield, Zap, Code2, Heart, Users, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解 N Admin 项目的设计理念、技术架构、发展历程和未来规划',
  keywords: ['关于', '项目介绍', '设计理念', '技术架构', '发展历程'],
  alternates: {
    canonical: `${siteConfig.url}/about`
  },
  openGraph: {
    title: '关于我们 | N Admin',
    description: '了解 N Admin 项目的设计理念、技术架构、发展历程和未来规划',
    url: `${siteConfig.url}/about`,
    type: 'website'
  }
};

// 生成关于页面的结构化数据
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      name: `关于 ${siteConfig.name}`,
      description: metadata.description,
      url: `${siteConfig.url}/about`,
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: siteConfig.name,
        description: siteConfig.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY'
        }
      }
    },
    {
      '@type': 'Organization',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
      description: '专注于构建现代化 Web 应用和后台管理系统的开发团队',
      sameAs: ['https://github.com/guizimo', 'https://blog.guizimo.com']
    }
  ]
};

const features = [
  {
    icon: <Zap className='h-6 w-6 text-yellow-500' />,
    title: '高性能',
    description:
      '基于 Next.js 15 的最新特性，包括服务端组件、流式渲染、自动代码分割等，提供极致的性能体验。'
  },
  {
    icon: <Shield className='h-6 w-6 text-green-500' />,
    title: '安全可靠',
    description:
      '内置完整的权限系统、JWT 认证、密码加密、SQL 注入防护等企业级安全措施，保护您的数据安全。'
  },
  {
    icon: <Code2 className='h-6 w-6 text-blue-500' />,
    title: '开发友好',
    description:
      '完整的 TypeScript 类型定义、清晰的代码结构、详细的文档和注释，让开发和维护变得轻松愉快。'
  },
  {
    icon: <Users className='h-6 w-6 text-purple-500' />,
    title: '社区驱动',
    description:
      '开源免费，MIT 许可证，欢迎社区贡献。我们相信开源的力量，致力于为开发者提供更好的工具。'
  }
];

const techStack = [
  {
    category: '核心框架',
    technologies: [
      { name: 'Next.js 15', description: 'React 框架，支持 App Router 和 RSC' },
      { name: 'React 19', description: '用于构建用户界面的 JavaScript 库' },
      { name: 'TypeScript 5', description: 'JavaScript 的超集，提供静态类型' }
    ]
  },
  {
    category: 'UI 框架',
    technologies: [
      { name: 'Tailwind CSS 4', description: '原子化 CSS 框架' },
      { name: 'Shadcn UI', description: '可定制的 UI 组件集合' },
      { name: 'Radix UI', description: '无障碍访问的原始组件' },
      { name: 'Lucide Icons', description: '美观的图标库' }
    ]
  },
  {
    category: '状态管理 & 数据',
    technologies: [
      { name: 'Zustand', description: '轻量级状态管理库' },
      { name: 'React Query', description: '数据获取和缓存' },
      { name: 'Recharts', description: '数据可视化图表库' }
    ]
  },
  {
    category: '认证 & 安全',
    technologies: [
      { name: 'NextAuth.js 4', description: '完整的认证解决方案' },
      { name: 'bcryptjs', description: '密码加密库' },
      { name: 'JWT', description: 'JSON Web Token 认证' }
    ]
  }
];

const timeline = [
  {
    year: '2024',
    title: '项目启动',
    description: '基于 Next.js 14 启动项目，提供基础的后台管理功能'
  },
  {
    year: '2025',
    title: '重大升级',
    description:
      '升级到 Next.js 15 和 React 19，重构权限系统，优化性能和用户体验'
  },
  {
    year: '持续',
    title: '持续改进',
    description: '不断添加新功能、修复 Bug、优化性能，响应社区反馈'
  }
];

export default function AboutPage() {
  return (
    <>
      {/* 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <div className='container mx-auto max-w-6xl px-4 py-12'>
        {/* 页面头部 */}
        <div className='mb-16 text-center'>
          <h1 className='mb-4 text-4xl font-bold sm:text-5xl'>
            关于 {siteConfig.name}
          </h1>
          <p className='text-muted-foreground mx-auto max-w-3xl text-xl'>
            {siteConfig.description}
          </p>
        </div>

        {/* 核心特性 */}
        <section className='mb-16'>
          <h2 className='mb-8 text-center text-3xl font-bold'>核心特性</h2>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-card rounded-xl border p-6 transition-shadow hover:shadow-lg'
              >
                <div className='mb-4'>{feature.icon}</div>
                <h3 className='mb-2 text-xl font-semibold'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 技术栈 */}
        <section className='mb-16'>
          <h2 className='mb-8 text-center text-3xl font-bold'>技术栈</h2>
          <div className='grid gap-8 md:grid-cols-2'>
            {techStack.map((stack, index) => (
              <div key={index} className='bg-card rounded-xl border p-6'>
                <h3 className='text-primary mb-4 text-xl font-semibold'>
                  {stack.category}
                </h3>
                <ul className='space-y-3'>
                  {stack.technologies.map((tech, techIndex) => (
                    <li key={techIndex}>
                      <div className='font-medium'>{tech.name}</div>
                      <div className='text-muted-foreground text-sm'>
                        {tech.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 设计理念 */}
        <section className='mb-16'>
          <h2 className='mb-8 text-center text-3xl font-bold'>设计理念</h2>
          <div className='grid gap-6 md:grid-cols-3'>
            <div className='bg-card rounded-xl border p-6'>
              <Target className='text-primary mb-4 h-8 w-8' />
              <h3 className='mb-2 text-xl font-semibold'>以开发者为中心</h3>
              <p className='text-muted-foreground'>
                我们深知开发者的痛点，致力于提供清晰的代码结构、完善的类型定义、详细的文档，让开发变得愉悦和高效。
              </p>
            </div>
            <div className='bg-card rounded-xl border p-6'>
              <Shield className='text-primary mb-4 h-8 w-8' />
              <h3 className='mb-2 text-xl font-semibold'>安全第一</h3>
              <p className='text-muted-foreground'>
                企业级应用必须重视安全。我们内置了完整的权限系统和安全措施，从认证到授权，从输入验证到
                SQL 注入防护，全方位保护应用安全。
              </p>
            </div>
            <div className='bg-card rounded-xl border p-6'>
              <Heart className='text-primary mb-4 h-8 w-8' />
              <h3 className='mb-2 text-xl font-semibold'>精益求精</h3>
              <p className='text-muted-foreground'>
                我们追求代码质量和用户体验的极致。每一个功能都经过精心设计和测试，每一行代码都力求简洁优雅。持续改进，永不止步。
              </p>
            </div>
          </div>
        </section>

        {/* 发展历程 */}
        <section className='mb-16'>
          <h2 className='mb-8 text-center text-3xl font-bold'>发展历程</h2>
          <div className='mx-auto max-w-3xl'>
            {timeline.map((item, index) => (
              <div key={index} className='relative pb-8 last:pb-0'>
                {index !== timeline.length - 1 && (
                  <div className='bg-border absolute top-8 left-4 h-full w-0.5' />
                )}
                <div className='flex items-start gap-4'>
                  <div className='bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold'>
                    {index + 1}
                  </div>
                  <div className='flex-1 pb-8'>
                    <div className='text-primary mb-1 text-sm font-medium'>
                      {item.year}
                    </div>
                    <h3 className='mb-2 text-xl font-semibold'>{item.title}</h3>
                    <p className='text-muted-foreground'>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 开源承诺 */}
        <section className='mb-16'>
          <div className='from-primary/10 rounded-2xl border bg-gradient-to-r via-blue-500/10 to-purple-500/10 p-8'>
            <div className='mb-4 flex items-center gap-3'>
              <Heart className='h-8 w-8 fill-red-500 text-red-500' />
              <h2 className='text-2xl font-bold'>开源承诺</h2>
            </div>
            <p className='text-muted-foreground mb-6 leading-relaxed'>
              {siteConfig.name} 是完全开源的项目，采用 MIT
              许可证。我们相信开源社区的力量，
              致力于为开发者提供高质量、免费的开发工具。无论是个人项目还是商业项目，
              你都可以自由地使用、修改和分发本项目的代码。
            </p>
            <p className='text-muted-foreground mb-6 leading-relaxed'>
              我们欢迎社区贡献！如果你发现了 Bug、有功能建议或想改进代码，
              请随时提交 Pull Request 或 Issue。让我们一起把这个项目做得更好。
            </p>
            <div className='flex flex-wrap gap-4'>
              <a
                href='https://github.com/guizimo/n-admin'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-colors'
              >
                <Users className='h-4 w-4' />
                GitHub 仓库
              </a>
              <a
                href='/faq'
                className='border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-colors'
              >
                查看常见问题
              </a>
            </div>
          </div>
        </section>

        {/* 联系方式 */}
        <section className='text-center'>
          <h2 className='mb-4 text-2xl font-bold'>联系我们</h2>
          <p className='text-muted-foreground mx-auto mb-6 max-w-2xl'>
            如果你有任何问题、建议或想贡献代码，欢迎通过以下方式联系我们
          </p>
          <div className='flex flex-wrap justify-center gap-4'>
            <a
              href='https://github.com/guizimo/n-admin/issues'
              target='_blank'
              rel='noopener noreferrer'
              className='border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-colors'
            >
              提交 Issue
            </a>
            <a
              href='https://blog.guizimo.com'
              target='_blank'
              rel='noopener noreferrer'
              className='border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-colors'
            >
              访问博客
            </a>
            <a
              href='https://github.com/guizimo'
              target='_blank'
              rel='noopener noreferrer'
              className='border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-colors'
            >
              GitHub
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
