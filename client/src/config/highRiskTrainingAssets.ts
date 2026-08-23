/**
 * 日常高风险操作场景的固定培训资料清单。
 *
 * 维护方式：
 * 1. 将新的非可执行资料放入 client/public/training-assets/；
 * 2. 更新 assetUrl、displayName、downloadName 与 metadata；
 * 3. 如需新增安全资料格式，只能在 ALLOWED_TRAINING_FILE_EXTENSIONS 中追加非可执行扩展名，例如 md 或 csv。
 *
 * 不读取本机目录，不自动选择目录中的文件，也不允许 .exe、.msi、.bat、.cmd、.ps1、.js、.vbs、.jar、.sh、.apk 或压缩包作为下载内容。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const ALLOWED_TRAINING_FILE_EXTENSIONS = [
  "txt",
  "md",
  "csv",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
] as const;

export const HIGH_RISK_TRAINING_ASSET = {
  displayName: "软件下载风险说明（培训资料）",
  downloadName: "软件下载风险说明_培训资料.txt",
  metadata: "1.2 KB · TXT 培训文本",
  assetUrl: trainingAsset("software-download-risk-training.txt"),
} as const;

export function isAllowedTrainingFile(downloadName: string) {
  const extension = downloadName.split(".").pop()?.toLowerCase();
  return Boolean(extension && ALLOWED_TRAINING_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_TRAINING_FILE_EXTENSIONS)[number]));
}
