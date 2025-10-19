# 去掉 MySQL 与 Drizzle，以仓储+JSON 替代

## Core Features

- 无数据库运行的用户与角色权限管理

- 统一仓储接口替代数据层

- JSON文件持久化与内存索引

- 日志记录与统计查询

- 管理员初始化脚本改造

## Tech Stack

{
  "Web": {
    "arch": "react",
    "component": null
  },
  "iOS": null,
  "Android": null
}

## Design

不涉及UI变更，保留现有界面与交互

## Plan

Note: 

- [ ] is holding
- [/] is doing
- [X] is done

---

[/] 建立 Users、Roles、Permissions、Logs 仓储接口（CRUD、分页、筛选、排序）

[/] 实现基于JSON文件的仓储（加载/保存、内存索引、数据校验）

[X] 替换所有 API 路由为仓储方法调用，保持响应结构不变

[X] 迁移服务端权限与超级管理员逻辑至仓储接口

[X] 改写初始化管理员脚本，写入JSON并保留密码哈希

[X] 为日志与统计实现文件端聚合与区间统计

[/] 确认前端页面与交互无改动，数据源透明替换
