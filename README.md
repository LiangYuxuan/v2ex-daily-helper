# V2EX Daily Helper

V2EX签到自动化脚本

## 功能

- [x] 每天签到

## 获取 Cookies

程序会依序尝试从以下途径获取Cookies
  * `.env`中的`COOKIES`
  * 环境变量`COOKIES`
  * 已配置的[CookieCloud](https://github.com/easychen/CookieCloud)服务
  * `.cookies`文件内容

### 获取现有的 Cookies

打开开发人员工具，在网络/Network选项卡内随意挑选一个`v2ex.com`请求，然后在请求头中找到Cookie。

### 配置 CookieCloud

配置环境变量`COOKIE_CLOUD_URL`、`COOKIE_CLOUD_UUID`和`COOKIE_CLOUD_KEY`，在同步域名关键词中加入`v2ex.com`。

## 配置与运行

### Docker

```bash
vi .env
docker pull rhyster/v2ex-daily-helper:latest
docker run --rm --env-file .env --name v2ex rhyster/v2ex-daily-helper:latest
```

### Node

1. 运行环境

需要环境 Node.js >= 14.18.2

2. 配置

```bash
cp .env.example .env
vi .env
```

根据注释修改，如果需要禁用某项功能，将等号后置空或者改为0。

3. 开始运行

```bash
pnpm install
pnpm build
pnpm start
```

## 许可

MIT License
