# GitHub Pages 发布说明

公开副本位于：

`/home/ubuntu/network-security-week-github`

该副本已经连接到公开仓库 `RoninOnTrip/network-security-week`。更新完成后，在公开副本目录执行以下命令：

```bash
pnpm check
GITHUB_PAGES_BASE=/network-security-week/ pnpm run build:pages
git add client/src/components/RansomwareDesktopScenario.tsx client/src/config/sharedDownloadAsset.ts client/src/config/ransomwareDesktopAssets.ts client/public/training-assets/
git commit -m "chore: update training assets"
git push origin main
```

推送 `main` 后，仓库中的 GitHub Pages 工作流会自动构建和发布。公开副本的音频应放在 `client/public/training-assets/`；普通文字资料在公开副本中同样应作为明确命名的固定文件，并通过对应配置的 `trainingAsset("文件名")` 引用。

发布前请始终执行 `pnpm check` 和 Pages 构建命令。请不要将可执行文件、脚本、安装包、压缩包或真实敏感资料提交到公开仓库。
