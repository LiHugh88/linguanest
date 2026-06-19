# LinguaNest 部署指南

本文档介绍如何将 LinguaNest 多语言学习平台部署到生产环境服务器。

## 环境要求

- **Node.js** >= 18（本地构建用）
- **Nginx** >= 1.18
- **服务器系统**：Ubuntu 20.04+（本文以腾讯云 Ubuntu 为例）
- **SSH 访问**：拥有服务器 sudo 权限的账号

---

## 方式一：独立端口部署（推荐）

适用于不希望影响现有项目、需要快速上线的场景。LinguaNest 独占一个独立端口（如 81），与现有服务（80 端口）互不干扰。

### 步骤 1：本地构建

```bash
cd linguanest
npm install
npm run build
```

构建产物在 `dist/` 目录。

### 步骤 2：上传到服务器

```bash
# 上传 dist 目录内容到服务器的临时目录
scp -r dist/* user@your-server-ip:/tmp/linguanest-dist/
```

> 如果提示权限问题，可先上传到 `/tmp/` 再通过 SSH 移动到目标位置。

### 步骤 3：移动文件到 Web 目录

```bash
# SSH 登录服务器
ssh user@your-server-ip

# 创建 Web 根目录并移动文件
sudo mkdir -p /var/www/linguanest
sudo mv /tmp/linguanest-dist/* /var/www/linguanest/
sudo rm -rf /tmp/linguanest-dist

# 修改文件所有者（Nginx 以 www-data 用户运行）
sudo chown -R www-data:www-data /var/www/linguanest
sudo chmod -R 755 /var/www/linguanest
```

### 步骤 4：配置 Nginx

在服务器上创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/linguanest
```

填入以下内容（监听 81 端口）：

```nginx
server {
    listen 81;
    server_name YOUR_SERVER_IP;

    root /var/www/linguanest;
    index index.html;

    # SPA 路由支持：所有未匹配路径回落到 index.html
    # 这是 React Router History 模式的关键配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长期缓存（带 hash 的资源文件可缓存 30 天）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;
}
```

启用站点配置：

```bash
# 创建软链接启用站点
sudo ln -sf /etc/nginx/sites-available/linguanest /etc/nginx/sites-enabled/linguanest

# 检查配置语法
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 5：开放服务器端口（腾讯云 / 云厂商控制台）

> 必须通过云厂商控制台开放端口，服务器内部的防火墙（ufw）仅作为辅助。

在腾讯云控制台 → **安全组** → 找到当前实例的安全组 → **添加规则**：

| 字段 | 填写内容 |
|------|---------|
| **类型** | 自定义 TCP |
| **来源** | 0.0.0.0/0 |
| **协议** | TCP |
| **端口** | 81 |
| **策略** | 允许 |

### 步骤 6：验证部署

```bash
# 服务器本地测试
curl http://127.0.0.1:81/

# 外部访问测试（用实际 IP 替换 YOUR_SERVER_IP）
curl http://YOUR_SERVER_IP:81/
```

成功标志：返回 HTML 内容，状态码 HTTP 200。

**访问地址**：`http://YOUR_SERVER_IP:81`

---

## 方式二：子路径部署（与现有项目共用 80 端口）

适用于希望用域名直接访问、无需加端口号的场景。

### 步骤 1：本地构建

同上，生成 `dist/` 目录。

### 步骤 2：修改 Vite 配置（重要）

