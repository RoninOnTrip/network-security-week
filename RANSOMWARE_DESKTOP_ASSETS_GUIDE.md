# 勒索场景资料维护

勒索场景保留路径动画和单一的“开始”按钮。点击按钮后，浏览器会在**新标签页打开**一份固定白名单资料，当前资料名称为 **`lesuo.txt`**；场景不显示桌面、资料文件夹或网页内预览。

唯一配置位置是：

`client/src/config/ransomwareDesktopAssets.ts`

## 替换 lesuo.txt

在 `RANSOMWARE_START_ASSET` 中替换下列字段。

| 字段 | 作用 | 当前值 |
|---|---|---|
| `assetUrl` | 上传后返回的 `/manus-storage/...` 地址 | `/manus-storage/lesuo_b06dc46e.txt` |
| `displayName` | 配置中的显示名称 | `lesuo.txt` |
| `downloadName` | 白名单校验与资料名称 | `lesuo.txt` |
| `metadata` | 资料类型说明 | `TXT 文本文档` |

开始按钮会先检查资料扩展名是否属于共享白名单，再在浏览器新标签页打开固定资料。原场景约三秒后返回体验中心；不会调用本机应用、执行、加密、删除、扫描或读取真实文件。

## 修改允许文件类型

勒索场景复用 `client/src/config/sharedDownloadAsset.ts` 内的 `ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS`。默认允许：`txt`、`md`、`csv`、`pdf`、`png`、`jpg`、`jpeg`、`webp`。如需加入新的**非可执行资料**类型，在该数组中增加扩展名，并让 `RANSOMWARE_START_ASSET.downloadName` 使用对应后缀。

禁止添加 EXE、MSI、脚本、安装包、APK 或压缩包。
