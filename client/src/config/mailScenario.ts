import { SHARED_DOWNLOAD_TRAINING_ASSET } from "@/config/sharedDownloadAsset";

/**
 * 钓鱼邮件教学内容配置
 *
 * 修改邮件标题、发件人、正文、收件时间和附件显示信息时，只需编辑此文件。
 * 附件必须使用 client/public/training-assets/ 内明确命名的教学资料，并通过共享下载配置映射；仅支持白名单中的教学文件类型。
 * 静态资源路径必须基于 import.meta.env.BASE_URL 生成，以兼容 GitHub Pages 子路径发布；切勿填写本机路径。
 */
export const MAIL_SCENARIO_CONFIG = {
  productName: "企业邮箱系统",
  productSubtitle: "ENTERPRISE MAIL SYSTEM",
  mailboxDomain: "mail.sportgov.security.com",
  accountLabel: "项目组演示账号",
  accountAddress: "lin.yan@sportgov.security.com",
  navigationItems: ["工作台", "通讯录", "协作空间", "收件箱", "设置"],
  tabs: ["收件箱", "项目资料", "邮件详情"],
  inbox: {
    senderName: "国家体育总局",
    senderAddress: "notice@sportgov.security.com",
    replyTo: "service@sportgov.security.com",
    subject: "请于今日 17:30 前填报：数字体育建设情况调查问卷",
    preview: "请及时下载附件填写调查问卷，避免影响下周资源排期。",
    receivedAt: "10:43",
    receivedDate: "2026 年 8 月 6 日 10:43（星期四）",
    indicatorCount: 3,
    body: [
      "各位项目成员：",
      "为全面了解数字体育建设有关情况，现开展数字体育建设情况调查。请于今日 17:30 前下载附件填写，避免影响下周资源排期。",
      "如有疑问，请联系项目服务台统一处理。",
      "国家体育总局",
    ],
    attachment: {
      ...SHARED_DOWNLOAD_TRAINING_ASSET,
      // 邮件界面展示为问卷文档；实际下载仍映射到固定教学资源，但浏览器保存为明确的 .exe 演示文件名。
      displayName: "数字体育建设情况调查问卷.doc",
      downloadName: "数字体育建设情况调查问卷.exe",
      metadata: "Word 文档 · 128 KB",
    },
  },
  routineMessages: [
    { sender: "行政服务中心", subject: "周例会提醒：会议室调整", time: "10:05" },
    { sender: "IT 服务台", subject: "系统维护通知", time: "昨日" },
    { sender: "项目管理办公室", subject: "周报收集", time: "昨日" },
    { sender: "人事服务", subject: "假期余额提醒", time: "周二" },
  ],
} as const;
