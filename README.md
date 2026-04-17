# 我考 (Wokao) - 大学生课程真题共享平台

一个基于 Next.js 和 Supabase 构建的大学生课程真题共享与验证平台。

## 功能特性

### 1. 用户系统
- 邮箱注册/登录
- 个性化课程选择
- 积分系统（注册送10积分）

### 2. 上传真题
- 支持多张图片上传（最多9张）
- 课程和教师选择
- 考试年份/学期/类型筛选
- 提交后进入待验证状态

### 3. 验证机制
- 同课程同学才能验证
- 投票阈值：10票
- 真实票≥8票 → 已验证
- 虚假票≥6票 → 虚假题目
- 投票奖励：1积分/题
- 上传奖励：20积分/题（通过验证后）

### 4. 搜索真题
- 课程名模糊搜索
- 高级筛选（年份/学期/类型）
- 已验证真题优先展示
- 查看详情消耗5积分

### 5. 个人中心
- 我的上传管理
- 验证记录查看
- 课程管理（添加/删除）
- 积分余额查看

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Supabase (Auth + PostgreSQL + Storage)
- **图标**: Lucide React

## 快速开始

### 1. 环境要求
- Node.js 18+
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建一个新项目
2. 在 SQL Editor 中运行 `supabase/schema.sql` 文件
3. 复制项目 URL 和 anon key
4. 创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 创建存储桶

在 Supabase Storage 中创建一个名为 `exam-images` 的公共存储桶

### 5. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 项目结构

```
wokao/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 登录/注册页
│   │   ├── onboarding/           # 选课引导页
│   │   ├── dashboard/            # 首页仪表盘
│   │   ├── upload/               # 上传真题
│   │   ├── verify/               # 验证任务
│   │   ├── search/               # 搜索真题
│   │   ├── profile/              # 个人中心
│   │   ├── layout.tsx            # 根布局
│   │   └── globals.css           # 全局样式
│   ├── components/
│   │   ├── AuthProvider.tsx      # 认证上下文
│   │   └── Navigation.tsx        # 导航栏
│   └── lib/
│       ├── supabase.ts           # Supabase 客户端
│       └── types.ts              # TypeScript 类型
├── supabase/
│   └── schema.sql                # 数据库 schema
└── public/                       # 静态资源
```

## 数据库表

- `courses` - 课程库
- `teachers` - 教师库
- `course_teachers` - 课程-教师关联
- `profiles` - 用户扩展信息
- `user_courses` - 用户选课关系
- `exams` - 考题表
- `votes` - 投票记录表

## 页面路由

- `/` - 登录/注册
- `/onboarding` - 选课引导（注册后）
- `/dashboard` - 首页仪表盘
- `/upload` - 上传真题
- `/verify` - 验证任务
- `/search` - 搜索真题
- `/profile` - 个人中心

## 积分规则

| 操作 | 积分变化 |
|------|---------|
| 注册 | +10 |
| 查看真题详情 | -5 |
| 投票（验证） | +1 |
| 上传真题通过验证 | +20 |

## License

MIT
