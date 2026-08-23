# 两个下载场景的共用资料说明

日常高风险操作与钓鱼邮件共用一份固定资料，配置文件为：

`client/src/config/sharedDownloadAsset.ts`

## 更换资料

1. 上传 TXT、MD、CSV、PDF 或图片资料到静态存储。
2. 在 `SHARED_DOWNLOAD_TRAINING_ASSET` 中更新 `assetUrl`、`displayName`、`downloadName`、`metadata`。
3. 两个场景会自动下载同一份新资料，无需分别修改。

白名单为 `ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS`。不允许 EXE、MSI、脚本、安装包、APK 或压缩包；系统不会读取、扫描或将文件夹中的任意文件自动映射为下载内容。
