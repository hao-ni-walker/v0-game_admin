'use client';

import { AlertTriangle, Info, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PREDICTION_MANUAL } from '../manual';

interface ManualDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 运营说明抽屉。内容源在 ../manual.ts，与 docs/product_operations_manual.md
 * §16 同源维护；后台内嵌一份是为了运营不必翻仓库就能查口径。
 */
export function ManualDrawer({ open, onOpenChange }: ManualDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='h-full w-full overflow-y-auto sm:max-w-2xl'>
        <DrawerHeader className='border-b pb-3'>
          <DrawerTitle className='flex items-center gap-2 pr-8 text-base leading-snug'>
            <BookOpen className='h-4 w-4' />
            预测市场运营说明
          </DrawerTitle>
          <DrawerDescription>
            对应运营手册 §16，口径冲突以手册为准。上架/参数/报错处置都在这里查。
          </DrawerDescription>
        </DrawerHeader>

        <div className='space-y-6 px-4 pb-10'>
          {PREDICTION_MANUAL.map((section) => (
            <section key={section.id} id={`manual-${section.id}`} className='space-y-2'>
              <h3 className='text-sm font-semibold'>{section.title}</h3>
              {section.intro && (
                <p className='text-muted-foreground text-sm leading-relaxed'>{section.intro}</p>
              )}

              {section.steps && (
                <ol className='list-decimal space-y-1 pl-5 text-sm'>
                  {section.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              )}

              {section.bullets && (
                <ul className='list-disc space-y-1 pl-5 text-sm'>
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {section.table.headers.map((h) => (
                          <TableHead key={h} className='whitespace-nowrap text-xs'>
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.table.rows.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => (
                            <TableCell
                              key={j}
                              className={
                                j === 0
                                  ? 'whitespace-nowrap text-xs font-medium'
                                  : 'text-muted-foreground text-xs'
                              }
                            >
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {section.callout && (
                <Alert variant={section.callout.tone === 'warn' ? 'destructive' : 'default'}>
                  {section.callout.tone === 'warn' ? (
                    <AlertTriangle className='h-4 w-4' />
                  ) : (
                    <Info className='h-4 w-4' />
                  )}
                  <AlertTitle>{section.callout.title}</AlertTitle>
                  <AlertDescription>{section.callout.body}</AlertDescription>
                </Alert>
              )}
            </section>
          ))}

          <div className='text-muted-foreground flex flex-wrap items-center gap-2 border-t pt-4 text-xs'>
            <Badge variant='outline'>手册章节</Badge>
            <span>§16.1 同步 · §16.2 上架 · §16.3 与秒合约区别 · §16.5 交易设置 · §16.6 结算</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
