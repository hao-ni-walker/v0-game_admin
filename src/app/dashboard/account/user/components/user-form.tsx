"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface UserFormProps {
  onSubmit: (values: any) => void
  onCancel?: () => void
}

export function UserForm({ onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="请输入用户名"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="请输入邮箱"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="请输入密码"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>角色</Label>
        <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
          <SelectTrigger>
            <SelectValue placeholder="选择角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">管理员</SelectItem>
            <SelectItem value="user">普通用户</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit">提交</Button>
      </div>
    </form>
  )
}