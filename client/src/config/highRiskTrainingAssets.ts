/**
 * 日常高风险操作场景的培训资料白名单。
 * 仅允许固定映射的非可执行资料；如需替换，请同步更新展示信息和静态地址。
 */
const trainingAsset = (fileName: string) => `${import.meta.env.BASE_URL}training-assets/${fileName}`;

export const ALLOWED_TRAINING_FILE_EXTENSIONS = ["txt", "pdf", "png", "jpg", "jpeg", "webp"] as const;

export const HIGH_RISK_TRAINING_ASSET = {
  displayName: "软件下载风险说明培训资料",
  downloadName: "软件下载风险说明_培训资料.txt",
  metadata: "1.2 KB · TXT 培训文本",
  assetUrl: trainingAsset("software-download-risk-training.txt"),
} as const;

export function isAllowedTrainingFile(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return Boolean(extension && ALLOWED_TRAINING_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_TRAINING_FILE_EXTENSIONS)[number]));
}
