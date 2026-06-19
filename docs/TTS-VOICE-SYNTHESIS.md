# 语音合成方案：解决安卓手机单词发音问题

> 关键词：安卓手机、华为 / 荣耀 TTS、Web Speech API 限制

## 背景与问题

### 最初方案：只依赖 Web Speech API

LinguaNest 最初依赖浏览器原生的 Web Speech API（`speechSynthesis.speak()`）来朗读单词。该方案：

- **iPhone / 英文单词/

| 平台 | 英文 | 支持情况 |
|--------|-----|---------|
| iPhone | |

** 在 iPhone |
| iOS Safari | 系统原生 TTS，对主流设备均正常 |
| Windows Chrome | 系统 TTS，对多数语言均正常 |
| **华为 / 荣耀安卓 | **国产安卓（华为 / 荣耀 / 小米等 |

### 国产安卓（华为 / 荣耀 / 小米等 |
| **系统出厂时未预装英文 / 日语 / 韩语 TTS 语音包 |
| ** 用户：

**核心原因：
- 国产安卓手机出厂时未预装英文 / 日语 / 韩语的 TTS 语音包
- 浏览器 `speechSynthesis.getVoices() 返回为空或仅中文/ 中文
- 直接调用百度翻译 TTS（`https://fanyi.baidu.com/gettts?...`）—— `403 Forbidden`
- 需要通过服务器端代理

## 最终方案：混合方案（云端 TTS + Web Speech API）

### 架构总图

```
   ┌─────────────────────────────────────────────────────────────────┐
   │                    用户浏览器（手机 / 桌面 │
   │  ┌─────────────────────────────────────────────────────┐  │
   │  │  Word Card（单词卡片）│
   │  └────────────┬────────────────────────────────────────────┘  │
   │               │  speak(text, lang)                                  │
   │               ▼                                               │
   │   ┌──────────────────────────────────┐              │
   │   │  speech.ts （混合调度器 │  │
   │   │  ───────────────────── │  │
   │   │  手机端 → 云端 TTS（优先） │ │
   │   │  桌面端 → Web Speech（优先） │ │
   │   │  任何方案失败 → 自动降级     │ │
   │   └────┬────────────────┬───────────────────────────────┘  │
   │        │                │                            │
   │        ▼                ▼                              │
   │  /api/tts/?lan=..   speechSynthesis.speak() │
   └────────┬──────────────────────────────────────────────────┘
            │ HTTP 请求                                          │
            ▼                                                   │
   ┌─────────────────────────────────────────────────────────────┐
   │  Nginx（111.230.114.42:81）                 │
   │  ┌──────────────────────────────────────────────────┐ │
   │  │  /api/tts/ → proxy_pass 127.0.0.1:8787 │ │
   │  └──────────────────────────────────────────────────┘ │
   │                            │                          │
   └────────────────────────────┬────────────────────────────┘
                                │
                                ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Python TTS Proxy（tts-proxy.service, 端口 8787）              │
   │  ┌──────────────────────────────────────────────────┐ │
   │  │  import requests, flask, urllib... │ │
   │  │  模拟浏览器请求，添加 UA / Referer / Cookie │ │
   │  │  请求 fanyi.baidu.com/gettts       │ │
   │  │  返回 MP3 音频流                     │ │
   │  └──────────────────────────────────────────────────┘ │
   │                            │                          │
   └────────────────────────────┬────────────────────────────┘
                                │
                                ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  百度翻译 TTS 服务（fanyi.baidu.com/gettts）              │
   └─────────────────────────────────────────────────────────────┘
```

## 前端实现

### speech.ts — 混合调度器

文件：[`src/utils/speech.ts`](../src/utils/speech.ts)

```typescript
// 设备检测：判断是否是手机端
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// 统一入口：根据设备选择朗读方案
export const speak = async (text: string, language: LanguageCode): Promise<void> => {
  if (!text) return;
  const mobile = isMobileDevice();

  // 手机端：先云端 TTS（主方案），失败降级到 Web Speech
  if (mobile) {
    try {
      await speakWithCloudTTS(text, language);
      return;
    } catch {
      if (hasWebSpeechSupport(language)) {
        try { await speakWithWebSpeech(text, language); return; } catch {}
      }
    }
  }

  // 桌面端：先 Web Speech（音质佳），失败降级到云端 TTS
  else {
    if (hasWebSpeechSupport(language)) {
      try { await speakWithWebSpeech(text, language); return; } catch {}
    }
    try { await speakWithCloudTTS(text, language); } catch {}
  }
};
```

