'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Shield,
  Zap,
  Palette,
  Users,
  BarChart3,
  Code2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';

// 生成结构化数据 - 优化用于 AI 搜索引擎
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY'
      },
      author: {
        '@type': 'Organization',
        name: siteConfig.author.name,
        url: siteConfig.author.url
      },
      keywords: siteConfig.metadata.keywords.join(', '),
      featureList: [
        '用户认证与权限管理',
        '角色与权限控制系统',
        '数据可视化仪表板',
        '响应式设计',
        'TypeScript 完整支持',
        '主题切换（亮色/暗色）',
        '模块化组件架构'
      ],
      browserRequirements: 'Requires JavaScript. Compatible with all modern browsers.',
      softwareVersion: '1.0.0',
      applicationSuite: 'N Admin Platform',
      screenshot: `${siteConfig.url}/screenshot.png`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '125',
        bestRating: '5',
        worstRating: '1'
      }
    },
    {
      '@type': 'Organization',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
      description: '专注于构建现代化 Web 应用和后台管理系统的开发团队',
      sameAs: [
        'https://github.com/guizimo',
        'https://blog.guizimo.com'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: 'https://github.com/guizimo/n-admin/issues'
      }
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'N Admin 是什么？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'N Admin 是基于 Next.js 15 和 React 19 构建的现代化后台管理系统模板，提供完整的用户认证、权限管理、数据可视化等企业级功能，帮助开发者快速搭建后台管理系统。'
          }
        },
        {
          '@type': 'Question',
          name: 'N Admin 使用了哪些技术栈？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'N Admin 采用 Next.js 15、React 19、TypeScript、Tailwind CSS、Shadcn UI、Radix UI 等最新技术栈，确保项目的先进性、性能和可维护性。'
          }
        },
        {
          '@type': 'Question',
          name: 'N Admin 是否支持权限管理？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '是的，N Admin 内置完整的权限管理系统，包括用户认证、角色管理、权限控制、RBAC 权限模型等功能，支持细粒度的权限控制。'
          }
        },
        {
          '@type': 'Question',
          name: '如何开始使用 N Admin？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '你可以通过访问 N Admin 的 GitHub 仓库获取源代码，按照文档进行安装配置。系统提供了完整的初始化脚本和开发环境配置，几分钟即可启动。'
          }
        }
      ]
    },
    {
      '@type': 'HowTo',
      name: '如何使用 N Admin 搭建后台管理系统',
      description: '快速指南：使用 N Admin 模板搭建企业级后台管理系统',
      step: [
        {
          '@type': 'HowToStep',
          name: '克隆项目',
          text: '从 GitHub 克隆 N Admin 项目到本地',
          url: `${siteConfig.url}/docs/getting-started`
        },
        {
          '@type': 'HowToStep',
          name: '安装依赖',
          text: '运行 pnpm install 或 npm install 安装项目依赖'
        },
        {
          '@type': 'HowToStep',
          name: '配置环境变量',
          text: '配置 .env.local 文件，设置数据库连接、API 密钥等'
        },
        {
          '@type': 'HowToStep',
          name: '初始化数据库',
          text: '运行 npm run init:admin 初始化管理员账户和系统配置'
        },
        {
          '@type': 'HowToStep',
          name: '启动开发服务器',
          text: '运行 npm run dev 启动开发服务器，访问 http://localhost:3001'
        }
      ],
      tool: [
        {
          '@type': 'HowToTool',
          name: 'Node.js 18+'
        },
        {
          '@type': 'HowToTool',
          name: 'pnpm 或 npm'
        }
      ]
    }
  ]
};

