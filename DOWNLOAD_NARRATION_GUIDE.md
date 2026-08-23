# 下载后语音与资料白名单维护指南

本项目的下载入口仅允许**固定映射的非可执行说明内容**。不要把程序、脚本、压缩包或任何需要运行的文件加入下载配置。

## 修改允许的资料类型

打开 `client/src/config/highRiskTrainingAssets.ts`，编辑 `ALLOWED_TRAINING_FILE_EXTENSIONS` 数组。当前允许：`txt`、`md`、`csv`、`pdf`、`png`、`jpg`、`jpeg`、`webp`。

如需增加新的安全说明格式，在数组中追加小写扩展名，例如 `"rtf"`。同时在同一文件的 `HIGH_RISK_TRAINING_ASSET` 中更新 `assetUrl`、`displayName`、`downloadName` 与 `metadata`。不要让页面扫描本机目录或按文件夹自动下载。

## 本地生成下载后语音

当前下载后文案是：**“请在浏览器下载列表中打开已下载的内容。”**。可使用本地中文语音合成工具生成 WAV 或 MP3。Windows 可在 PowerShell 中运行：

```powershell
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SetOutputToWaveFile("$PWD\open-downloaded-content-guide.wav")
$speaker.Speak("请在浏览器下载列表中打开已下载的内容。")
$speaker.Dispose()
```

语音只用于网页内的无害说明内容下载提示，不应指向程序运行、设备控制或真实文件操作。

## 替换发布副本中的语音

将音频放入 `client/public/training-assets/`，然后在 `client/src/config/narration.ts` 的 `download.audioSrc[1]` 中使用：

```ts
audioSrc: ["", trainingAsset("open-downloaded-content-guide.wav"), "", ""]
```

将 `audioSrc[1]` 设为 `""` 时，页面会自动使用 `backupText[1]` 的浏览器语音。索引 `2` 是点击下载约五秒后的可选结束提示；当前默认空白，不会播放内容。需要启用时，将音频地址写入 `audioSrc[2]`，并保留相应的 `backupText[2]` 作为备用文案。最后执行：

```bash
pnpm check && GITHUB_PAGES_BASE=/network-security-week/ pnpm run build:pages
```
