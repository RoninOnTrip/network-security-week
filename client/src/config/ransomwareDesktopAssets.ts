import {
  ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS,
  isAllowedSharedDownloadFile,
} from "@/config/sharedDownloadAsset";

const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

/**
 * 勒索场景的固定资料映射。
 * 点击“开始”仅下载这一份固定白名单资料；不会打开文件夹、扫描目录或访问真实文件。
 */
export const ALLOWED_RANSOMWARE_DESKTOP_FILE_EXTENSIONS = ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS;

export const RANSOMWARE_START_ASSET = {
  displayName: "lesuo.txt",
  downloadName: "lesuo.txt",
  metadata: "TXT 文本文档",
  assetUrl: trainingAsset("lesuo.txt"),
} as const;

export function isAllowedRansomwareDesktopFile(fileName: string) {
  return isAllowedSharedDownloadFile(fileName);
}

/** @deprecated 勒索场景现只使用 RANSOMWARE_START_ASSET。 */
export const RANSOMWARE_DESKTOP_DOCUMENTS = [] as const;
