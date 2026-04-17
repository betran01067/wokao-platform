# 我考 (Wokao) - 公网部署指南

## 部署方案选择

### 推荐方案对比

| 平台 | 免费额度 | 难易度 | 推荐指数 | 说明 |
|------|---------|--------|---------|------|
| **Vercel** | 100GB/月 | ⭐ 简单 | ⭐⭐⭐⭐⭐ | 最推荐，Next.js 官方平台 |
| **Railway** | $5/月 | ⭐ 简单 | ⭐⭐⭐⭐ | 配置简单，付费但稳定 |
| **阿里云/腾讯云** | 付费 | ⭐⭐ 复杂 | ⭐⭐⭐ | 需要自己配置服务器 |

## 方案一：部署到 Vercel（推荐）⭐

### 步骤 1: 准备工作

1. 注册 Vercel 账号：https://vercel.com
2. 使用 GitHub 账号登录（推荐）
3. 将代码推送到 GitHub 仓库

### 步骤 2: 创建 GitHub 仓库

如果还没有 GitHub 仓库：

```bash
# 1. 在 GitHub 上创建新仓库
# 仓库名：wokao-platform
# 设为 Public（公开）

# 2. 在本地初始化 Git 并推送
cd c:\Users\Betran\Desktop\wokao
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/wokao-platform.git
git push -u origin main
```

### 步骤 3: 部署到 Vercel

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 选择刚才创建的 GitHub 仓库
4. 配置环境变量（关键步骤）：

在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_SUPABASE_URL = https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJh...（你的 anon key）
```

5. 点击 "Deploy"

### 步骤 4: 域名配置

**自动生成的域名**：
- Vercel 会给你一个免费的 `.vercel.app` 域名
- 例如：`wokao-platform.vercel.app`

**绑定自定义域名**：
1. 在 Vercel 项目设置中点击 "Domains"
2. 输入你的域名：`wokaoxuebudongle`
3. 添加 DNS 记录

**DNS 配置**：
在你的域名服务商（阿里云/腾讯云/etc.）添加：

```
类型: A
名称: @
值: 76.76.21.21 (Vercel 的 IP)

或者：

类型: CNAME
名称: www
值: cname.vercel-dns.com
```

## 方案二：部署到阿里云/腾讯云（自建服务器）

### 服务器要求

- 最低配置：1核2G内存
- 操作系统：Ubuntu 20.04 或 CentOS 7+
- 需要安装：Node.js 18+, Nginx, PM2

### 步骤 1: 服务器环境配置

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 Nginx
sudo apt install nginx -y

# 4. 安装 PM2（进程管理器）
sudo npm install -g pm2

# 5. 验证安装
node -v
npm -v
nginx -v
pm2 -v
```

### 步骤 2: 上传代码到服务器

**方法 A: 使用 Git**
```bash
# 在服务器上
git clone https://github.com/你的用户名/wokao-platform.git
cd wokao-platform
npm install
```

**方法 B: 使用 SCP**
```bash
# 在本地执行
scp -r c:\Users\Betran\Desktop\wokao root@你的服务器IP:/var/www/
```

### 步骤 3: 配置环境变量

创建生产环境配置文件：

```bash
cd /var/www/wokao-platform
sudo nano .env.production
```

添加：
```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
NODE_ENV=production
```

### 步骤 4: 构建应用

```bash
npm run build
npm start
```

### 步骤 5: 使用 PM2 管理进程

```bash
# 启动应用
pm2 start npm --name "wokao" -- start

# 设置开机自启
pm2 save
pm2 startup

# 查看状态
pm2 list
pm2 logs wokao
```

### 步骤 6: 配置 Nginx 反向代理

```bash
sudo nano /etc/nginx/sites-available/wokao
```

添加配置：
```nginx
server {
    listen 80;
    server_name wokaoxuebudongle;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/wokao /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

### 步骤 7: 配置域名

在域名服务商添加 DNS 记录：

**方案 A: A 记录**
```
类型: A
主机记录: @
记录值: 你的服务器公网IP
TTL: 600
```

**方案 B: CNAME（如果有 www 子域名）**
```
类型: CNAME
主机记录: www
记录值: wokaoxuebudongle.com
TTL: 600
```

### 步骤 8: 配置 HTTPS（重要！）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d wokaoxuebudongle -d www.wokaoxuebudongle

# 自动续期
sudo certbot renew --dry-run
```

## 方案三：部署到 Railway（简单快捷）

Railway 是一个现代化的部署平台，操作简单。

### 步骤 1: 注册 Railway

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 点击 "New Project"

### 步骤 2: 连接 GitHub

1. 选择 "Deploy from GitHub repo"
2. 选择你的 wokao-platform 仓库
3. Railway 会自动检测 Next.js 项目

### 步骤 3: 配置环境变量

在 Railway 项目中添加：

```
NEXT_PUBLIC_SUPABASE_URL = https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的anon_key
NODE_ENV = production
```

### 步骤 4: 部署

