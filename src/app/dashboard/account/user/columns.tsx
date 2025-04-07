"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type User = {
  id: number
  email: string
  username: string
  role: string
  createdAt: string
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "用户名"
  },
  {
    accessorKey: "email",
    header: "邮箱"
  },
  {
    accessorKey: "role",
    header: "角色",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return <Badge>{role}</Badge>
    }
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleString()
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              // @ts-ignore
              table.options.meta?.onEdit?.(user)
            }}>
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]