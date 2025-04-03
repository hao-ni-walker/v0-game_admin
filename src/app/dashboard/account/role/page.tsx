"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useEffect, useState } from "react"

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">角色管理</h1>
      <DataTable columns={columns} data={roles} loading={loading} />
    </div>
  )
}