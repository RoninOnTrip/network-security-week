# 三个场景的资料与白名单维护指南

本项目的资料仅用于浏览器内安全意识体验。资料采用**固定映射**，不会扫描目录、读取本机文件或执行程序。

> 请只使用明确无害、不可执行的说明材料。不要加入 `.exe`、`.msi`、`.bat`、`.cmd`、`.ps1`、`.js`、`.vbs`、压缩包或其他可执行/可携带脚本类型。

## 1. 修改允许的文件类型

统一白名单位于：

```text
client/src/config/sharedDownloadAsset.ts
```

修改 `ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS` 数组即可。当前允许的类型如下。

| 类型 | 用途 |
| --- | --- |
| `txt`、`md`、`csv` | 纯文本或表格说明资料 |
| `pdf` | 不可执行的文档资料 |
| `png`、`jpg`、`jpeg`、`webp` | 图片资料 |

勒索场景自动复用这份白名单，**不需要**单独维护第二个类型数组。若要增加新的非可执行类型，请同时确认资料本身不含宏、脚本或安装程序。

## 2. 替换日常高风险操作和钓鱼邮件的资料

这两个场景共享同一份资料配置，位置仍是：

```text
client/src/config/sharedDownloadAsset.ts
```

需要调整 `SHARED_DOWNLOAD_TRAINING_ASSET` 的四项内容。

| 字段 | 作用 | 当前示例 |
| --- | --- | --- |
| `assetUrl` | 已上传资料的固定地址 | `/manus-storage/muma_*.txt` |
| `displayName` | 邮件附件等页面显示的资料名称 | `muma.txt` |
| `downloadName` | 钓鱼邮件下载时保存的名称 | `muma.txt` |
| `metadata` | 页面中的文件类型说明 | `TXT 文本文档` |

日常高风险操作也使用这份资料内容，但下载列表会保留所选软件的名称和版本，并固定使用安全的 `.txt` 后缀，例如 `QQPCManager_17.2.0.txt`。这个显示命名逻辑位于：

```text
client/src/pages/Home.tsx
```

请在 `installerInfo` 中调整每个软件的名称与版本；系统会将 `.exe` 后缀转换为 `.txt`，不会下载或伪装为可执行安装包。

## 3. 替换勒索场景的资料

勒索场景的“开始”按钮只下载一份固定资料，配置位于：

```text
client/src/config/ransomwareDesktopAssets.ts
```

修改 `RANSOMWARE_START_ASSET` 的字段即可。

| 字段 | 作用 | 当前示例 |
| --- | --- | --- |
| `assetUrl` | 已上传资料的固定地址 | `/manus-storage/lesuo_*.txt` |
| `displayName` | 场景资料显示名称 | `lesuo.txt` |
| `downloadName` | 浏览器保存名称 | `lesuo.txt` |
| `metadata` | 文件类型说明 | `TXT 文本文档` |

## 4. 上传与发布步骤

首先将新资料保存在 `/home/ubuntu/webdev-static-assets/`，再上传并取得固定资源地址：

```bash
manus-upload-file --webdev /home/ubuntu/webdev-static-assets/你的资料文件.txt
```

将返回的 `/manus-storage/...` 地址填入对应配置的 `assetUrl`。然后进行主项目验证：

```bash
cd /home/ubuntu/network-security-week-simulator
pnpm check
pnpm build
```

GitHub Pages 公开副本位于 `/home/ubuntu/network-security-week-github`。将相关配置与小型资料文件同步到该副本的 `client/public/training-assets/` 后，执行：

```bash
cd /home/ubuntu/network-security-week-github
pnpm check
GITHUB_PAGES_BASE=/network-security-week/ pnpm run build:pages
git add client/src/config client/public/training-assets
git commit -m "chore: update training assets"
git push origin main
```

推送后，GitHub Pages 工作流会自动构建并发布。完整发布说明也可查看 `GITHUB_PAGES_DEPLOYMENT_GUIDE.md`。
