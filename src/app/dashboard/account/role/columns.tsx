"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type Role = {
  id: number
  name: string
  description: string
  permissions: string[]
  createdAt: string
}

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "角色名称"
  },
  {
    accessorKey: "description",
    header: "描述"
  },
  {
    accessorKey: "permissions",
    header: "权限",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[]
      return permissions.join(", ")
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
    cell: ({ row }) => {
      const role = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>编辑</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]