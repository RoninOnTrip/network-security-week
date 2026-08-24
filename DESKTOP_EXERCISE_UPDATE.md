# 桌面演示引导更新

## 已完成的调整

勒索场景的“开始”按钮现改为 **开始演示**。参与者点击后，页面不会再请求、下载或打开 `lesuo.exe`；取而代之的是一个网页内的桌面演示引导层。

该引导层会播放以下中文提示音：

> 回到桌面，并打开任意文档。

页面同时呈现桌面切换风格的入场、扫描与进度动画，并显示文字操作说明。参与者完成真实桌面上的人工演示后，可返回页面点击“我已完成桌面演示”，回到体验中心。

## 修改的文件

| 文件 | 变更 |
|---|---|
| `client/src/components/RansomwareDesktopScenario.tsx` | 移除 `lesuo.exe` 链接触发逻辑；新增桌面演示提示状态、开始按钮和完成按钮。 |
| `client/src/config/narration.ts` | 添加勒索场景第 3 段讲解配置及文字备用方案。 |
| `client/src/index.css` | 新增提示层入场、光晕、扫描线、进度动画和减少动态效果偏好支持。 |
| `client/public/training-assets/ransomware-narration-desktop-return.wav` | 新增与当前引导文案同步的中文提示音。 |

## 验证结果

已通过 `pnpm check` 和 `GITHUB_PAGES_BASE=/network-security-week/ pnpm run build:pages`。新的音频文件已被复制到 `dist/public/training-assets/`。

## 注意事项

项目内的 `client/public/training-assets/lesuo.exe` 仍被保留，但当前勒索场景不再引用它；若不再有其他用途，建议在确认后将其从公开仓库移除。网页只能提示参与者手动最小化浏览器，不能自动最小化浏览器或控制本机桌面。