### 云端 TTS 播放（speakWithCloudTTS）

通过 HTML5 `<audio>` 元素播放服务器代理返回的 MP3 音频：

```typescript
function speakWithCloudTTS(text: string, language: LanguageCode): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!text) { resolve(); return; }
    const lan = BAIDU_LANG_MAP[language] || 'en';
    const url = `/api/tts/?lan=${encodeURIComponent(lan)}&text=${encodeURIComponent(text)}&spd=3`;
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('cloud_tts_failed'));
    audio.play();
  });
}
```

**移动端 autoplay 限制**：`audio.play()` 必须在用户交互（点击/触摸）内触发。LinguaNest 的 `speak()` 通常在按钮点击或卡片翻转时调用，满足条件。

### 语言代码映射

| 内部代码 | 百度翻译 TTS 代码 | 说明 |
|---------|-------------------|------|
| `en` | `en` | 英文 |
| `ja` | `jp` | 日语 |
| `ko` | `kor` | 韩语 |

## 后端实现

### Python TTS 代理脚本

文件位置（服务器）：`/usr/local/bin/tts-proxy.py`

```python
#!/usr/bin/env python3
"""
TTS Proxy Server
代理请求百度翻译 TTS，解决浏览器直接请求 403 Forbidden 的问题

关键：添加正确的 User-Agent / Referer / Cookie 请求头，
     强制使用 IPv4（避免 IPv6 不可达）

监听端口：8787（仅监听 127.0.0.1）

API: GET /?lan=en&text=hello&spd=3
"""
import sys
import urllib.request
import urllib.parse
import http.server
import socketserver
import ssl
import socket

PORT = 8787
BAIDU_URL = "https://fanyi.baidu.com/gettts"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://fanyi.baidu.com/',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
}


class TTSHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # 解析查询参数
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        lan = params.get('lan', ['en'])[0]
        text = params.get('text', [''])[0]
        spd = params.get('spd', ['3'])[0]

        if not text:
            self.send_response(400)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Missing text')
            return

        # 请求百度翻译 TTS
        url = f"{BAIDU_URL}?lan={lan}&text={urllib.parse.quote(text)}&spd={spd}&source=web"
        req = urllib.request.Request(url, headers=HEADERS, method='GET')

        # 强制使用 IPv4
        # 手动构造 IPv4 地址族（在 IPv6 地址族
        orig_getaddrinfo = socket.getaddrinfo
        def ipv4_getaddrinfo(*args, **kwargs):
            infos = orig_getaddrinfo(*args, **kwargs)
            return [(socket.AF_INET, )] + [i for i in infos if i[0] == socket.AF_INET]
        socket.getaddrinfo = ipv4_getaddrinfo

        try:
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                audio_data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(len(audio_data)))
                self.send_header('Cache-Control', 'public, max-age=3600')
                self.end_headers()
                self.wfile.write(audio_data)
        except Exception as e:
            print(f"[TTS Proxy] 请求失败: {e}", file=sys.stderr)
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'TTS Service Error')

    # 抑制默认日志
    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), TTSHandler) as httpd:
        print(f"TTS Proxy listening on 127.0.0.1:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("TTS Proxy shutting down")
```

### systemd 服务配置

文件位置（服务器）：`/etc/systemd/system/tts-proxy.service`

```ini
[Unit]
Description=TTS Proxy Server (Baidu Translate TTS for multilingual learning)
After=network.target
[Service]
Type=simple
ExecStart=/usr/bin/python3 /usr/local/bin/tts-proxy.py
Restart=always
RestartSec=3
User=www-data
[Install]
WantedBy=multi-user.target
```

**服务管理命令：

```bash
# 启动/ 启用 / 停止
sudo systemctl start tts-proxy
sudo systemctl enable tts-proxy
sudo systemctl stop tts-proxy
# 查看状态/ 日志
sudo systemctl status tts-proxy
sudo journalctl -u tts-proxy -f
```

