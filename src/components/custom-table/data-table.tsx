'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { TableSkeleton } from './table-skeleton';

interface Column<T> {
  key: string;
  title: string;
  className?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: string | ((record: T) => string);
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = '暂无数据',
  rowKey = 'id'
}: DataTableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  if (loading) {
    return (
      <TableSkeleton
        columnCount={columns.length}
        rowCount={8}
        showHeader={true}
      />
    );
  }

  return (
    <div className='min-h-0 flex-1 overflow-auto rounded-md border'>
      <Table>
        <TableHeader className='sticky top-0 z-10'>
          <TableRow className='bg-muted/50'>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`font-semibold ${column.className || ''}`}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='text-muted-foreground h-24 text-center'
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((record, index) => (
              <TableRow
                key={getRowKey(record, index)}
                className='hover:bg-muted/50'
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render
                      ? column.render(record[column.key], record, index)
                      : record[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
