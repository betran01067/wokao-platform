# 我考 (Wokao) - 项目设置指南

## 环境准备

### 1. 检查 Node.js 环境

确保您已安装 Node.js 18+ 和 npm：

```bash
node --version
npm --version
```

如果没有安装，请从 [Node.js 官网](https://nodejs.org/) 下载安装。

### 2. 安装项目依赖

在项目根目录下运行：

```bash
npm install
```

这将安装所有必要的依赖包。

## Supabase 配置

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 等待项目创建完成（可能需要几分钟）

### 步骤 2: 获取 API 密钥

1. 进入项目设置 (Settings)
2. 点击 "API"
3. 复制以下信息：
   - **Project URL**: <https://bjhunucrxyurrrvqubvn.supabase.co>
   - **anon/public** key: `eyJhbG...` 开头的一串字符

### 步骤 3: 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 步骤 4: 执行数据库 Schema

1. 在 Supabase 仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 打开 `supabase/schema.sql` 文件，复制全部内容
4. 粘贴到 SQL Editor 中
5. 点击 "Run" 执行

这将创建所有必要的表、触发器和函数。

### 步骤 5: 创建存储桶

1. 在 Supabase 仪表板中，点击左侧菜单的 "Storage"
2. 点击 "New bucket"
3. 配置存储桶：
   - **Name**: `exam-images`
   - **Public**: ✓ (勾选)
4. 点击 "Create bucket"

### 步骤 6: 插入示例数据（可选）

为了测试，您可以手动插入一些示例课程数据：

```sql
-- 插入示例课程
INSERT INTO courses (name, code) VALUES
  ('高等数学A', 'MATH101'),
  ('大学英语', 'ENG101'),
  ('计算机导论', 'CS101'),
  ('线性代数', 'MATH201'),
  ('概率论与数理统计', 'MATH301');

-- 插入示例教师
INSERT INTO teachers (name) VALUES
  ('张教授'),
  ('李老师'),
  ('王老师');

-- 将教师关联到课程
INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id FROM courses c, teachers t WHERE c.name = '高等数学A' AND t.name = '张教授';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id FROM courses c, teachers t WHERE c.name = '大学英语' AND t.name = '李老师';
```

## 运行项目

### 开发模式

```bash
npm run dev
```

应用将在 <http://localhost:3000> 运行。

### 构建生产版本

```bash
npm run build
npm start
```

## 功能测试清单

### 1. 用户注册/登录 ✓

- [ ] 访问首页
- [ ] 使用邮箱注册新账户
- [ ] 注册后跳转到选课页面
- [ ] 登录已有账户

### 2. 课程选择 ✓

- [ ] 搜索课程
- [ ] 选择本学期课程
- [ ] 保存选课结果

### 3. 首页仪表盘 ✓

- [ ] 查看积分余额
- [ ] 查看我的上传
- [ ] 查看最新真题
- [ ] 快速导航入口

### 4. 上传真题 ✓

- [ ] 选择课程
- [ ] 选择任课教师
- [ ] 选择考试年份/学期/类型
- [ ] 上传图片（最多9张）
- [ ] 提交审核

### 5. 验证任务 ✓

- [ ] 查看待验证题目
- [ ] 投票（真实/虚假）
- [ ] 填写投票理由
- [ ] 查看验证历史

### 6. 搜索真题 ✓

- [ ] 搜索课程名
- [ ] 使用筛选条件
- [ ] 查看真题详情（消耗5积分）
- [ ] 对真题进行评价

### 7. 个人中心 ✓

- [ ] 查看上传记录
- [ ] 查看验证历史
- [ ] 管理课程（添加/删除）
- [ ] 修改昵称

## 常见问题

### Q: 注册后没有自动跳转到选课页面？

A: 检查浏览器控制台是否有错误，确保 Supabase Auth 已正确配置。

### Q: 上传图片失败？

A: 确保已创建 `exam-images` 存储桶，并且设置为公共访问。

### Q: 无法查看待验证题目？

A: 确保您已选择至少一门课程，只有同课程的用户才能看到待验证题目。

### Q: 积分不准确？

A: 检查数据库中的 `profiles` 表，确认触发器已正确创建。

## 技术支持

如果遇到问题，请检查：

1. `.env.local` 文件配置是否正确
2. Supabase 数据库 Schema 是否完整执行
3. 存储桶权限是否正确设置
4. 浏览器控制台错误信息

## 下一步

- 添加更多课程数据
- 自定义界面样式
- 集成其他功能
- 部署到生产环境

祝您使用愉快！ 🚀