点击 "Deploy" 等待完成，Railway 会给你一个临时域名。

### 步骤 5: 绑定域名

1. 在项目设置中点击 "Networking"
2. 点击 "Add Domain"
3. 输入 `wokaoxuebudongle`
4. 按提示配置 DNS

## 域名配置（通用步骤）

### 获取域名

如果你还没有域名，需要先购买：

1. **阿里云万网**：https://wanwang.aliyun.com
2. **腾讯云 DNSPod**：https://dnspod.cloud.tencent.com
3. **GoDaddy**：https://www.godaddy.com

价格：.com/.cn 域名约 50-100元/年

### DNS 配置示例

以阿里云为例：

1. 登录阿里云控制台
2. 进入 "云解析 DNS"
3. 点击你的域名
4. 添加解析记录：

**主域名配置（wokaoxuebudongle.com）**：
```
添加解析
├─ 记录类型: A
├─ 主机记录: @ (代表 wokaoxuebudongle.com)
├─ 记录值: 服务器IP 或 CDN IP
└─ TTL: 600
```

**www 子域名配置**：
```
添加解析
├─ 记录类型: CNAME
├─ 主机记录: www
├─ 记录值: wokaoxuebudongle.com
└─ TTL: 600
```

### 等待生效

DNS 更改通常需要 10 分钟到 48 小时生效，取决于 TTL 设置和 ISP 缓存。

验证方法：
```bash
# Windows
nslookup wokaoxuebudongle

# 或
ping wokaoxuebudongle
```

## 完整部署检查清单

### 部署前检查
- [ ] 代码已推送到 GitHub
- [ ] Supabase 项目已配置
- [ ] 环境变量已准备
- [ ] 域名已购买并可解析

### 部署中检查
- [ ] npm install 成功
- [ ] npm run build 成功
- [ ] npm start 运行正常
- [ ] 进程管理配置完成

### 部署后检查
- [ ] 临时域名可访问
- [ ] 登录注册功能正常
- [ ] 图片上传功能正常
- [ ] 自定义域名已绑定
- [ ] HTTPS 证书已配置
- [ ] 所有页面功能测试

### 功能测试
- [ ] 用户注册/登录
- [ ] 课程选择
- [ ] 上传真题
- [ ] 查看验证任务
- [ ] 投票功能
- [ ] 搜索真题
- [ ] 个人中心
- [ ] 删除功能

## 常见问题与解决

### 问题 1: 部署后显示空白页面

**原因**：
- 环境变量未配置
- 构建失败

**解决**：
1. 检查 Vercel/Railway 的环境变量
2. 查看构建日志
3. 确认 Supabase URL 和 ANON KEY 正确

### 问题 2: API 请求失败

**原因**：
- CORS 配置问题
- Supabase RLS 策略问题

**解决**：
1. 在 Supabase 设置中启用 CORS
2. 检查 RLS 策略
3. 查看浏览器控制台错误

### 问题 3: 域名无法访问

**原因**：
- DNS 未生效
- 防火墙阻止
- Nginx 配置错误

**解决**：
1. 使用 https://tool.chinaz.com 检查 DNS
2. 检查服务器防火墙（80/443端口）
3. 测试 Nginx 配置

### 问题 4: HTTPS 证书申请失败

**原因**：
- 域名未正确解析
- 防火墙阻止 80 端口

**解决**：
1. 确认 DNS 已生效
2. 开放 80 端口
3. 使用 DNS 验证方式

## 部署后维护

### 日常维护
```bash
# 查看日志
pm2 logs wokao

# 重启应用
pm2 restart wokao

# 更新代码
git pull origin main
npm install
npm run build
pm2 restart wokao
```

### 监控
```bash
# 安装监控工具
pm2 install pm2-logrotate

# 查看状态
pm2 monit
```

### 备份
- 定期备份 Supabase 数据库
- 备份 Storage 文件
- 保存环境配置文件

## 推荐的生产部署架构

```
用户浏览器
    ↓
域名 DNS 解析
    ↓
CDN 加速（可选）
    ↓
HTTPS 证书 (Let's Encrypt)
    ↓
Nginx 反向代理
    ↓
Node.js 应用 (PM2)
    ↓
Supabase (数据库 + Storage + Auth)
```

## 获取帮助

如果在部署过程中遇到问题：

1. **Vercel 问题**：https://vercel.com/support
2. **Railway 问题**：https://railway.app/help
3. **Nginx 配置**：https://nginx.org/en/docs/
4. **Supabase 问题**：https://supabase.com/docs

---

## 快速开始推荐

### 最简单方案：Vercel

1. 创建 GitHub 仓库
2. 推送到 GitHub
3. 连接 Vercel
4. 配置环境变量
5. 部署完成！

预计时间：30分钟-1小时

### 最稳定方案：阿里云/腾讯云

1. 购买云服务器
2. 安装环境
3. 上传代码
4. 配置 Nginx
5. 配置域名
6. 申请 SSL

预计时间：2-3小时

---

**祝部署顺利！** 🚀
