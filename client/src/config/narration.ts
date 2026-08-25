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
 * download 的索引 0、1、2 分别对应场景进入、资料下载后打开提示、下载后的防范建议。
 * mail 的索引 0、1 分别对应邮件详情的入场讲解、附件下载后的影响说明与防范建议。
 * ransomware 的索引 0、1、2 分别对应路径动画讲解、开始按钮出现时的提示与桌面演示引导。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const NARRATION_CONFIG = {
  home: {
    audioSrc: trainingAsset("home-welcome-security-experience.wav"),
    backupText: "欢迎来到网络安全体验区，请选择体验场景。",
  },
  download: {
    audioSrc: [trainingAsset("download-narration-entry-unified.wav"), trainingAsset("download-narration-open-repaired.wav"), trainingAsset("download-narration-prevention-unified.wav"), ""],
    backupText: [
      "当前页面展示的是软件下载场景。此类页面的风险常见于域名相似拼写、来源不明，或软件名称、发布者与文件信息不一致。若继续使用，可能造成账号凭据、隐私或业务数据暴露。请选择你想要下载的软件。",
      "请在浏览器下载列表中打开已下载的内容。",
      "本次演示说明，来源不明或信息不一致的软件可能携带木马等恶意程序，进而威胁账号、数据和业务连续性。防范此类风险，应优先通过官方网站、正规应用商店或经单位审核的软件渠道获取安装包；下载前请核对域名、发布者、数字签名和文件信息，避免因搜索推广位或相似页面误入风险来源。",
      "",
    ],
  },
  mail: {
    audioSrc: [trainingAsset("mail-narration-risk-and-download-unified.wav"), trainingAsset("mail-narration-impact-and-prevention-unified.wav"), "", ""],
    backupText: [
      "请注意，这封邮件可能存在伪造发件人、相似地址、异常链接和来源不明附件等风险。若误信并打开可疑内容，可能造成账号信息泄露、业务数据暴露或工作中断。请点击附件内容进行下载，并在浏览器下载列表中打开已下载的内容。",
      "请注意：本次下载的内容为模拟的风险文件。若在真实环境中误打开来源不明的可执行文件，设备可能受到恶意程序侵害；攻击者可能在用户未察觉的情况下获取控制权限、窃取信息或破坏业务数据。在本次培训中，可在隔离的教学设备上观察模拟影响结果；真实环境中切勿打开可疑文件。防范钓鱼邮件，应核验发件人与回复地址，核对业务流程与附件类型，并通过独立、可信的渠道向发件单位确认；对可疑邮件和附件，应停止操作并及时上报安全人员。",
      "",
      "",
    ],
  },
  ransomware: {
    audioSrc: [
      trainingAsset("ransomware-narration-animation-entry.wav"),
      trainingAsset("ransomware-narration-start-prompt.wav"),
      trainingAsset("ransomware-narration-desktop-return.wav"),
    ],
    backupText: [
      "勒索软件常借助伪造业务邮件、相似文件名称或来源不明的资料进入用户电脑。攻击者会利用看似正常的工作往来诱导打开内容，进而造成业务数据无法正常使用、工作中断和恢复成本上升。请注意核对来源、文件信息和业务确认路径。",
      "下面进入勒索病毒演示环节，请点击开始演示按钮。",
      "回到桌面，并打开任意文档。",
    ],
  },
} as const;
