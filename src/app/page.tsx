import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import { getGithubStats } from '@/lib/github';
import { Star } from 'lucide-react';

export default async function Home() {
  const { stars } = await getGithubStats();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      {/* 导航栏 */}
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="N-Admin Logo"
            width={32}
            height={32}
            className="dark:invert"
          />
          <span className="text-lg font-bold">N Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/guizimo/n-admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary"
          >
            <Github size={20} />
            <span>GitHub</span>
            <div className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-full">
              <Star size={14} />
              <span>{stars}</span>
            </div>
          </a>
          <Button asChild>
            <a href="/dashboard">立即使用</a>
          </Button>
        </div>
      </nav>

      {/* 主要内容 - 添加 flex-1 和垂直居中 */}
      <main className="flex-1 container mx-auto px-4 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            现代化的后台管理系统解决方案
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            基于 Next.js 15 和 Shadcn UI 构建的完整后台管理系统模板，
            帮助你快速搭建企业级应用
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/dashboard">
                开始使用
                <ArrowRight className="ml-2" size={16} />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/docs">查看文档</a>
            </Button>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-3">现代技术栈</h3>
            <p className="text-muted-foreground">
              采用 Next.js 15、TypeScript、Tailwind CSS 等现代技术栈，
              确保最佳开发体验
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-3">完整功能</h3>
            <p className="text-muted-foreground">
              内置用户认证、权限管理、主题切换等企业级功能，
              快速开始你的项目
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-3">优雅设计</h3>
            <p className="text-muted-foreground">
              基于 Shadcn UI 构建的优雅界面，支持亮色/暗色主题，
              提供出色的用户体验
            </p>
          </div>
        </div>
      </main>

      {/* 页脚 - 移除 mt-8 */}
      <footer className="container mx-auto px-4 py-4 border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 N-Admin. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://blog.guizimo.com" className="text-sm text-muted-foreground hover:text-foreground">
              博客
            </a>
            <a href="https://github.com/guizimo" className="text-sm text-muted-foreground hover:text-foreground">
              关于
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