将 `vite.config.ts` 中的 `base` 改为子路径名称：

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/app/',        // ← 添加这一行，改为你的子路径名称
  server: {
    port: 5173,
    host: true,
  },
})
```

重新构建后上传到服务器：

```bash
npm run build
scp -r dist/* user@your-server-ip:/var/www/linguanest/
```

### 步骤 3：配置 Nginx（子路径版）

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    root /var/www/html;          # 现有项目根目录
    index index.html;

    # 现有项目的配置（不要动）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 新增：LinguaNest 子路径
    location /app/ {
        alias /var/www/linguanest/;
        try_files $uri $uri/ /app/index.html;
    }
}
```

> **重要**：`alias` 结尾的 `/` 与 `try_files` 中的 `/app/index.html` 必须匹配。

重启 Nginx：

```bash
sudo nginx -t && sudo systemctl restart nginx
```

**访问地址**：`http://YOUR_DOMAIN_OR_IP/app/`

### 步骤 4：配合 React Router（重要）

当使用子路径部署时，需要在 `App.tsx` 中为 `BrowserRouter` 添加 `basename`：

```tsx
// src/App.tsx
import { BrowserRouter, basename } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter basename="/app">
      {/* ... */}
    </BrowserRouter>
  );
}
```

---

## 后续更新部署

代码更新后，执行以下三步即可完成部署：

```bash
# 1. 本地重新构建
cd linguanest
npm run build

# 2. 上传到服务器（独立端口方式）
scp -r dist/* user@your-server-ip:/var/www/linguanest/

# 3. 重启 Nginx
ssh user@your-server-ip "sudo systemctl restart nginx"
```

> 如果更新后出现页面空白，请确认：<br>
> ① `vite.config.ts` 的 `base` 配置与 Nginx `alias` 路径一致<br>
> ② `App.tsx` 中 `BrowserRouter` 的 `basename` 与 `base` 一致

---

## 目录结构参考

部署完成后的服务器目录结构如下：

```
/var/www/
├── linguanest/           ← LinguaNest 构建产物
│   ├── index.html
│   └── assets/
│       ├── index-xxx.js
│       └── index-xxx.css
└── fraudguard/            ← 现有项目（不受影响）
    └── ...

/etc/nginx/
├── sites-available/
│   ├── linguanest         ← 新增配置
│   └── fraudguard         ← 现有配置
└── sites-enabled/
    ├── linguanest → ../sites-available/linguanest  ← 已启用
    └── fraudguard → ../sites-available/fraudguard  ← 已启用
```

---

## 常见问题

### Q1：访问返回 500 Internal Server Error

检查顺序：
1. `sudo cat /var/log/nginx/error.log` 查看具体错误
2. 确认 `/var/www/linguanest/` 文件权限为 `www-data:www-data`
3. 确认 Nginx 配置中 `try_files $uri $uri/ /index.html` 的变量未被转义
4. 运行 `sudo nginx -t` 确认配置语法正确
5. 运行 `sudo systemctl restart nginx` 重启服务

### Q2：外网无法访问（curl: (7) Failed to connect）

原因：云厂商安全组未开放对应端口。

解决：在云厂商控制台 → 安全组 → 入站规则 → 添加允许 TCP 端口的规则。

### Q3：刷新页面后出现 404

原因：`try_files` 配置缺失或路径错误，导致 Nginx 直接去文件系统找文件。

解决：确保 location 块中有 `try_files $uri $uri/ /index.html;`，这能让所有路由回落到 `index.html`，由前端 React Router 处理。

### Q4：静态资源 404

原因：`vite.config.ts` 的 `base` 与 Nginx `alias` 路径不一致。

解决：两者必须完全匹配。例如 `base: '/app/'` 则 Nginx 中 `alias /var/www/linguanest/;` 且 `try_files` 指向 `/app/index.html`。

### Q5：旧页面缓存问题

原因：浏览器缓存了旧的 JS/CSS 文件。

解决：Vite 构建的静态资源文件名自带 hash，更新后浏览器会自动请求新文件。如仍有问题，可在 Nginx 配置中给 HTML 添加 `Cache-Control: no-cache`：
```nginx
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
}
```

---

## 服务器维护命令

```bash
# 查看 Nginx 状态
sudo systemctl status nginx

# 重启 Nginx
sudo systemctl restart nginx

# 重载配置（不中断连接）
sudo systemctl reload nginx

# 检查配置语法
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```
