import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Shield, Zap, Palette, Users, BarChart3, Code2 } from "lucide-react";
import { getGithubStats } from '@/lib/github';
import { Star } from 'lucide-react';

export default async function Home() {
  const { stars } = await getGithubStats();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      {/* 导航栏 */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between backdrop-blur-sm bg-background/80 rounded-2xl px-6 py-4 border border-border/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm" />
              <Image
                src="/logo.png"
                alt="N-Admin Logo"
                width={36}
                height={36}
                className="relative dark:invert"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              N Admin
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/guizimo/n-admin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            >
              <Github size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">GitHub</span>
              <div className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded-full border">
                <Star size={14} className="text-yellow-500" />
                <span className="font-medium">{stars}</span>
              </div>
            </a>
            <Button asChild className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <a href="/dashboard" className="flex items-center gap-2">
                立即使用
                <ArrowRight size={16} />
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative z-10 flex-1 container mx-auto px-4 flex flex-col justify-center">
        {/* 英雄区域 */}
        <div className="max-w-5xl mx-auto text-center mb-20">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-6">
              <Zap size={16} />
              <span>基于 Next.js 15 构建</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              现代化的
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              后台管理系统
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            基于 <span className="text-foreground font-semibold">Next.js 15</span> 和 <span className="text-foreground font-semibold">Shadcn UI</span> 构建的完整后台管理系统模板，
            <br className="hidden sm:block" />
            帮助你快速搭建 <span className="text-primary font-semibold">企业级应用</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild className="text-lg px-8 py-6 shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105">
              <a href="/dashboard" className="flex items-center gap-3">
                <Zap size={20} />
                开始使用
                <ArrowRight size={20} />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 hover:bg-muted/50 transition-all duration-300">
              <a href="https://github.com/guizimo/n-admin" target="_blank" className="flex items-center gap-3">
                <Code2 size={20} />
                查看源码
              </a>
            </Button>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">为什么选择 N Admin？</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              集成最新技术栈，提供完整的解决方案，让你专注于业务逻辑
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: "现代技术栈",
                description: "采用 Next.js 15、React 19、TypeScript、Tailwind CSS 等最新技术，确保项目的先进性和可维护性",
                gradient: "from-yellow-500/10 to-orange-500/10"
              },
              {
                icon: <Shield className="w-8 h-8 text-green-500" />,
                title: "完整的权限系统",
                description: "内置用户认证、角色管理、权限控制等企业级功能，开箱即用的安全解决方案",
                gradient: "from-green-500/10 to-emerald-500/10"
              },
              {
                icon: <Palette className="w-8 h-8 text-purple-500" />,
                title: "优雅的设计",
                description: "基于 Shadcn UI 和 Radix UI 构建，支持亮色/暗色主题，提供一致的设计体验",
                gradient: "from-purple-500/10 to-pink-500/10"
              },
              {
                icon: <Users className="w-8 h-8 text-blue-500" />,
                title: "用户管理",
                description: "完整的用户管理功能，包括用户创建、编辑、删除、角色分配等操作",
                gradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-red-500" />,
                title: "数据可视化",
                description: "内置图表组件，支持多种图表类型，让数据展示更加直观和美观",
                gradient: "from-red-500/10 to-rose-500/10"
              },
              {
                icon: <Code2 className="w-8 h-8 text-indigo-500" />,
                title: "开发友好",
                description: "完整的 TypeScript 支持，规范的代码结构，详细的文档，提升开发效率",
                gradient: "from-indigo-500/10 to-violet-500/10"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex p-3 rounded-xl bg-background/80 border">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 区域 */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                准备好开始了吗？
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                只需几分钟即可搭建完整的后台管理系统，立即体验现代化的开发流程
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <a href="/login" className="flex items-center gap-3">
                    <Shield size={20} />
                    立即登录
                    <ArrowRight size={20} />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 hover:bg-background/80 transition-all duration-300">
                  <a href="https://blog.guizimo.com" target="_blank" className="flex items-center gap-3">
                    了解更多
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 container mx-auto px-4 py-8 mt-20">
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="N-Admin Logo"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
                <span className="font-semibold">N Admin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <a 
                href="https://blog.guizimo.com" 
                target="_blank"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                博客
              </a>
              <a 
                href="https://github.com/guizimo" 
                target="_blank"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                GitHub
              </a>
              <a 
                href="https://github.com/guizimo/n-admin/issues" 
                target="_blank"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                反馈
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
