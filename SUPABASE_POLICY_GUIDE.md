# Supabase Policy 创建指南（图形界面）

## 问题说明

Supabase Dashboard 提供了 "Create a policy from scratch" 选项，让你从头创建策略。以下是详细的配置步骤。

## 详细操作步骤

### 步骤 1: 进入 Policies 页面

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 左侧菜单点击 **"Database"**
4. 展开左侧树形菜单，找到 **"Tables"**
5. 点击 **"exams"** 表
6. 点击右侧 **"Policies"** 标签页
7. 点击 **"Add a policy"** 按钮

### 步骤 2: 选择创建方式

你会看到几个选项：
- ✅ **For existing rows** - 基于现有行的策略
- ✅ **For new rows** - 插入新行时的策略
- ✅ **For all rows** - 所有行的策略
- ✅ **Create a policy from scratch** ← 选择这个

点击 **"Create a policy from scratch"**

### 步骤 3: 配置 Policy 详情

#### 3.1 Policy 名称

在 **"Policy name"** 输入框中输入：

```
Users can delete own exams
```

#### 3.2 Policy 描述（可选）

```
Allow users to delete their own pending exams
```

#### 3.3 选择操作类型

点击 **"Command"** 下拉菜单，选择：

```
DELETE
```

#### 3.4 选择目标角色

点击 **"Target roles"** 下拉菜单，选择：

```
authenticated
```

#### 3.5 编写 USING 表达式

在 **"USING expression"** 文本框中输入：

```sql
auth.uid() = uploader_id AND status = 'pending'
```

#### 3.6 WITH CHECK 表达式

这一步是可选的，但对于 DELETE 操作可以留空或输入相同的内容：

```sql
auth.uid() = uploader_id AND status = 'pending'
```

### 步骤 4: 查看完整配置

配置完成后，应该看起来像这样：

```
┌─────────────────────────────────────────────────┐
│ Policy name: Users can delete own exams        │
├─────────────────────────────────────────────────┤
│ Command: DELETE                                │
│ Target roles: authenticated                     │
├─────────────────────────────────────────────────┤
│ USING expression:                               │
│ ┌───────────────────────────────────────────┐  │
│ │ auth.uid() = uploader_id AND status =     │  │
│ │ 'pending'                                  │  │
│ └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ WITH CHECK expression:                          │
│ ┌───────────────────────────────────────────┐  │
│ │ auth.uid() = uploader_id AND status =     │  │
│ │ 'pending'                                  │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 步骤 5: 点击创建

点击 **"Save policy"** 或 **"Create policy"** 按钮

### 步骤 6: 验证创建成功

创建成功后，你应该能在 Policies 列表中看到新的策略：

```
✅ Anyone can view verified exams        [SELECT]
✅ Authenticated users can insert exams   [INSERT]
✅ Same course users can view pending    [SELECT]
✅ Users can delete own exams            [DELETE]  ← 新创建的
```

## 完整截图示例

### 截图 1: 位置导航
```
Supabase Dashboard
├── Database
│   └── Tables
│       └── exams
│           └── Policies ← 点击这里
```

### 截图 2: Policies 页面
```
┌────────────────────────────────────────────┐
│ exams / Policies                            │
├────────────────────────────────────────────┤
│                                            │
│  Existing policies (3)                     │
│  ├── Anyone can view verified exams   [✓]  │
│  ├── Authenticated users can insert   [✓]  │
│  └── Same course users can view       [✓]  │
│                                            │
│  Add a policy ▼                           │
│  ├── For existing rows                     │
│  ├── For new rows                          │
│  ├── For all rows                          │
│  └── Create a policy from scratch ← 选择   │
│                                            │
└────────────────────────────────────────────┘
```

### 截图 3: 创建表单
```
┌────────────────────────────────────────────┐
│ Create policy                              │
├────────────────────────────────────────────┤
│                                            │
│  Policy name *                            │
│  ┌──────────────────────────────────────┐ │
│  │ Users can delete own exams           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Command *                                 │
│  ┌──────────────────────────────────────┐ │
│  │ DELETE                            ▼  │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Target roles                              │
│  ┌──────────────────────────────────────┐ │
│  │ authenticated                       ▼ │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  USING expression *                        │
│  ┌──────────────────────────────────────┐ │
│  │ auth.uid() = uploader_id AND         │ │
│  │ status = 'pending'                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  WITH CHECK expression                     │
│  ┌──────────────────────────────────────┐ │
│  │ auth.uid() = uploader_id AND         │ │
│  │ status = 'pending'                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│         [Cancel]  [Save policy]            │
│                                            │
└────────────────────────────────────────────┘
```

## 各个字段的说明

### 1. Policy name（策略名称）
**必填项**

推荐的命名规范：
- ✅ 描述性强：描述策略的作用
- ✅ 唯一性：不同表之间不能重名
- ✅ 清晰易懂：其他开发者能理解

示例：
- ✅ `Users can delete own exams`
- ✅ `Anyone can view verified exams`
- ❌ `policy1`
- ❌ `delete_policy`

### 2. Command（操作命令）
**必填项**

可选值：
- **SELECT** - 读取/查看数据
- **INSERT** - 插入新数据
- **UPDATE** - 更新现有数据
- **DELETE** - 删除数据

我们选择 **DELETE**

### 3. Target roles（目标角色）
**可选**

可选值：
- **authenticated** - 已登录用户
- **anon** - 匿名用户（未登录）
- **service_role** - 服务角色（管理员）

我们选择 **authenticated**

### 4. USING expression（使用表达式）
**DELETE 操作的必填项**

这个表达式定义了：
- 哪些行可以被访问
- 在执行操作前进行检查

我们的表达式：
```sql
auth.uid() = uploader_id AND status = 'pending'
```

含义：
- `auth.uid()` - 当前登录用户的 ID
- `uploader_id` - 题目上传者的 ID
- `status = 'pending'` - 题目必须是待验证状态
- `AND` - 两个条件都必须满足

### 5. WITH CHECK expression（检查表达式）
**DELETE 操作可选**

对于 DELETE 操作，这个表达式和 USING 表达式类似。
我们使用相同的条件。

## 策略逻辑解释

### 策略条件

```sql
auth.uid() = uploader_id AND status = 'pending'
```

### 拆解分析

1. **`auth.uid()`**
   - 返回当前登录用户的 UUID
   - 如果用户未登录，返回 NULL

2. **`uploader_id`**
   - exams 表中的字段
   - 存储题目上传者的用户 ID

3. **`status = 'pending'`**
   - exams 表中的字段
   - 题目的当前状态
   - 只能是 'pending'（待验证）

4. **`AND`**
   - 逻辑与运算
   - 两个条件都必须为 true

### 执行流程

```
用户发起 DELETE 请求
    ↓