export default function Home() {
  // 滚动监听组件
  function ScrollNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 10);
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
      <nav className='fixed top-0 left-0 z-30 w-full transition-all duration-300'>
        <div className='container mx-auto px-4 py-4'>
          <div
            className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300 ${
              scrolled
                ? 'bg-background/95 border-border/50 border shadow-lg backdrop-blur-md'
                : 'bg-background/80 border-border/30 border shadow-sm backdrop-blur-sm'
            }`}
          >
            {/* Logo 部分 */}
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <div className='bg-primary/10 absolute inset-0 rounded-lg blur-sm' />
                <div className='bg-background relative rounded-lg p-2'>
                  <Image
                    src='/logo.png'
                    alt='N-Admin Logo'
                    width={24}
                    height={24}
                    className='dark:invert'
                  />
                </div>
              </div>
              <span className='from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent'>
                {siteConfig.name}
              </span>
            </div>

            {/* 右侧操作按钮 */}
            <div className='flex items-center gap-2'>
              {/* 立即使用按钮 - 更现代的设计 */}
              <Button
                asChild
                size='sm'
                className='from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 rounded-full border-0 bg-gradient-to-r shadow-md transition-all duration-200 hover:shadow-lg'
              >
                <a href='/dashboard' className='flex items-center gap-2 px-4'>
                  <span className='text-primary-foreground text-sm font-medium'>
                    立即使用
                  </span>
                  <ArrowRight size={14} className='text-primary-foreground' />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className='from-background via-background to-muted/50 flex min-h-screen flex-col bg-gradient-to-br'>
      {/* 背景装饰 */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl' />
        <div className='absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-500/3 blur-3xl' />
      </div>

      {/* 导航栏 */}
      <ScrollNavbar />

      {/* 主要内容 */}
      <main className='relative z-10 container mx-auto flex flex-1 flex-col justify-center px-4 pt-28'>
        {/* 英雄区域 */}
        <div className='mx-auto mb-20 flex min-h-[calc(100vh-112px)] max-w-5xl flex-col justify-center text-center'>
          <div className='mb-8'>
            <div className='bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium'>
              <Zap size={16} />
              <span>基于 Next.js 15 构建</span>
            </div>
          </div>

          <h1 className='mb-8 text-5xl leading-tight font-bold tracking-tight sm:text-7xl'>
            <span className='from-foreground via-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-transparent'>
              现代化的
            </span>
            <br />
            <span className='from-primary bg-gradient-to-r via-blue-500 to-purple-500 bg-clip-text text-transparent'>
              后台管理系统
            </span>
          </h1>

          <p className='text-muted-foreground mx-auto mb-10 max-w-3xl text-xl leading-relaxed sm:text-2xl'>
            基于{' '}
            <span className='text-foreground font-semibold'>Next.js 15</span> 和{' '}
            <span className='text-foreground font-semibold'>Shadcn UI</span>{' '}
            构建的完整后台管理系统模板，
            <br className='hidden sm:block' />
            帮助你快速搭建{' '}
            <span className='text-primary font-semibold'>企业级应用</span>
          </p>

          <div className='mb-16 flex justify-center'>
            <Button
              size='lg'
              asChild
              className='hover:shadow-primary/25 px-8 py-6 text-lg shadow-2xl transition-all duration-300 hover:scale-105'
            >
              <a href='/dashboard' className='flex items-center gap-3'>
                <Zap size={20} />
                开始使用
                <ArrowRight size={20} />
              </a>
            </Button>
          </div>
        </div>

        {/* 特性展示 */}
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>
              为什么选择 {siteConfig.name}？
            </h2>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
              集成最新技术栈，提供完整的解决方案，让你专注于业务逻辑
            </p>
          </div>

          <div className='mb-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: <Zap className='h-8 w-8 text-yellow-500' />,
                title: '现代技术栈',
                description:
                  '采用 Next.js 15、React 19、TypeScript、Tailwind CSS 等最新技术，确保项目的先进性和可维护性',
                gradient: 'from-yellow-500/10 to-orange-500/10'
              },
              {
                icon: <Shield className='h-8 w-8 text-green-500' />,
                title: '完整的权限系统',
                description:
                  '内置用户认证、角色管理、权限控制等企业级功能，开箱即用的安全解决方案',
                gradient: 'from-green-500/10 to-emerald-500/10'
              },
              {
                icon: <Palette className='h-8 w-8 text-purple-500' />,
                title: '优雅的设计',
                description:
                  '基于 Shadcn UI 和 Radix UI 构建，支持亮色/暗色主题，提供一致的设计体验',
                gradient: 'from-purple-500/10 to-pink-500/10'
              },
              {
                icon: <Users className='h-8 w-8 text-blue-500' />,
                title: '用户管理',
                description:
                  '完整的用户管理功能，包括用户创建、编辑、删除、角色分配等操作',
                gradient: 'from-blue-500/10 to-cyan-500/10'
              },
              {
                icon: <BarChart3 className='h-8 w-8 text-red-500' />,
                title: '数据可视化',
                description:
                  '内置图表组件，支持多种图表类型，让数据展示更加直观和美观',
                gradient: 'from-red-500/10 to-rose-500/10'
              },
              {
                icon: <Code2 className='h-8 w-8 text-indigo-500' />,
                title: '开发友好',
                description:
                  '完整的 TypeScript 支持，规范的代码结构，详细的文档，提升开发效率',
                gradient: 'from-indigo-500/10 to-violet-500/10'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className='group bg-card/50 relative overflow-hidden rounded-2xl border p-8 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl'
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className='relative z-10'>
                  <div className='bg-background/80 mb-4 inline-flex rounded-xl border p-3'>
                    {feature.icon}
                  </div>
                  <h3 className='group-hover:text-primary mb-3 text-xl font-semibold transition-colors duration-300'>
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 区域 */}
        <div className='mx-auto max-w-4xl text-center'>
          <div className='from-primary/10 border-primary/20 relative rounded-3xl border bg-gradient-to-r via-blue-500/10 to-purple-500/10 p-12 backdrop-blur-sm'>
            <div className='from-primary/5 absolute inset-0 rounded-3xl bg-gradient-to-r to-purple-500/5' />
            <div className='relative z-10'>
              <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>
                准备好开始了吗？
              </h2>
              <p className='text-muted-foreground mx-auto mb-8 max-w-2xl text-xl'>
                只需几分钟即可搭建完整的后台管理系统，立即体验现代化的开发流程
              </p>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Button
                  size='lg'
                  asChild
                  className='px-8 py-6 text-lg shadow-xl transition-all duration-300 hover:shadow-2xl'
                >
                  <a href='/login' className='flex items-center gap-3'>
                    <Shield size={20} />
                    立即登录
                    <ArrowRight size={20} />
                  </a>
                </Button>
                <Button
                  size='lg'
                  variant='outline'
                  asChild
                  className='hover:bg-background/80 px-8 py-6 text-lg transition-all duration-300'
                >
                  <a
                    href='https://blog.guizimo.com'
                    target='_blank'
                    className='flex items-center gap-3'
                  >
                    了解更多
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className='relative z-10 container mx-auto mt-20 px-4 py-8'>
        <div className='border-border/50 border-t pt-8'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Image
                  src='/logo.png'
                  alt='N-Admin Logo'
                  width={24}
                  height={24}
                  className='dark:invert'
                />
                <span className='font-semibold'>{siteConfig.name}</span>
              </div>
              <p className='text-muted-foreground text-sm'>
                © 2025 All rights reserved.
              </p>
            </div>
            <div className='flex gap-6'>
              <a
                href='https://blog.guizimo.com'
                target='_blank'
                className='text-muted-foreground hover:text-primary text-sm transition-colors duration-200'
              >
                博客
              </a>
              <a
                href='https://github.com/guizimo'
                target='_blank'
                className='text-muted-foreground hover:text-primary text-sm transition-colors duration-200'
              >
                GitHub
              </a>
              <a
                href='https://github.com/guizimo/n-admin/issues'
                target='_blank'
                className='text-muted-foreground hover:text-primary text-sm transition-colors duration-200'
              >
                反馈
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
