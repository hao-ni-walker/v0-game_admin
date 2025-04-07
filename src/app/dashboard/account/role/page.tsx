"use client"

import { DataTable } from "@/components/common/data-table"
import { columns } from "./columns"
import { useEffect, useState } from "react"
import PageContainer from "@/components/layout/page-container"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/common/heading"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { RoleForm } from "./components/role-form"

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      toast.error("获取角色列表失败")
    }
  }

  const handleCreateOrUpdateRole = async (values: any) => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles"
      const method = editingRole ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success(editingRole ? "角色更新成功" : "角色创建成功")
        setOpen(false)
        fetchRoles()
        setEditingRole(null)
      }
    } catch (error) {
      toast.error(editingRole ? "更新角色失败" : "创建角色失败")
    }
  }

  const handleDelete = async (role: any) => {
    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("角色删除成功")
        fetchRoles()
      }
    } catch (error) {
      toast.error("删除角色失败")
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="角色管理"
            description="管理系统角色"
          />
          <Button onClick={() => {
            setEditingRole(null)
            setOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />新增角色
          </Button>
        </div>
        <Separator />
        <DataTable 
          columns={columns} 
          data={roles}
          totalItems={roles.length}
          meta={{
            onEdit: (role: any) => {
              setEditingRole(role)
              setOpen(true)
            },
            onDelete: handleDelete
          }}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? "编辑角色" : "新增角色"}</DialogTitle>
          </DialogHeader>
          <RoleForm 
            initialData={editingRole}
            onSubmit={handleCreateOrUpdateRole}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
