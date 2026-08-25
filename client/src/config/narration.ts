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
      "当前页面展示的是软件下载场景。此类页面的风险常见于域名相似拼写、来源不明或软件名称、发布者与文件信息不一致。若继续使用，可能造成账号凭据、隐私或业务数据暴露。请选择您想要下载的软件。",
      "请在浏览器下载列表中打开已下载的内容。",
      "您下载的安装包实为伪装的木马程序。点击运行后，可以在另一台主机上看到您的设备已经被远程控制。当设备出现运行变慢、频繁弹窗、未知进程、异常流量或账号异常登录等情况，应立即断开网络、隔离设备并上报安全团队。软件应优先从官方网站、正规应用商店或单位审核渠道获取。下载前请核验访问域名、发布者、数字签名及文件信息，切勿因推广排名靠前或页面外观相似而信任陌生来源。演示完毕，可以点击右下角“返回主页”继续体验其他演示场景。",
      "",
    ],
  },
  mail: {
    audioSrc: [trainingAsset("mail-narration-risk-and-download-unified.wav"), trainingAsset("mail-narration-impact-and-prevention-unified.wav"), "", ""],
    backupText: [
      "钓鱼邮件常冒充 IT、财务、人力或合作方，以账号验证、付款、合同等紧急事项诱导操作。若发件域名、回复地址或链接异常，索要密码或验证码，附带不明附件，或临时变更收款信息，应提高警惕并通过独立渠道核实。请下载附件，并在浏览器下载列表中打开已下载的文件。",
      "您下载并运行的文件实际是伪装成普通文档的木马程序。点击运行后，您可以在另一台主机上观察到设备已被控制的状态。为防范钓鱼邮件，当收到涉及付款、账号变更或敏感资料的邮件时，应先核验发件人身份及业务背景。对陌生链接和可疑附件，切勿直接点击或打开，应通过企业通讯录、既有业务联系人等独立渠道再次确认。发现异常后，应立即停止操作并上报信息安全团队。演示完毕，可以点击右下角“返回主页”继续体验其他演示场景。",
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
      "请返回桌面，并打开任意文档，找出您认为是安全的文件。",
    ],
  },
} as const;
