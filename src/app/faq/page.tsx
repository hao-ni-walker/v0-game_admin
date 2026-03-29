import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: '常见问题',
  description: 'N Admin 常见问题解答 - 了解关于技术栈、功能特性、安装配置等方面的详细解答',
  keywords: ['FAQ', '常见问题', '帮助文档', 'N Admin 问题', '后台管理系统问题'],
  alternates: {
    canonical: `${siteConfig.url}/faq`
  },
  openGraph: {
    title: '常见问题 | N Admin',
    description: 'N Admin 常见问题解答 - 了解关于技术栈、功能特性、安装配置等方面的详细解答',
    url: `${siteConfig.url}/faq`,
    type: 'website'
  }
};

const faqs = [
  {
    category: '基础介绍',
    questions: [
      {
        q: 'N Admin 是什么？',
        a: 'N Admin 是一个基于 Next.js 15 和 React 19 构建的现代化后台管理系统模板。它提供了完整的用户认证、角色管理、权限控制、数据可视化等企业级功能，帮助开发者快速搭建专业级的后台管理系统，节省开发时间，提高开发效率。'
      },
      {
        q: 'N Admin 适合什么场景使用？',
        a: 'N Admin 适合各种需要后台管理系统的场景，包括：企业内部管理系统、电商平台后台、内容管理系统（CMS）、数据分析平台、项目管理工具、客户关系管理系统（CRM）等。无论是初创公司还是大型企业，都可以基于 N Admin 快速构建符合需求的管理后台。'
      },
      {
        q: 'N Admin 是免费的吗？',
        a: '是的，N Admin 完全开源免费，采用 MIT 许可证。你可以自由地使用、修改和分发，无论是个人项目还是商业项目都无需支付费用。我们相信开源社区的力量，致力于为开发者提供高质量的开发工具。'
      }
    ]
  },
  {
    category: '技术栈',
    questions: [
      {
        q: 'N Admin 使用了哪些核心技术？',
        a: 'N Admin 采用最新且经过验证的技术栈：核心框架使用 Next.js 15（支持 App Router 和 Server Components）、React 19、TypeScript 5；UI 框架使用 Tailwind CSS 4、Shadcn UI、Radix UI；状态管理使用 Zustand；数据可视化使用 Recharts；认证使用 NextAuth.js 4。这些技术都是业界主流，拥有庞大的社区支持和丰富的生态系统。'
      },
      {
        q: '为什么选择 Next.js 15 而不是其他框架？',
        a: 'Next.js 15 是最新的 React 框架版本，提供了诸多优势：服务端组件（RSC）提升性能、Streaming 改善用户体验、内置图片优化和字体优化、App Router 提供更灵活的路由、Server Actions 简化数据操作、优秀的 SEO 支持、强大的开发者体验。这些特性让 Next.js 成为构建现代化 Web 应用的理想选择。'
      },
      {
        q: 'N Admin 支持 TypeScript 吗？',
        a: '完全支持！N Admin 从头到尾都使用 TypeScript 编写，提供了完整的类型定义和类型检查。这不仅可以减少运行时错误，还能提供更好的代码提示和自动补全，显著提升开发效率和代码质量。所有的组件、工具函数、API 接口都有完整的类型定义。'
      },
      {
        q: 'N Admin 的 UI 组件基于什么？',
        a: 'N Admin 的 UI 组件基于 Shadcn UI 和 Radix UI 构建。Shadcn UI 是一组可复制的组件集合，可以直接复制到项目中，拥有完全的控制权；Radix UI 提供了无障碍访问的原始组件。这种组合既保证了设计的现代性和一致性，又确保了组件的可访问性和可定制性。所有组件都支持亮色/暗色主题切换。'
      }
    ]
  },
  {
    category: '功能特性',
    questions: [
      {
        q: 'N Admin 有哪些核心功能？',
        a: 'N Admin 提供了完整的后台管理系统功能：1) 用户管理 - 用户创建、编辑、删除、状态管理；2) 角色管理 - 角色定义、权限分配；3) 权限管理 - 基于 RBAC 的细粒度权限控制；4) 数据可视化 - 图表展示、数据统计；5) 系统配置 - 系统参数设置；6) 日志管理 - 操作日志记录和查询；7) 响应式设计 - 支持桌面、平板、移动端；8) 主题切换 - 亮色/暗色模式。'
      },
      {
        q: 'N Admin 的权限系统是如何工作的？',
        a: 'N Admin 实现了完整的 RBAC（基于角色的访问控制）权限模型。系统包含三个核心概念：用户（User）、角色（Role）、权限（Permission）。一个用户可以拥有多个角色，每个角色包含多个权限。权限可以控制到具体的操作级别（如查看、创建、编辑、删除）。系统提供了服务端和客户端两套权限验证机制，确保安全性。同时支持菜单级权限和按钮级权限控制。'
      },
      {
        q: 'N Admin 支持主题切换吗？',
        a: '是的，N Admin 完全支持亮色和暗色主题切换。系统使用 next-themes 库管理主题，支持系统主题检测、手动切换、主题持久化。所有 UI 组件都经过精心设计，确保在两种主题下都有良好的视觉效果。用户可以在设置中切换主题，系统会自动保存用户偏好。'
      },
      {
        q: 'N Admin 是否支持国际化？',
        a: '当前版本主要针对中文用户优化，但架构上支持扩展国际化功能。系统使用了 Next.js 的 i18n 配置，可以方便地添加多语言支持。如果你需要国际化功能，可以通过添加对应的语言文件和翻译配置来实现。'
      }
    ]
  },
  {
    category: '安装与配置',
    questions: [
      {
        q: '如何安装和启动 N Admin？',
        a: '安装步骤非常简单：1) 克隆或下载项目代码；2) 在项目根目录运行 pnpm install（推荐）或 npm install 安装依赖；3) 复制 .env.example 为 .env.local，配置必要的环境变量（数据库连接、JWT 密钥等）；4) 运行 npm run init:admin 初始化管理员账户；5) 运行 npm run dev 启动开发服务器；6) 访问 http://localhost:3001 查看效果。整个过程大约需要 5-10 分钟。'
      },
      {
        q: 'N Admin 对系统有什么要求？',
        a: '开发环境要求：Node.js 18.17 或更高版本、推荐使用 ppm 9+ 或 npm 9+ 作为包管理器；现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）；代码编辑器推荐 VS Code。生产环境可以部署到任何支持 Node.js 的平台，如 Vercel、Netlify、Docker 容器、自己的服务器等。'
      },
      {
        q: '如何配置数据库？',
        a: 'N Admin 支持多种数据库配置。在 .env.local 文件中设置数据库连接字符串：DATABASE_URL="你的数据库连接"。支持的数据库包括 PostgreSQL、MySQL、SQLite 等（取决于使用的 ORM）。系统提供了数据库迁移工具，可以方便地管理数据库结构。首次运行时需要执行数据库迁移命令创建表结构。'
      },
      {
        q: '如何部署到生产环境？',
        a: '部署到生产环境很简单：1) 运行 npm run build 构建生产版本；2) 运行 npm start 启动生产服务器；3) 或使用 npm run export 导出静态文件。推荐使用 Vercel 部署，只需将代码推送到 GitHub，在 Vercel 中导入项目即可自动部署。也可以部署到其他平台如 Netlify、Railway、自己的服务器（使用 PM2 或 Docker）。确保在生产环境中设置正确的环境变量。'
      }
    ]
  },
  {
    category: '开发与定制',
    questions: [
      {
        q: '如何添加新的页面？',
        a: '在 Next.js 15 的 App Router 架构下添加新页面非常简单：在 src/app 目录下创建新的文件夹和 page.tsx 文件。例如创建 /src/app/dashboard/users/page.tsx 就会对应 /dashboard/users 路由。页面会自动继承布局文件（layout.tsx）。你可以在页面中使用任何 UI 组件，系统提供了丰富的组件库和工具函数。'
      },
      {
        q: '如何修改现有组件的样式？',
        a: 'N Admin 使用 Tailwind CSS，样式修改非常灵活。你可以：1) 直接修改组件的 className 添加 Tailwind 类名；2) 在 tailwind.config.js 中自定义主题颜色；3) 修改组件的源代码（因为 Shadcn UI 组件是复制到项目中的，拥有完全控制权）；4) 使用 CSS 变量覆盖全局样式。所有样式都是可定制的，不会遇到传统 UI 库的限制。'
      },
      {
        q: '如何集成第三方 API？',
        a: 'N Admin 提供了完善的 API 集成支持。你可以在 src/lib 或 src/services 目录下创建 API 调用函数。支持服务端调用（在 Server Components 或 Server Actions 中）和客户端调用（使用 useEffect 或 React Query）。系统已经配置好了 fetch 封装和错误处理，你只需要添加具体的 API 接口即可。对于第三方认证（如 OAuth、微信登录等），可以通过 NextAuth.js 的 Provider 机制集成。'
      },
      {
        q: '如何添加新的数据表和 CRUD 功能？',
        a: '添加新数据表的步骤：1) 定义数据库模型（Schema）；2) 创建数据库迁移文件；3) 运行迁移创建表；4) 在 src/lib 目录下创建对应的数据操作函数（CRUD）；5) 创建页面和组件展示数据；6) 添加表单组件用于创建和编辑；7) 配置路由和权限。系统提供了完整的示例代码，你可以参考现有的用户、角色等模块的实现。'
      }
    ]
  },
  {
    category: '性能与安全',
    questions: [
      {
        q: 'N Admin 的性能如何？',
        a: 'N Admin 经过性能优化，具备出色的性能表现：使用 Next.js 15 的服务端组件减少客户端 JavaScript 体积；支持流式渲染提升首屏速度；图片使用 Next/Image 组件自动优化；字体使用 next/font 自动优化；代码分割和懒加载减少初始加载体积；生产构建时会自动 tree-shaking 去除未使用的代码。在普通的 VPS 上可以轻松处理数千并发用户。'
      },
      {
        q: 'N Admin 有哪些安全措施？',
        a: 'N Admin 实现了多层安全防护：1) 认证安全 - 使用 NextAuth.js 和 JWT，支持会话管理和令牌刷新；2) 权限控制 - 服务端和客户端双重权限验证，防止越权访问；3) 密码安全 - 使用 bcrypt 加密存储，符合安全标准；4) CSRF 防护 - 内置 CSRF 令牌验证；5) XSS 防护 - React 自动转义，输入验证和清理；6) SQL 注入防护 - 使用参数化查询和 ORM；7) HTTPS 支持 - 生产环境强制使用 HTTPS；8) 安全头设置 - 配置了 Content Security Policy 等安全头。'
      },
      {
        q: 'N Admin 是否支持审计日志？',
        a: '是的，N Admin 内置了完整的操作日志系统。系统会自动记录用户的操作行为，包括登录、登出、数据的创建、修改、删除等。日志包含操作时间、操作人、操作类型、操作内容、IP 地址等详细信息。管理员可以在系统日志页面查看和筛选这些日志，用于安全审计和问题追踪。日志数据存储在数据库中，支持根据需要配置日志保留期限。'
      }
    ]
  },
  {
    category: '支持与贡献',
    questions: [
      {
        q: '如何获得技术支持？',
        a: '我们提供多种支持渠道：1) GitHub Issues - 在项目仓库提交问题，我们会尽快回复；2) 官方文档 - 查看详细的文档和教程；3) 社区讨论 - 在 GitHub Discussions 中与其他用户交流；4) 博客 - 访问作者的博客获取更多技术文章。如果是商业项目需要定制开发或技术支持，也可以通过 GitHub 联系作者。'
      },
      {
        q: '如何贡献代码？',
        a: '我们欢迎任何形式的贡献！贡献流程：1) Fork 项目到你的 GitHub 账户；2) 创建新的分支（git checkout -b feature/your-feature）；3) 进行代码修改并确保通过测试；4) 提交代码（git commit -m "feat: add some feature"）；5) 推送到你的 Fork（git push origin feature/your-feature）；6) 在 GitHub 上创建 Pull Request。请确保遵循项目的代码规范和提交信息规范。我们会在审查后合并你的贡献。'
      },
      {
        q: '如何报告 Bug 或提出功能建议？',
        a: '报告 Bug 时，请提供：详细的问题描述、复现步骤、预期行为、实际行为、环境信息（Node.js 版本、浏览器等）、相关日志或截图。提出功能建议时，请说明：功能的使用场景、预期的行为方式、可能的实现方案。在 GitHub Issues 中提交时，请使用合适的模板和标签，这能帮助我们更快地处理。'
      }
    ]
  }
];

