/**
 * 日常高风险操作与钓鱼邮件共用的固定下载资料。
 *
 * 维护方式：只需在本文件修改一次 assetUrl、displayName、downloadName 与 metadata，
 * 两个场景会同步使用该资料。不会读取、扫描或自动下载任何文件夹内容。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS = [
  "txt",
  "md",
  "exe",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
] as const;

export const SHARED_DOWNLOAD_TRAINING_ASSET = {
  displayName: "download.exe",
  downloadName: "download.exe",
  metadata: "安全检测通过",
  assetUrl: trainingAsset("muma.exe"),
} as const;

export function isAllowedSharedDownloadFile(downloadName: string) {
  const extension = downloadName.split(".").pop()?.toLowerCase();
  return Boolean(extension && ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS)[number]));
}
