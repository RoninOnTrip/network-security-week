# 勒索虚拟桌面资料维护说明

勒索场景只展示**浏览器内预置资料**。资料来源、显示名称和预览文本均集中在：

`client/src/config/ransomwareDesktopAssets.ts`

## 允许类型

白名单默认允许：`txt`、`md`、`csv`、`pdf`、`png`、`jpg`、`jpeg`、`webp`。

不允许：`exe`、`msi`、`bat`、`cmd`、`ps1`、`js`、`vbs`、`jar`、`sh`、`apk` 及任何压缩包。即使将这些类型写入资料列表，前端也会过滤，不显示为桌面资料。

## 替换资料

1. 上传非可执行资料到静态存储。
2. 在 `configuredDocuments` 中更新 `displayName`、`assetUrl`、`previewTitle` 和 `previewLines`。
3. 将唯一一个需要触发浏览器内锁定效果的资料保留 `trigger: true`。

预览、锁定和提示均由网页状态实现；不会打开、下载、加密、删除或修改真实文件。