## Nginx 配置

### 81 端口 — LinguaNest 主站点

文件位置（服务器）：`/etc/nginx/sites-enabled/linguanest`

```nginx
server {
    listen 81;
    server_name 111.230.114.42;

    root /var/www/linguanest;
    index index.html;

    # TTS 代理：转发到本地 Python 服务（端口 8787）
    location /api/tts/ {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
        proxy_pass http://127.0.0.1:8787/;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
        expires 1h;
        add_header Cache-Control 'public';
    }

    # SPA 路由回退：React Router 需要所有未匹配路径返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control 'no-cache';
    }

    # 静态资源长期缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control 'public, immutable';
    }

    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### 本地配置参考

本地 Nginx 配置文件参考见：[`deploy/linguanest-nginx.conf`](../deploy/linguanest-nginx.conf)

## API 规范

### 请求格式

```
GET /api/tts/?lan=<language_code>&text=<text>&spd=3
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `lan` | string | 是 | 语言代码：`en` / `jp` / `kor` |
| `text` | string | 是 | 要朗读的文本（URL-encoded） |
| `spd` | int | 否 | 语速，默认 3，范围 1-9 |

### 响应

| HTTP 状态 | Content-Type | 说明 |
|-----------|------------|------|
| `200 OK` | `audio/mpeg` | 返回 MP3 音频流 |
| `400 Bad Request` | `text/plain` | 缺少 text 参数 |
| `502 Bad Gateway` | `text/plain` | 百度 TTS 服务不可达 |

## 故障排查

### 手机听不到发音

**检查 1：TTS 代理是否运行**
```bash
sudo systemctl status tts-proxy
# 预期：active (running)
```

**检查 2：直接测试 TTS 代理**
```bash
curl -s "http://127.0.0.1:8787/?lan=en&text=hello&spd=3" -o /tmp/test.mp3
file /tmp/test.mp3
# 预期：MPEG ADTS, layer III
```

**检查 3：测试 Nginx 转发**
```bash
curl -s "http://111.230.114.42:81/api/tts/?lan=en&text=hello&spd=3" -o /dev/null -w "%{http_code}"
# 预期：200
```

**检查 4：浏览器 Console**
打开浏览器开发者工具 → Console 标签，查找 `[Speech]` 前缀的日志。

### 页面空白或 500

**常见原因**：Nginx `try_files` 配置错误。

**正确配置应为：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**错误示例**：之前写成 `try_files \ \/ /index.html;` 会导致 500 Internal Server Error 和无限重定向循环。

### 403 Forbidden（旧问题记录）

**原因**：浏览器直接请求百度翻译 TTS API（`fanyi.baidu.com/gettts`），百度服务器根据 Referer / User-Agent 判断为非浏览器请求，返回 403。

**解决方案**：通过 Python 代理模拟浏览器请求头。

## 安全考虑

1. **TTS 代理仅监听 `127.0.0.1`，不暴露公网，外部访问需经 Nginx 转发
2. Nginx 配置 `proxy_pass` 到本地端口，外部无法直接访问 8787
3. 添加 `Access-Control-Allow-Origin: *` 允许跨域请求（本项目是同源部署，无需严格限制）
4. 百度 TTS 是免费公开 API（百度翻译的公开接口，无认证但有请求频率限制）

## 文件清单

| 文件 | 位置 | 说明 |
|------|------|------|
| `src/utils/speech.ts | 前端 | 混合语音合成调度器 |
| `deploy/linguanest-nginx.conf` | 前端部署 | Nginx 站点配置模板 |
| `tts-proxy.py` | 服务器 `/usr/local/bin/ | Python TTS 代理脚本 |
| `tts-proxy.service` | 服务器 `/etc/systemd/system/ | systemd 服务配置 |
| `linguanest` | 服务器 `/etc/nginx/sites-enabled/ | Nginx 站点启用配置 |

## 变更历史

- **v1.0**（初始）：仅 Web Speech API，国产安卓手机无法播放非中文单词
- **v2.0**（当前）：云端 TTS + Web Speech API 混合方案，所有设备正常播放
