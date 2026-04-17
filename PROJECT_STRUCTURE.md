# 项目文件结构

## 完整目录树

```
wokao/                          # 项目根目录
│
├── 📄 package.json             # 项目配置和依赖
├── 📄 tsconfig.json            # TypeScript 配置
├── 📄 tailwind.config.ts      # Tailwind CSS 配置
├── 📄 postcss.config.js        # PostCSS 配置
├── 📄 next.config.js           # Next.js 配置
├── 📄 .env.example             # 环境变量示例
├── 📄 .env.local              # 本地环境变量（需手动创建）
├── 📄 .gitignore              # Git 忽略文件
├── 📄 next-env.d.ts           # Next.js 类型声明
│
├── 📂 src/                    # 源代码目录
│   │
│   ├── 📂 app/               # Next.js App Router
│   │   ├── 📄 globals.css    # 全局样式
│   │   ├── 📄 layout.tsx     # 根布局
│   │   ├── 📄 page.tsx      # 首页（登录/注册）
│   │   │
│   │   ├── 📂 onboarding/   # 选课引导页面
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📂 dashboard/    # 首页仪表盘
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📂 upload/      # 上传真题页面
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📂 verify/       # 验证任务页面
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📂 search/      # 搜索真题页面
│   │   │   └── 📄 page.tsx
│   │   │
│   │   └── 📂 profile/      # 个人中心页面
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 components/       # React 组件
│   │   ├── 📄 AuthProvider.tsx  # 认证上下文提供者
│   │   └── 📄 Navigation.tsx    # 导航栏组件
│   │
│   └── 📂 lib/              # 工具库
│       ├── 📄 supabase.ts   # Supabase 客户端
│       └── 📄 types.ts      # TypeScript 类型定义
│
├── 📂 supabase/              # Supabase 配置
│   └── 📄 schema.sql        # 数据库 Schema
│
├── 📂 scripts/               # 脚本文件
│   └── 📄 setup.bat         # Windows 安装脚本
│
├── 📂 docs/                  # 文档目录
│   └── 📄 ARCHITECTURE.md   # 系统架构文档
│
├── 📄 README.md             # 项目说明
├── 📄 SETUP.md              # 设置指南
├── 📄 FEATURES.md          # 功能清单
└── 📄 PROJECT_STRUCTURE.md # 本文件

```

## 目录功能说明

### 📂 src/app/
Next.js App Router 目录，包含所有页面和布局。

**页面路由**:
- `/` → [page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\page.tsx) - 登录/注册
- `/onboarding` → [onboarding/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\onboarding\page.tsx) - 选课引导
- `/dashboard` → [dashboard/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\dashboard\page.tsx) - 首页仪表盘
- `/upload` → [upload/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\upload\page.tsx) - 上传真题
- `/verify` → [verify/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\verify\page.tsx) - 验证任务
- `/search` → [search/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\search\page.tsx) - 搜索真题
- `/profile` → [profile/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\profile\page.tsx) - 个人中心

### 📂 src/components/
可复用的 React 组件。

- [AuthProvider.tsx](file:///c:\Users\Betran\Desktop\wokao\src\components\AuthProvider.tsx) - 用户认证状态管理
- [Navigation.tsx](file:///c:\Users\Betran\Desktop\wokao\src\components\Navigation.tsx) - 顶部和底部导航

### 📂 src/lib/
工具函数和配置。

- [supabase.ts](file:///c:\Users\Betran\Desktop\wokao\src\lib\supabase.ts) - Supabase 客户端初始化
- [types.ts](file:///c:\Users\Betran\Desktop\wokao\src\lib\types.ts) - TypeScript 接口定义

### 📂 supabase/
Supabase 相关文件。

- [schema.sql](file:///c:\Users\Betran\Desktop\wokao\supabase\schema.sql) - 数据库建表语句和触发器

## 快速文件定位

| 功能 | 文件路径 |
|------|---------|
| 登录注册 | [src/app/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\page.tsx) |
| 选课引导 | [src/app/onboarding/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\onboarding\page.tsx) |
| 首页仪表盘 | [src/app/dashboard/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\dashboard\page.tsx) |
| 上传真题 | [src/app/upload/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\upload\page.tsx) |
| 验证任务 | [src/app/verify/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\verify\page.tsx) |
| 搜索真题 | [src/app/search/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\search\page.tsx) |
| 个人中心 | [src/app/profile/page.tsx](file:///c:\Users\Betran\Desktop\wokao\src\app\profile\page.tsx) |
| 认证管理 | [src/components/AuthProvider.tsx](file:///c:\Users\Betran\Desktop\wokao\src\components\AuthProvider.tsx) |
| 导航栏 | [src/components/Navigation.tsx](file:///c:\Users\Betran\Desktop\wokao\src\components\Navigation.tsx) |
| Supabase 客户端 | [src/lib/supabase.ts](file:///c:\Users\Betran\Desktop\wokao\src\lib\supabase.ts) |
| 类型定义 | [src/lib/types.ts](file:///c:\Users\Betran\Desktop\wokao\src\lib\types.ts) |
| 数据库 Schema | [supabase/schema.sql](file:///c:\Users\Betran\Desktop\wokao\supabase\schema.sql) |

## 文件大小统计

```
总计: 约 30+ 个文件
主要代码文件: 10 个 React/TypeScript 组件
配置文件: 8 个
文档文件: 5 个
```

## 依赖包

**主要依赖**:
- `next`: ^14.2.13 - React 框架
- `react`: ^18.3.1 - React 库
- `@supabase/supabase-js`: ^2.45.0 - Supabase 客户端
- `lucide-react`: ^0.446.0 - 图标库

**开发依赖**:
- `typescript`: ^5 - TypeScript 编译器
- `tailwindcss`: ^3.4.13 - CSS 框架
- `eslint`: ^8 - 代码检查

---

**提示**: 点击上方文件路径可直接跳转到对应文件。
