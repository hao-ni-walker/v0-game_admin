"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useEffect, useState } from "react"

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>
      <DataTable columns={columns} data={users} loading={loading} />
    </div>
  )
}