# Supabase Storage 配置指南

## 问题说明

如果图片无法上传或无法在验证页面显示，可能是 Storage 配置不正确。请按照以下步骤检查和配置。

## 步骤 1: 检查 Storage Bucket 是否存在

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入您的项目
3. 左侧菜单点击 **"Storage"**

## 步骤 2: 创建或检查 exam-images Bucket

### 如果 Bucket 不存在：

1. 点击 **"New bucket"** 按钮
2. 填写配置：
   - **Bucket name**: `exam-images`（必须完全一致，包括连字符）
   - **Public bucket**: ✅ 勾选（必须设为公共）
   - **Allowed mime types**: 可以留空或添加：
     ```
     image/jpeg
     image/png
     image/gif
     image/webp
     ```

3. 点击 **"Create bucket"**

### 如果 Bucket 已存在：

1. 点击 `exam-images` bucket
2. 检查右侧面板：
   - **Public**: 必须显示 ✅ 或已勾选
   - 如果不是公共的，点击编辑按钮设置为公共

## 步骤 3: 检查 Storage Policies（存储策略）

Storage  Policies 决定了谁可以上传和下载文件。点击左侧的 **"Policies"** 标签。

### 检查是否有以下 Policy，如果没有请添加：

#### Policy 1: 允许所有人读取文件

```sql
-- 允许任何人读取文件
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'exam-images');

-- 或更严格的：
CREATE POLICY "Allow public read access with bucket check"
ON storage.objects
FOR SELECT
USING (bucket_id = 'exam-images');
```

#### Policy 2: 允许认证用户上传文件

```sql
-- 允许认证用户上传文件
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'exam-images' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: 允许文件所有者删除自己的文件

```sql
-- 允许删除自己的文件
CREATE POLICY "Allow owner delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'exam-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 添加 Policy 的方法：

1. 在 Policies 页面，点击 **"Add policy"**
2. 选择合适的模板或点击 **"Create custom policy"**
3. 粘贴上述 SQL 语句
4. 给 Policy 起个名字
5. 点击 **"Save policy"**

## 步骤 4: 检查上传路径

确保上传时使用的 bucket 名称正确：

```typescript
// ✅ 正确
supabase.storage.from('exam-images').upload(...)

// ❌ 错误 - 注意不要有多余的斜杠或空格
supabase.storage.from('exam images').upload(...)
supabase.storage.from('exam-images/').upload(...)
```

## 步骤 5: 验证配置是否成功

### 方法 1: 使用 Supabase Dashboard 上传测试

1. 进入 Storage → exam-images
2. 点击 **"Upload"** 按钮
3. 上传一张测试图片
4. 上传成功后，检查：
   - 文件是否显示在列表中
   - 是否有 Public URL
   - 点击 Public URL 能否在浏览器中查看图片

### 方法 2: 检查浏览器控制台

打开浏览器的开发者工具（F12），切换到 **Console** 标签，然后尝试上传图片。

查看是否有类似这样的日志输出：
```
上传图片 1/1: test.jpg
图片 1 上传成功, Storage路径: user-uuid/1234567890_0.jpg
图片 1 公开URL: https://xxx.supabase.co/storage/v1/object/public/exam-images/user-uuid/1234567890_0.jpg
准备插入数据库，所有图片URL: ["https://xxx.supabase.co/storage/v1/object/public/exam-images/user-uuid/1234567890_0.jpg"]
数据库插入成功！
```

如果看到 `Error uploading image` 或 `图片上传失败`，请检查错误信息。

### 方法 3: 检查数据库中的 URL

1. 进入 Supabase Dashboard
2. 点击左侧 **"Table Editor"**
3. 选择 `exams` 表
4. 查看最近插入的记录
5. 检查 `images` 字段：
   - 是否包含完整的 URL
   - URL 格式是否正确：`https://xxx.supabase.co/storage/v1/object/public/exam-images/...`

## 常见问题与解决方案

### 问题 1: "Bucket not found"

**原因**: Bucket 名称不匹配或不存在

**解决**:
1. 检查代码中的 bucket 名称是否为 `exam-images`
2. 检查 Supabase Dashboard 中是否存在该 bucket
3. 确认名称完全一致（包括大小写和连字符）

### 问题 2: "Permission denied" 或 "Unauthorized"

**原因**: Storage Policy 配置不正确

**解决**:
1. 检查是否有读取和写入的 Policy
2. 确保 Policy 中的 bucket_id 为 `exam-images`
3. 确保设置了正确的权限

### 问题 3: 图片 URL 为空或只有空字符串

**原因**: 上传失败但代码没有正确处理错误

**解决**:
1. 查看控制台日志
2. 修复代码中的错误处理逻辑
3. 确认上传成功后再继续

### 问题 4: 图片无法在浏览器中加载

**原因**: 
1. Bucket 不是公共的
2. 没有读取 Policy
3. URL 格式不正确

**解决**:
1. 确保 bucket 设置为 Public
2. 添加允许读取的 Policy
3. 检查 URL 是否包含 `/public/` 路径

## 完整配置检查清单

- [ ] Storage bucket `exam-images` 已创建
- [ ] Bucket 设置为 Public
- [ ] 允许读取的 Policy 已添加
- [ ] 允许上传的 Policy 已添加
- [ ] 可以通过 Dashboard 上传文件
- [ ] 可以通过 Public URL 访问文件
- [ ] 代码中 bucket 名称正确
- [ ] 上传后数据库中 images 字段包含完整 URL

## 推荐的最小 Policy 配置

如果只想让应用正常运行，可以使用以下最小配置：

```sql
-- 1. 允许任何人读取
CREATE POLICY "Public Read" ON storage.objects
FOR SELECT USING (bucket_id = 'exam-images');

-- 2. 允许认证用户上传
CREATE POLICY "Auth Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exam-images' 
  AND auth.role() = 'authenticated'
);

-- 3. 允许删除自己的文件
CREATE POLICY "Delete Own" ON storage.objects
FOR DELETE USING (
  bucket_id = 'exam-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 获取帮助

如果仍然无法解决问题：

1. 查看 Supabase 官方文档：https://supabase.com/docs/guides/storage
2. 检查 Supabase Dashboard 的 Storage 部分是否有错误提示
3. 查看浏览器控制台和网络标签的错误信息
4. 检查 Supabase 项目的 Rate Limits 和 Usage

祝配置顺利！🚀
