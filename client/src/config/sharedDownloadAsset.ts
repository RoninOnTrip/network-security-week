/**
 * 日常高风险操作与钓鱼邮件共用的固定下载资料。
 *
 * 维护方式：只需在本文件修改一次 assetUrl、displayName、downloadName 与 metadata，
 * 两个场景会同步使用该资料。不会读取、扫描或自动下载任何文件夹内容。
 */
export const ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS = [
  "txt",
  "md",
  "csv",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
] as const;

export const SHARED_DOWNLOAD_TRAINING_ASSET = {
  displayName: "软件下载风险说明_培训资料.txt",
  downloadName: "软件下载风险说明_培训资料.txt",
  metadata: "1.2 KB · TXT 文本文档",
  assetUrl: "/manus-storage/software-download-risk-training_053d42f0.txt",
} as const;

export function isAllowedSharedDownloadFile(downloadName: string) {
  const extension = downloadName.split(".").pop()?.toLowerCase();
  return Boolean(extension && ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS)[number]));
}
