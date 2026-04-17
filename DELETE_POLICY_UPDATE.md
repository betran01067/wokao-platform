# 删除功能 - 数据库策略更新

## 问题说明

之前的数据库 schema 缺少 `exams` 表的 DELETE 策略，导致用户无法删除自己的题目。

## 解决方案

### 步骤 1: 在 Supabase SQL Editor 中添加 DELETE 策略

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入您的项目
3. 左侧菜单点击 **"SQL Editor"**
4. 点击 **"New Query"**
5. 复制粘贴以下 SQL 语句：

```sql
-- Exams: Users can delete their own exams (only pending status)
CREATE POLICY "Users can delete own exams" ON exams
  FOR DELETE USING (auth.uid() = uploader_id AND status = 'pending');
```

6. 点击 **"Run"** 执行

### 步骤 2: 验证策略是否添加成功

1. 在左侧菜单点击 **"Authentication"** → **"Policies"**
2. 或者在 Table Editor 中点击 `exams` 表
3. 查看 Policies 标签页
4. 确认看到以下策略：
   - ✅ "Anyone can view verified exams" (SELECT)
   - ✅ "Authenticated users can insert exams" (INSERT)
   - ✅ "Same course users can view pending exams" (SELECT)
   - ✅ "Users can delete own exams" (DELETE) ← 新添加的

## 策略说明

新添加的 DELETE 策略：

```sql
CREATE POLICY "Users can delete own exams" ON exams
  FOR DELETE USING (auth.uid() = uploader_id AND status = 'pending');
```

**作用**：
- 允许用户删除自己的题目
- 只能删除 `pending`（待验证）状态的题目
- 已验证或虚假的题目无法删除
- 必须验证用户身份（通过 `auth.uid()`）

**安全限制**：
- ❌ 不能删除别人的题目
- ❌ 不能删除已验证的题目
- ❌ 不能删除虚假的题目
- ✅ 只能删除自己上传的、待验证的题目

## 删除流程

当用户删除题目时：

```
1. 用户点击"删除"按钮
   ↓
2. 弹出确认对话框
   ↓
3. 用户确认删除
   ↓
4. 执行数据库删除
   ├─ 检查用户身份 (auth.uid() = uploader_id)
   ├─ 检查题目状态 (status = 'pending')
   └─ 删除记录
   ↓
5. 删除 Storage 中的图片文件
   ↓
6. 更新页面显示
   ↓
7. 显示成功提示
```

## 代码逻辑

删除时的执行顺序：

```typescript
async function handleDeleteExam(examId, images) {
  // 1. 首先删除数据库记录（最关键）
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)
    .eq('uploader_id', user.id)  // 确保只能删除自己的
  
  if (error) throw error
  
  // 2. 然后删除图片文件（清理操作）
  for (const imageUrl of images) {
    await supabase.storage
      .from('exam-images')
      .remove([fileName])
  }
  
  // 3. 更新界面
  setMyExams(...)
}
```

## 为什么先删数据库，后删图片？

这样做有以下好处：

1. **原子性**：数据库操作失败时，图片仍然存在，可以后续清理
2. **可靠性**：确保题目从用户界面消失，即使图片删除失败
3. **性能**：数据库操作比文件删除快
4. **错误处理**：图片删除失败不会影响主要功能

## 测试删除功能

### 测试步骤：

1. **上传一道题目**
   - 进入"上传真题"页面
   - 填写表单并上传
   - 确认显示"上传成功"

2. **查看个人中心**
   - 进入"个人中心"
   - 切换到"我的上传"标签
   - 看到刚上传的题目（状态：待验证）

3. **删除题目**
   - 点击题目旁边的"删除"按钮
   - 确认弹出对话框
   - 点击"确定"
   - 确认显示"题目已成功删除"

4. **验证删除**
   - 题目从"我的上传"列表中消失
   - 用其他账号登录
   - 进入验证页面
   - 确认看不到被删除的题目

### 预期结果：

- ✅ 删除成功时显示提示
- ✅ 题目从个人中心消失
- ✅ 其他用户看不到该题目
- ✅ 数据库记录被删除
- ✅ Storage 中的图片被删除

## 故障排除

### 问题 1: 点击删除没反应

**可能原因**：
- RLS 策略未添加
- 网络问题

**解决**：
1. 检查浏览器控制台是否有错误
2. 确认 DELETE 策略已添加
3. 刷新页面重试

### 问题 2: 显示"删除失败"

**可能原因**：
- RLS 策略限制
- 题目不是待验证状态
- 数据库权限问题

**解决**：
1. 打开浏览器控制台（F12）
2. 查看具体错误信息
3. 检查题目状态是否为 "pending"
4. 确认 DELETE 策略已添加

### 问题 3: 其他用户仍能看到题目

**可能原因**：
- 数据库删除失败
- 页面缓存
- RLS 策略问题

**解决**：
1. 在 Supabase Table Editor 中检查 exams 表
2. 确认记录已被删除
3. 让其他用户刷新页面
4. 检查是否有错误日志

## 查看删除日志

打开浏览器控制台（F12），删除时会看到以下日志：

```
正在删除数据库记录...
数据库记录删除成功！
正在删除Storage中的图片...
图片 user-id/1234567890_0.jpg 删除成功
题目已成功从数据库和存储中删除
```

如果有错误，会显示：

```
数据库删除失败: {错误信息}
删除题目时出错: {错误信息}
```

## 完整策略列表

在 Supabase SQL Editor 中运行以下命令查看所有策略：

```sql
-- 查看 exams 表的所有策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'exams';
```

应该看到：

| policyname | cmd | 说明 |
|-----------|-----|------|
| Anyone can view verified exams | SELECT | 任何人可查看已验证题目 |
| Authenticated users can insert exams | INSERT | 认证用户可上传 |
| Same course users can view pending exams | SELECT | 同课程用户可查看待验证 |
| Users can delete own exams | DELETE | 用户可删除自己的待验证题目 |

## 总结

1. ✅ 在数据库中添加了 DELETE 策略
2. ✅ 优化了删除逻辑（先删数据库，后删图片）
3. ✅ 添加了详细的日志
4. ✅ 增强了错误处理
5. ✅ 确保只能删除待验证的题目

更新完数据库策略后，删除功能就能正常工作了！🚀
