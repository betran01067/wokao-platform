# 我考 (Wokao) 系统架构

## 系统概览

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面 (Frontend)                    │
│  Next.js 14 + React + TypeScript + Tailwind CSS            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │   Auth      │  │  PostgreSQL  │  │    Storage     │    │
│  │  (认证)     │  │   (数据库)   │  │   (文件存储)   │    │
│  └─────────────┘  └──────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 核心功能流程

### 1. 用户注册与认证

```
用户注册 → Supabase Auth → 创建 auth.users 记录 
    ↓
触发器自动创建 → profiles 表记录 (初始积分: 10)
    ↓
跳转到选课页面
```

### 2. 选课流程

```
用户选择课程 → user_courses 表
    ↓
课程与用户关联 → 用于后续验证任务推送
```

### 3. 上传真题流程

```
用户填写表单
    ↓
上传图片到 Storage (exam-images bucket)
    ↓
创建 exams 记录 (status: pending)
    ↓
等待同课程同学验证
```

### 4. 验证流程

```
用户进入验证页面
    ↓
系统查询: 同课程 + 待验证状态的考题
    ↓
用户投票 (真实/虚假 + 理由)
    ↓
创建 votes 记录
    ↓
触发器更新 exams 状态
    ↓
达到阈值 → 状态变更 + 积分奖励
```

### 5. 搜索真题流程

```
用户搜索/筛选
    ↓
查询 exams 表 (仅 verified 状态)
    ↓
关联 courses 表获取课程信息
    ↓
用户查看详情 (消耗 5 积分)
```

## 数据库关系图

```
┌──────────────┐
│   courses    │ 课程表
├──────────────┤
│ id (PK)      │
│ name         │
│ code         │
│ created_at   │
└──────────────┘
       ▲
       │ 1:N
┌──────────────┐
│course_teachers│ 课程-教师关联
├──────────────┤
│ course_id (PK)│
│ teacher_id (PK│
└──────────────┘
       │
       │ N:1
       ▼
┌──────────────┐
│   teachers   │ 教师表
├──────────────┤
│ id (PK)      │
│ name         │
│ created_at   │
└──────────────┘

┌──────────────┐
│   profiles   │ 用户信息表
├──────────────┤
│ id (PK, FK)  │ ← auth.users.id
│ nickname     │
│ avatar_url   │
│ credits      │ 积分余额
│ created_at   │
└──────────────┘
       ▲
       │ 1:N
┌──────────────┐
│ user_courses │ 用户选课表
├──────────────┤
│ user_id (PK) │ ← profiles.id
│ course_id (PK│ ← courses.id
│ semester     │
└──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│    exams     │ 考题表
├──────────────┤
│ id (PK)      │
│ uploader_id  │ ← profiles.id
│ course_id    │ ← courses.id
│ teacher_ids  │ UUID[]
│ year         │
│ semester     │
│ exam_type    │
│ images       │ TEXT[]
│ status       │ pending/verified/fake
│ vote_true    │
│ vote_false   │
│ created_at   │
└──────────────┘
       ▲
       │ 1:N
       │
┌──────────────┐
│    votes     │ 投票记录表
├──────────────┤
│ id (PK)      │
│ exam_id (FK) │ ← exams.id
│ voter_id (FK)│ ← profiles.id
│ is_true      │ BOOLEAN
│ reason       │
│ created_at   │
└──────────────┘
```

## 积分系统

### 积分来源
| 操作 | 积分变化 | 说明 |
|------|---------|------|
| 注册 | +10 | 新用户欢迎奖励 |
| 投票验证 | +1 | 每验证一道题 |
| 上传通过验证 | +20 | 题目被确认为真实 |

### 积分消耗
| 操作 | 积分变化 | 说明 |
|------|---------|------|
| 查看真题详情 | -5 | 查看完整题目图片 |

### 验证阈值
- 最少投票数: 10
- 确认真实: ≥8 真实票
- 判定虚假: ≥6 虚假票

## 安全策略 (RLS)

### 表级策略
1. **courses, teachers, course_teachers**: 公开读取
2. **profiles**: 用户只能读写自己的数据
3. **user_courses**: 用户只能管理自己的课程
4. **exams**: 
   - 所有人可读取 verified 状态
   - 同课程用户可读取 pending 状态（用于验证）
5. **votes**: 用户只能查看自己的投票记录

## 技术亮点

### 1. 自动化的积分管理
- 使用数据库触发器自动处理积分
- 避免前端逻辑错误

### 2. 安全的验证机制
- 只有同课程用户才能验证
- 防止刷票行为
- 多重投票阈值保证准确性

### 3. 实时状态更新
- Supabase Realtime 支持（可选）
- 数据库触发器即时更新状态

### 4. 响应式设计
- 移动端友好的界面
- Tailwind CSS 快速样式开发

## 扩展建议

### 短期优化
1. 添加题目分类标签
2. 实现收藏功能
3. 添加评论系统
4. 优化图片压缩

### 长期发展
1. 添加积分商城
2. 实现学习小组
3. AI 自动识别相似题目
4. 导出功能 (PDF/Word)
5. 成绩预测分析

## 部署建议

### 推荐平台
- **Vercel**: 官方推荐，免费额度充足
- **Supabase**: 后端即服务
- **Cloudflare Pages**: 备选方案

### 环境变量
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 构建命令
```bash
npm run build
npm start
```
