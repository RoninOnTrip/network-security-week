# 网络安全周演示方案

这是一个仅在浏览器内运行的静态网络安全意识培训网站，包含日常高风险操作、钓鱼邮件和勒索病毒三个独立演示场景。

## GitHub Pages 发布

推送到 `main` 分支后，GitHub Actions 会构建并部署 `dist/public`。请在仓库的 **Settings → Pages** 中将发布源设置为 **GitHub Actions**。

本项目不下载、执行或控制任何真实恶意程序、设备或本地文件。培训附件仅固定映射为仓库内的非可执行资料。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 替换培训资料

将资料放入 `client/public/training-assets/`，并在相应配置文件中更新显示名、下载名与静态资源路径。只使用 TXT、PDF、PNG、JPG、JPEG 或 WEBP 等非可执行文件。
