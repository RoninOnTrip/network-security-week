/**
 * 钓鱼邮件教学内容配置
 *
 * 修改邮件标题、发件人、正文、收件时间和附件显示信息时，只需编辑此文件。
 * 附件必须使用 client/public/training-assets/ 中的明确教学资料；仅支持 txt、pdf、png、jpg、jpeg、webp 等不可执行文件。
 * 请使用 trainingAsset("文件名") 填入 attachment.assetUrl，切勿填写本机路径或可执行文件地址。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const MAIL_SCENARIO_CONFIG = {
  productName: "企业邮箱系统",
  productSubtitle: "ENTERPRISE MAIL SYSTEM · TRAINING VIEW",
  mailboxDomain: "mail.hailing.example-training.local",
  accountLabel: "华辰集团演示账号",
  accountAddress: "lin.yan@hailing.example-training.local",
  navigationItems: ["工作台", "通讯录", "协作空间", "收件箱", "设置"],
  tabs: ["收件箱", "项目资料", "邮件详情"],
  inbox: {
    senderName: "海岭供应链协同中心",
    senderAddress: "notice@hailing-supply.example-training.local",
    replyTo: "service-confirm@hailing-office.example-training.local",
    subject: "请于今日 17:30 前确认：项目会议资料更新",
    preview: "请及时下载附件查看更新内容，避免影响本周项目排期。",
    receivedAt: "10:43",
    receivedDate: "2026 年 8 月 6 日 10:43（星期四）",
    indicatorCount: 3,
    body: [
      "各位项目成员：",
      "因本周供应商沟通安排调整，现更新项目会议资料。请于今日 17:30 前下载附件查看，避免影响下周资源排期。",
      "如有疑问，请联系项目服务台统一处理。",
      "海岭供应链协同中心",
    ],
    attachment: {
      displayName: "项目会议资料更新_培训样例.txt",
      downloadName: "项目会议资料更新_培训样例.txt",
      metadata: "471 B · 培训资料附件",
      assetUrl: trainingAsset("project-meeting-material-update-training.txt"),
    },
  },
  routineMessages: [
    { sender: "行政服务中心", subject: "周例会提醒：会议室调整", time: "10:05" },
    { sender: "IT 服务台", subject: "系统维护通知", time: "昨日" },
    { sender: "项目管理办公室", subject: "周报收集", time: "昨日" },
    { sender: "人事服务", subject: "假期余额提醒", time: "周二" },
  ],
} as const;
