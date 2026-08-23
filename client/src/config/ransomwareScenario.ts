import { RANSOMWARE_DESKTOP_DOCUMENTS } from "@/config/ransomwareDesktopAssets";

/**
 * 浏览器内虚拟桌面配置。
 * documents 仅来自 ransomwareDesktopAssets.ts 的非可执行白名单映射；
 * 该配置不会读取、打开、加密或修改用户真实文件。
 */
export const RANSOMWARE_DESKTOP_CONFIG = {
  systemName: "麒麟银河体验桌面",
  userName: "业务协同账号",
  documents: RANSOMWARE_DESKTOP_DOCUMENTS,
} as const;
