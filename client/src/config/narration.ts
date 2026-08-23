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
 * mail 的索引 0、1、2、3 分别对应邮件详情、附件下载、上报处置与复盘；可逐项替换为自有音频。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const NARRATION_CONFIG = {
  home: {
    audioSrc: trainingAsset("home-welcome-security-experience.wav"),
    backupText: "欢迎来到网络安全体验区，请选择体验场景。",
  },
  download: {
    audioSrc: ["", trainingAsset("open-downloaded-content-guide.wav"), "", ""],
    backupText: [
      "当前页面展示的是软件下载场景。此类页面的风险常见于域名相似拼写、来源不明，或软件名称、发布者与文件信息不一致。若继续使用，可能造成账号凭据、隐私或业务数据暴露。请选择你想要下载的软件。",
      "请在浏览器下载列表中打开已下载的内容。",
      "",
      "",
    ],
  },
  mail: {
    audioSrc: ["", "", "", ""],
    backupText: [
      "请查看邮件中的发件地址、回复地址、时间和附件信息。页面下方展示了预置的风险过程与防范建议。",
      "",
      "",
      "",
    ],
  },
  ransomware: {
    audioSrc: [trainingAsset("ransomware-scenario-narration.wav"), "", "", ""],
    backupText: [
      "虚拟业务终端收到一份供应商资料。真实事件中的异常往往先以单个文件无法打开或终端告警的形式出现。",
      "异常已经出现。请先判断哪一个动作最能阻断影响扩散。不要把时间耗费在反复打开文件上。",
      "此处展示的是浏览器内的虚拟勒索效果，不会修改任何真实文件。正确处置强调隔离、报告、保留现场与依预案恢复。",
      "推演结束。离线备份、最小权限、及时更新和定期演练，是恢复业务韧性的关键基础。",
    ],
  },
} as const;
