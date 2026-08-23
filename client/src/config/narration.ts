/**
 * 讲解音频配置
 *
 * 替换步骤：
 * 1. 将新的音频放入 client/public/training-assets/；
 * 2. 把对应步骤的 audioSrc 改为 trainingAsset("文件名")；
 * 3. 如需同步调整无法播放音频时的备用讲解，编辑 backupText。
 *
 * audioSrc 为空字符串时，该步骤会自动使用 backupText 的浏览器语音。
 * 音频仅服务于网页内预置培训内容，不应与本地文件、程序执行或真实设备控制关联。
 * home 用于主页的定时欢迎提示，可替换 audioSrc 并保留 backupText 作为备用。
 * download 的索引 0、1、2 分别对应场景进入、资料下载后打开提示、下载后约五秒的可选结束提示。
 * mail 的索引 0 对应邮件详情的入场讲解；可替换为自有音频。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const NARRATION_CONFIG = {
  home: {
    audioSrc: trainingAsset("home-welcome-security-experience.wav"),
    backupText: "欢迎来到网络安全体验区，请选择体验场景。",
  },
  download: {
    audioSrc: [trainingAsset("download-narration-entry-unified.wav"), trainingAsset("download-narration-open-repaired.wav"), trainingAsset("download-narration-warning-unified.wav"), ""],
    backupText: [
      "当前页面展示的是软件下载场景。此类页面的风险常见于域名相似拼写、来源不明，或软件名称、发布者与文件信息不一致。若继续使用，可能造成账号凭据、隐私或业务数据暴露。请选择你想要下载的软件。",
      "请在浏览器下载列表中打开已下载的内容。",
      "",
      "",
    ],
  },
  mail: {
    audioSrc: [trainingAsset("mail-narration-risk-and-download-unified.wav"), trainingAsset("download-narration-warning-unified.wav"), "", ""],
    backupText: [
      "请注意，这封邮件可能存在伪造发件人、相似地址、异常链接和来源不明附件等风险。若误信并打开可疑内容，可能造成账号信息泄露、业务数据暴露或工作中断。请点击附件内容进行下载，并在浏览器下载列表中打开已下载的内容。",
      "",
      "",
      "",
    ],
  },
  ransomware: {
    audioSrc: [
      trainingAsset("ransomware-narration-entry-unified.wav"),
      trainingAsset("ransomware-narration-document-unified.wav"),
      trainingAsset("ransomware-narration-locked-unified.wav"),
      trainingAsset("ransomware-narration-response-unified.wav"),
    ],
    backupText: [
      "当前为浏览器内的虚拟业务桌面。勒索软件常通过伪装文档、钓鱼邮件附件、远程服务弱口令或未修补漏洞进入终端。请先打开任意文档查看正常业务资料。",
      "文档当前可以正常浏览。请留意名称相近的供应商补充资料；真实攻击中，伪装文件常利用业务往来的信任关系诱导打开。",
      "当伪装文档被打开后，虚拟桌面中的文件会被锁定。真实事件可能导致业务中断、数据不可用和恢复成本上升。",
      "不要反复尝试打开文件或进行处置操作。应优先断开网络、报告安全团队、保留现场，并依预案从离线备份恢复；同时做好补丁更新、最小权限和定期演练。",
    ],
  },
} as const;