检查用户是否已登录 (authenticated)
    ↓
执行 USING 表达式
├─ 检查 auth.uid() = uploader_id
│  ├─ 用户ID = 上传者ID？ → YES → 继续
│  └─ 用户ID = 上传者ID？ → NO → 拒绝访问
│
└─ 检查 status = 'pending'
   ├─ 状态 = 'pending'？ → YES → 允许删除
   └─ 状态 ≠ 'pending'？ → NO → 拒绝访问
    ↓
执行删除操作 或 拒绝访问
```

### 安全保证

✅ **防止删除别人的题目**
- 只有 `uploader_id` 等于当前用户 ID 才能删除

✅ **防止删除已验证的题目**
- 只有 `status = 'pending'` 的题目才能删除

✅ **防止未登录用户操作**
- 必须是 `authenticated` 角色

## 常见问题与解决方案

### 问题 1: "Save" 按钮是灰色的

**原因**：必填字段未填写

**解决**：
1. 确认 Policy name 已填写
2. 确认 Command 已选择
3. 确认 USING expression 已填写

### 问题 2: 表达式语法错误

**原因**：SQL 语法错误

**常见错误**：
```sql
-- ❌ 错误：引号使用不当
auth.uid() = uploader_id AND status = "pending"

-- ✅ 正确：使用单引号
auth.uid() = uploader_id AND status = 'pending'

-- ❌ 错误：拼写错误
auth.ud() = uploader_id AND status = 'pending'

-- ✅ 正确：正确的函数名
auth.uid() = uploader_id AND status = 'pending'
```

### 问题 3: 字段名不存在

**原因**：字段名拼写错误或大小写问题

**解决**：
1. 在 Table Editor 中查看 exams 表结构
2. 确认字段名完全匹配（注意大小写）
3. exams 表的字段：
   - `uploader_id` (UUID)
   - `status` (TEXT)

### 问题 4: 策略创建后不生效

**原因**：可能是缓存问题

**解决**：
1. 等待几秒钟让策略生效
2. 清除浏览器缓存
3. 尝试在无痕/隐私模式中测试
4. 检查 RLS 是否启用（应该是启用的）

## 验证策略是否工作

### 方法 1: 使用个人中心删除

1. 进入个人中心 → 我的上传
2. 找到待验证的题目
3. 点击"删除"按钮
4. 确认删除成功

### 方法 2: 检查浏览器控制台

打开浏览器开发者工具（F12），在 Console 中应该看到：

```
正在删除数据库记录...
数据库记录删除成功！
正在删除Storage中的图片...
```

### 方法 3: 检查 Supabase Table Editor

1. 进入 Table Editor
2. 选择 exams 表
3. 查看数据
4. 确认被删除的记录已消失

### 方法 4: 使用 SQL 查询

在 SQL Editor 中运行：

```sql
-- 查看所有策略
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'exams';

-- 查看所有 exams 记录
SELECT id, uploader_id, status, created_at
FROM exams
ORDER BY created_at DESC;
```

## 快速检查清单

创建策略前，确保：

- [ ] 进入正确的项目
- [ ] 选择了正确的表（exams）
- [ ] Policy name 填写正确
- [ ] Command 选择 DELETE
- [ ] Target roles 选择 authenticated
- [ ] USING expression 语法正确
- [ ] 点击了 Save/Create 按钮

创建策略后，确保：

- [ ] 策略出现在列表中
- [ ] Command 列显示 DELETE
- [ ] 删除功能正常工作
- [ ] 其他用户看不到被删除的题目

## 其他有用的 Policy 示例

### 允许更新自己的题目
```sql
-- Policy name: Users can update own exams
-- Command: UPDATE
-- Target roles: authenticated
-- USING: auth.uid() = uploader_id
-- WITH CHECK: auth.uid() = uploader_id
```

### 允许查看自己的所有题目
```sql
-- Policy name: Users can view own exams
-- Command: SELECT
-- Target roles: authenticated
-- USING: auth.uid() = uploader_id
-- WITH CHECK: (留空)
```

## 总结

按照以下步骤创建 DELETE 策略：

1. ✅ 进入 Database → Tables → exams → Policies
2. ✅ 点击 "Create a policy from scratch"
3. ✅ 填写 Policy name: `Users can delete own exams`
4. ✅ 选择 Command: `DELETE`
5. ✅ 选择 Target roles: `authenticated`
6. ✅ 填写 USING expression: `auth.uid() = uploader_id AND status = 'pending'`
7. ✅ 填写 WITH CHECK expression: `auth.uid() = uploader_id AND status = 'pending'`
8. ✅ 点击 Save policy
9. ✅ 测试删除功能

完成！🎉
