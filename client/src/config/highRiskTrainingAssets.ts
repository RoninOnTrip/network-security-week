/**
 * 兼容旧调用：日常高风险操作现在与钓鱼邮件共用 sharedDownloadAsset.ts 中的同一份固定资料。
 */
export {
  ALLOWED_SHARED_DOWNLOAD_FILE_EXTENSIONS as ALLOWED_TRAINING_FILE_EXTENSIONS,
  SHARED_DOWNLOAD_TRAINING_ASSET as HIGH_RISK_TRAINING_ASSET,
  isAllowedSharedDownloadFile as isAllowedTrainingFile,
} from "@/config/sharedDownloadAsset";
