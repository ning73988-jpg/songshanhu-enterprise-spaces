# 松山湖产业招商网站

这是根据 WorkBuddy 在线版及微信小程序演示工程合并制作的网页评审版。包含 19 条演示房源、搜索和筛选、园区目录、房源详情。图片、价格及房源状态均为演示资料，正式使用前需要核实并接入真实数据。

## 本地运行

需要 Node.js 22。

```bash
npm ci
npm run dev
```

## 发布

推送到 `main` 后，GitHub Actions 会构建静态页面并发布到 GitHub Pages。首次发布时，在仓库 **Settings → Pages** 将 **Build and deployment → Source** 设为 **GitHub Actions**。

网址：<https://ning73988-jpg.github.io/songshanhu-enterprise-spaces/>

当前为纯静态演示站，暂无后台数据库、真实短信登录和在线报备服务。
