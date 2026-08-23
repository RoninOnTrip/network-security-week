# 日常高风险操作与钓鱼邮件资料维护

日常高风险操作和钓鱼邮件共用同一份固定下载资料，资源内容默认来自 **`muma.txt`**。唯一配置位置是：

`client/src/config/sharedDownloadAsset.ts`

## 替换 muma.txt

将新的无害资料上传到项目静态存储后，替换 `SHARED_DOWNLOAD_TRAINING_ASSET` 中的四个字段。

| 字段 | 作用 | 当前值 |
|---|---|---|
| `assetUrl` | 上传后返回的 `/manus-storage/...` 地址 | `/manus-storage/muma_b074c065.txt` |
| `displayName` | 邮件附件和页面中显示的名称 | `muma.txt` |
| `downloadName` | 浏览器保存时使用的名称 | `muma.txt` |
| `metadata` | 页面中的资料类型说明 | `TXT 文本文档` |

钓鱼邮件会以 `downloadName`（当前为 `muma.txt`）保存该固定资料。日常高风险操作会沿用同一份无害文本内容，但浏览器下载列表显示参与者所选软件的**非可执行 TXT 名称**，例如 `QQPCManager_17.2.0.txt`；它保留软件名称与版本信息，但不会伪装为或下载 `.exe` 安装包。

两个场景都只使用这一条固定映射，不会扫描或读取任何本地文件夹。

## 修改允许文件类型

白名单位于同一文件的 `ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS` 数组。默认允许：`txt`、`md`、`csv`、`pdf`、`png`、`jpg`、`jpeg`、`webp`。如需加入另一种**非可执行资料**类型，只在此数组中增加不含点号的扩展名，例如 `"docx"`；同时将 `downloadName` 的后缀改为相同类型。

不允许将 EXE、MSI、脚本、安装包、APK 或压缩包加入此白名单。前端仅下载配置中明确指定的一份无害资料，不会根据文件夹内容自动映射文件。
