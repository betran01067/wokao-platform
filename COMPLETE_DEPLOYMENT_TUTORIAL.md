# 我考 (Wokao) - 从零开始完整部署教程

## 📋 目录

1. [第一步：创建 GitHub 仓库](#第一步创建-github-仓库)
2. [第二步：安装 Git](#第二步安装-git)
3. [第三步：上传代码到 GitHub](#第三步上传代码到-github)
4. [第四步：注册 Vercel](#第四步注册-vercel)
5. [第五步：连接 GitHub 并部署](#第五步连接-github-并部署)
6. [第六步：配置环境变量](#第六步配置环境变量)
7. [第七步：绑定自定义域名](#第七步绑定自定义域名)

***

## 第一步：创建 GitHub 仓库

### 1.1 注册 GitHub 账号

1. 打开浏览器，访问 <https://github.com>
2. 点击 **"Sign up"**（注册）
3. 填写信息：
   - Email：你的邮箱
   - Password：密码（至少8位）
   - Username：你的用户名（记住这个名字）
4. 点击 **"Create account"**
5. 验证邮箱（去邮箱点击验证链接）

### 1.2 创建新仓库

1. 登录 GitHub 后，点击右上角 **"+"** 按钮
2. 选择 **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `wokao-platform`
   - **Description**: `我考 - 大学课程真题共享平台`
   - **Public** ← 选择这个（让 Vercel 能访问）
   - ✅ 勾选 **"Add a README file"**
4. 点击 **"Create repository"**

### 1.3 复制仓库地址

创建成功后，你会看到仓库页面，复制仓库地址：

```
https://github.com/你的用户名/wokao-platform.git
```

**注意**：把"你的用户名"替换成你注册时的用户名。

***

## 第二步：安装 Git

### 2.1 下载 Git

1. 打开浏览器访问：<https://git-scm.com/download/win>
2. 点击 **"Click here to download"**
3. 下载会自动开始

### 2.2 安装 Git

1. 双击下载的安装包（文件名类似 `Git-2.x.x-64-bit.exe`）
2. 点击 **"Next"**
3. 安装路径保持默认，点击 **"Next"**
4. **组件选择**，勾选：
   - ✅ **"Git Bash Here"** ← 重要！
   - ✅ **"Git GUI Here"**
   - ✅ *"Associate .git* configuration files with the default text editor"\*
5. 点击 **"Next"**
6. **调整 PATH**，选择 **"Git from the command line and also from 3rd-party software"**
7. 点击 **"Next"**
8. 其他全部保持默认
9. 点击 **"Install"**
10. 点击 **"Finish"**

### 2.3 验证安装

1. 按 **Windows键 + R**
2. 输入 **cmd**，回车
3. 在黑色窗口输入：

```bash
git --version
```

1. 如果显示 `git version 2.x.x.windows.x`，说明安装成功！

### 2.4 配置 Git

在命令提示符中输入（把信息换成你自己的）：

```bash
# 配置用户名（改成你的）
git config --global user.name "你的GitHub用户名"

# 配置邮箱（改成你的GitHub邮箱）
git config --global user.email "your.email@example.com"
```

***

## 第三步：上传代码到 GitHub

### 3.1 打开命令提示符

1. 按 **Windows键 + R**
2. 输入 **cmd**，回车
3. 进入项目目录：

```bash
cd c:\Users\Betran\Desktop\wokao
```

### 3.2 初始化 Git 仓库

在项目目录中依次执行：

```bash
# 1. 初始化仓库
git init

# 2. 添加所有文件到暂存区
git add .

# 3. 提交到本地仓库



# 4. 添加远程仓库地址（把"你的用户名"换成你的）
git remote add origin https://github.com/betran01067/wokao-platform.git

# 5. 推送到 GitHub（第一次需要输入用户名和密码）
git branch -M main
git push -u origin main
```

### 3.3 输入 GitHub 账号密码

1. **Username**：输入你的 GitHub 用户名
2. **Password**：输入你的 GitHub 密码
3. （如果提示 Personal Access Token，用 GitHub 设置里生成一个）

### 3.4 验证成功

打开浏览器，访问你的 GitHub 仓库：

```
https://github.com/betran01067/wokao-platform
```

应该能看到你的所有代码文件！

***

## 第四步：注册 Vercel

### 4.1 访问 Vercel

1. 打开浏览器访问：<https://vercel.com>
2. 点击 **"Sign Up"**

### 4.2 创建账号

有两种方式（推荐第一种）：

**方式 A：使用 GitHub 登录（最简单）**

1. 点击 **"Continue with GitHub"**
2. 授权页面点击 **"Authorize"**

**方式 B：使用邮箱注册**

1. 输入邮箱地址
2. 点击 **"Continue"**
3. 去邮箱查收验证邮件
4. 点击邮件中的验证链接

### 4.3 设置名称

1. 输入你的名字（随便填）
2. 点击 **"Continue"**

***

## 第五步：连接 GitHub 并部署

### 5.1 添加新项目

1. 登录 Vercel 后，点击 **"Add New\..."** 按钮
2. 选择 **"Project"**

### 5.2 导入 GitHub 仓库

1. 在 "Import Git Repository" 页面
2. 找到你的仓库 `wokao-platform`
3. 点击旁边的 **"Import"** 按钮

### 5.3 配置项目（重要！）

在项目配置页面：

#### 5.3.1 设置构建命令

**Framework Preset** 选择：

```
Next.js
```

（Vercel 通常会自动识别）

**Build Command** 保持默认：

```
npm run build
```

**Output Directory** 保持默认：

```
.auto
```

（或者 `.next`）

**Install Command** 保持默认：

```
npm install
```

#### 5.3.2 环境变量配置（重要！）

**不要急着点击 Deploy！**

1. 找到 **"Environment Variables"** 部分
2. 点击 **"Add"** 按钮

添加**第一个变量**：

- **NAME**: `NEXT_PUBLIC_SUPABASE_URL`
- **VALUE**: `https://你的项目.supabase.co`
  （去 Supabase 仪表板 → Settings → API 复制）
- **ENVIRONMENTS**: 全部勾选 ✅

添加**第二个变量**：

- **NAME**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **VALUE**: `你的anon_key`
  （去 Supabase 仪表板 → Settings → API 复制）
- **ENVIRONMENTS**: 全部勾选 ✅

### 5.4 开始部署

配置完成后，点击页面底部的 **"Deploy"** 按钮

### 5.5 等待部署

你会看到部署进度：

```
✓ Cloning repository...
✓ Installing dependencies...
✓ Building application...
✓ Deploying...
```

部署通常需要 **2-5 分钟**，耐心等待！

### 5.6 部署成功

看到绿色 ✅ **"Congratulations!"** 页面！

Vercel 会给你一个临时域名：

```
https://wokao-platform.vercel.app
```

点击访问测试一下！

***

## 第六步：配置环境变量（补充）

如果在部署时漏了配置，或者需要修改：

### 6.1 进入项目设置

1. 在 Vercel 项目页面
2. 点击 **"Settings"**（项目设置）
3. 左侧菜单点击 **"Environment Variables"**

### 6.2 添加或修改变量

1. 点击 **"Add New\..."**
2. 填写：
   - **NAME**: `NEXT_PUBLIC_SUPABASE_URL`
   - **VALUE**: 你的 Supabase URL
   - **ENVIRONMENTS**: ✅ Production, ✅ Preview, ✅ Development
3. 点击 **"Save"**

同样添加：

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6.3 重新部署

添加完环境变量后：

1. 点击 **"Deployments"** 标签
2. 点击最新部署旁边的 **"..."** 按钮
3. 选择 **"Redeploy"**
4. 点击 **"Redeploy"** 确认

***

## 第七步：绑定自定义域名

如果你有域名（如 `wokaoxuebudongle`），想用它访问：

### 7.1 进入域名设置

1. 在 Vercel 项目页面
2. 点击 **"Settings"**
3. 左侧菜单点击 **"Domains"**

### 7.2 添加域名

1. 输入你的域名：`wokaoxuebudongle`
   （如果有完整域名如 `www.wokaoxuebudongle.com`，只填 `wokaoxuebudongle`）
2. 点击 **"Add"**

### 7.3 配置 DNS（重要！）

Vercel 会显示需要配置的 DNS 记录。

#### 7.3.1 打开域名管理

根据你的域名在哪买的：

**阿里云：**

1. 访问 <https://dns.console.aliyun.com>
2. 登录你的账号
3. 点击你的域名

**腾讯云：**

1. 访问 <https://console.dnspod.cn>
2. 登录你的账号
3. 点击你的域名

**其他域名商：**

- 找到 DNS 解析设置页面

#### 7.3.2 添加 DNS 记录

在域名管理页面，添加记录：

**记录 1（A 记录）**

```
类型: A
主机记录: @
记录值: 76.76.21.21
TTL: 600
```

**记录 2（CNAME 记录，可选）**

```
类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

### 7.4 验证配置

1. 回到 Vercel Domains 页面
2. 点击 **"Check DNS Configuration"**
3. 等待验证通过（可能需要几分钟到48小时）

### 7.5 完成！

DNS 配置生效后，你就可以通过：

```
http://wokaoxuebudongle
```

访问你的网站了！

***

## 🎉 恭喜！你已完成部署！

### 访问地址

现在你的网站可以通过以下地址访问：

**Vercel 临时域名**：

```
https://wokao-platform.vercel.app
```

**或你的自定义域名**：

```
http://wokaoxuebudongle
```

***

## 📞 遇到问题？

### 问题 1：Git push 需要用户名密码

**解决**：

1. 在 GitHub 头像 → Settings → Developer settings
2. Personal access tokens → Generate new token
3. 生成一个 token（勾选 repo）
4. 用 token 代替密码输入

### 问题 2：Vercel 部署失败

**解决**：

1. 查看部署日志的具体错误信息
2. 常见问题：
   - 环境变量未配置 → 重新配置
   - npm install 失败 → 检查 package.json
   - build 失败 → 检查代码错误

### 问题 3：环境变量配置错误

**解决**：

1. 删除错误的变量
2. 重新添加正确的值
3. 重新部署

### 问题 4：自定义域名无法访问

**解决**：

1. 等待 DNS 生效（最多48小时）
2. 用 <https://tool.chinaz.com> 检查 DNS
3. 确认 DNS 记录正确

***

## ✅ 检查清单

部署成功后，检查：

- [ ] GitHub 仓库代码已上传
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] 部署成功，无错误
- [ ] 网站可以正常访问
- [ ] 用户注册/登录正常
- [ ] 主要功能测试通过

***

## 🎯 后续维护

### 更新代码

更新代码后，Vercel 会自动重新部署！

```bash
# 在本地修改代码后
git add .
git commit -m "修复xxx问题"
git push
```

Vercel 会自动检测到更新并重新部署。

### 查看日志

1. 在 Vercel 项目页面
2. 点击 **"Deployments"**
3. 选择一个部署
4. 查看详细日志

### 回滚版本

如果新版本有问题：

1. 点击 **"Deployments"**
2. 选择之前正常的版本
3. 点击 **"..."** → **"Promote to Production"**

***

**恭喜！你的"我考"平台已经成功上线！** 🚀

祝使用愉快！
