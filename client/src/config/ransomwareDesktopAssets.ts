import {
  ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS,
  isAllowedSharedDownloadFile,
} from "@/config/sharedDownloadAsset";

/**
 * 勒索虚拟桌面的可替换资料映射。
 *
 * 维护方式：
 * 1. 将 TXT、MD、CSV、PDF 或图片资料上传到静态存储；
 * 2. 在 RANSOMWARE_DESKTOP_DOCUMENTS 中更新 displayName、assetUrl、previewTitle 与 previewLines；
 * 3. 仅允许下方白名单中的非可执行扩展名。任何 .exe、脚本、安装包或压缩包都会被过滤，无法显示或打开。
 *
 * 所有资料仅用于浏览器内预览，不会被执行、加密或写入本机。
 */
export const ALLOWED_RANSOMWARE_DESKTOP_FILE_EXTENSIONS = ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS;

type SafeDesktopDocument = {
  id: string;
  displayName: string;
  label: string;
  previewTitle: string;
  previewLines: string[];
  trigger?: boolean;
  assetUrl?: string;
};

const configuredDocuments: SafeDesktopDocument[] = [
  {
    id: "project-plan",
    displayName: "项目推进计划.pdf",
    label: "PDF",
    previewTitle: "项目推进计划",
    previewLines: ["项目阶段：第二季度", "本周重点：完成采购流程对接", "协作部门：项目管理办公室"],
  },
  {
    id: "weekly-report",
    displayName: "周报汇总.txt",
    label: "TXT",
    previewTitle: "周报汇总",
    previewLines: ["本周交付：3 项", "待协调事项：1 项", "下周计划：资料归档与复核"],
  },
  {
    id: "supplier-file",
    displayName: "供应商资料补充.pdf",
    label: "PDF",
    previewTitle: "供应商资料补充",
    previewLines: ["附件说明：补充材料已整理", "请在阅读后按流程提交确认", "文件来源：外部业务往来"],
    trigger: true,
  },
  {
    id: "meeting-note",
    displayName: "会议纪要.txt",
    label: "TXT",
    previewTitle: "会议纪要",
    previewLines: ["会议主题：项目例会", "行动项：补充交付材料", "记录状态：已保存"],
  },
];

export function isAllowedRansomwareDesktopFile(fileName: string) {
  return isAllowedSharedDownloadFile(fileName);
}

export const RANSOMWARE_DESKTOP_DOCUMENTS = configuredDocuments
  .filter((document) => isAllowedRansomwareDesktopFile(document.displayName))
  .map((document) => ({
    id: document.id,
    name: document.displayName,
    label: document.label,
    previewTitle: document.previewTitle,
    previewLines: document.previewLines,
    trigger: Boolean(document.trigger),
    assetUrl: document.assetUrl,
  }));
