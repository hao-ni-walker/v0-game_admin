'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Search } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MANUAL_MARKDOWN, MANUAL_TOC, MANUAL_UPDATED_AT } from '@/content/operations-manual';

/**
 * 运营手册页 —— 内容由 pnpm manual:sync 从仓库 docs/product_operations_manual.md
 * 单向生成（单源，无手抄）。生成的字符串若与源文件不一致，
 * src/content/operations-manual.test.ts 会失败。
 */

/** TOC 项与正文标题共用此函数，锚点才不会错位。 */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '');
}

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object' && 'props' in (node as { props?: { children?: React.ReactNode } })) {
    return textOf((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

function Heading({
  level,
  children,
}: {
  level: 2 | 3;
  children: React.ReactNode;
}) {
  const id = slugify(textOf(children));
  const className =
    level === 2
      ? 'mt-8 mb-3 scroll-mt-4 border-b pb-2 text-lg font-semibold'
      : 'mt-5 mb-2 scroll-mt-4 text-base font-semibold';
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className='mb-3 text-xl font-semibold'>{children}</h1>,
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }) => <h4 className='mt-4 mb-1.5 text-sm font-semibold'>{children}</h4>,
  p: ({ children }) => <p className='text-muted-foreground my-2 text-sm leading-relaxed'>{children}</p>,
  ul: ({ children }) => <ul className='text-muted-foreground my-2 list-disc space-y-1 pl-5 text-sm'>{children}</ul>,
  ol: ({ children }) => <ol className='text-muted-foreground my-2 list-decimal space-y-1 pl-5 text-sm'>{children}</ol>,
  li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className='border-primary/40 text-muted-foreground my-3 border-l-2 pl-3 text-sm'>
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target='_blank'
      rel='noreferrer noopener'
      className='text-primary underline underline-offset-2'
    >
      {children}
    </a>
  ),
  hr: () => <hr className='my-6' />,
  table: ({ children }) => (
    <div className='my-3 overflow-x-auto rounded-md border'>
      <table className='w-full border-collapse text-xs'>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className='bg-muted/50'>{children}</thead>,
  th: ({ children }) => (
    <th className='border-b px-2 py-1.5 text-left font-medium whitespace-nowrap'>{children}</th>
  ),
  td: ({ children }) => <td className='border-b px-2 py-1.5 align-top'>{children}</td>,
  code: ({ children }) => (
    <code className='bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]'>{children}</code>
  ),
  pre: ({ children }) => (
    <pre className='bg-muted my-3 overflow-x-auto rounded-md p-3 font-mono text-xs [&>code]:bg-transparent [&>code]:p-0'>
      {children}
    </pre>
  ),
};

export default function OperationsManualPage() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const toc = useMemo(
    () =>
      MANUAL_TOC.map((heading) => ({ ...heading, id: slugify(heading.title) })).filter(
        (heading) => !query.trim() || heading.title.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  const jump = (id: string) => {
    setActiveId(id);
    // 章节间可能相隔上千行，平滑滚动会拖很久；目录跳转按惯例直接定位。
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <BookOpen className='h-5 w-5' />
          <h1 className='text-lg font-semibold'>运营手册</h1>
          {MANUAL_UPDATED_AT && <Badge variant='outline'>更新 {MANUAL_UPDATED_AT}</Badge>}
          <span className='text-muted-foreground ml-auto hidden text-xs sm:inline'>
            内容与仓库 docs/product_operations_manual.md 同源（发布时同步）
          </span>
        </div>

        <div className='flex min-h-0 flex-1 gap-6'>
          <aside className='hidden w-64 shrink-0 flex-col border-r pr-3 lg:flex'>
            <div className='relative pb-2'>
              <Search className='text-muted-foreground absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2' />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='搜索章节'
                className='h-8 pl-7 text-xs'
              />
            </div>
            <nav className='min-h-0 flex-1 overflow-y-auto pr-1'>
              <ul className='space-y-0.5 pb-6'>
                {toc.map((heading) => (
                  <li key={heading.id}>
                    <button
                      type='button'
                      onClick={() => jump(heading.id)}
                      className={`w-full truncate rounded px-2 py-1 text-left text-xs transition-colors hover:bg-muted ${
                        heading.level === 3 ? 'pl-5 text-muted-foreground' : 'font-medium'
                      } ${activeId === heading.id ? 'bg-muted' : ''}`}
                      title={heading.title}
                    >
                      {heading.title}
                    </button>
                  </li>
                ))}
                {toc.length === 0 && (
                  <li className='text-muted-foreground px-2 py-1 text-xs'>没有匹配的章节</li>
                )}
              </ul>
            </nav>
          </aside>

          <div className='min-h-0 flex-1 overflow-y-auto pr-2 pb-16'>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {MANUAL_MARKDOWN}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