// 生成 FAQ 页面的结构化数据
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.flatMap(category =>
    category.questions.map(q => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.a
      }
    }))
  )
};

export default function FAQPage() {
  return (
    <>
      {/* FAQ 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className='container mx-auto px-4 py-12 max-w-5xl'>
        {/* 页面头部 */}
        <div className='mb-12 text-center'>
          <h1 className='mb-4 text-4xl font-bold sm:text-5xl'>常见问题</h1>
          <p className='text-muted-foreground text-xl'>
            关于 {siteConfig.name} 的常见问题解答
          </p>
          <p className='text-muted-foreground mt-2'>
            找不到您的问题？{' '}
            <a
              href='https://github.com/guizimo/n-admin/issues'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              在 GitHub 上提问
            </a>
          </p>
        </div>

        {/* FAQ 分类列表 */}
        <div className='space-y-12'>
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className='scroll-mt-20' id={category.category}>
              <h2 className='mb-6 text-2xl font-bold border-b pb-2'>
                {category.category}
              </h2>
              <Accordion type='single' collapsible className='w-full'>
                {category.questions.map((faq, questionIndex) => (
                  <AccordionItem
                    key={questionIndex}
                    value={`${categoryIndex}-${questionIndex}`}
                  >
                    <AccordionTrigger className='text-left hover:no-underline'>
                      <span className='font-medium'>{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className='text-muted-foreground leading-relaxed'>
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* 底部 CTA */}
        <div className='mt-16 p-8 text-center rounded-2xl bg-muted/50'>
          <h3 className='mb-3 text-2xl font-bold'>还有其他问题？</h3>
          <p className='text-muted-foreground mb-6'>
            查看完整文档或在社区中获取帮助
          </p>
          <div className='flex flex-col gap-4 sm:flex-row justify-center'>
            <a
              href='https://github.com/guizimo/n-admin'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors'
            >
              查看文档
            </a>
            <a
              href='https://github.com/guizimo/n-admin/issues'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors'
            >
              提交问题
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
