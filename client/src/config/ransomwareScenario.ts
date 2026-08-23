/**
 * 浏览器内虚拟桌面配置。
 * 可将后续提供且拥有使用权的文档预览图片或文本摘要替换至 documents；
 * 该配置不会读取、打开、加密或修改用户真实文件。
 */
export const RANSOMWARE_DESKTOP_CONFIG = {
  systemName: "麒麟银河体验桌面",
  userName: "业务协同账号",
  documents: [
    {
      id: "project-plan",
      name: "项目推进计划.pdf",
      label: "PDF",
      previewTitle: "项目推进计划",
      previewLines: ["项目阶段：第二季度", "本周重点：完成采购流程对接", "协作部门：项目管理办公室"],
      trigger: false,
    },
    {
      id: "weekly-report",
      name: "周报汇总.docx",
      label: "DOCX",
      previewTitle: "周报汇总",
      previewLines: ["本周交付：3 项", "待协调事项：1 项", "下周计划：资料归档与复核"],
      trigger: false,
    },
    {
      id: "supplier-file",
      name: "供应商资料补充.pdf",
      label: "PDF",
      previewTitle: "供应商资料补充",
      previewLines: ["附件说明：补充材料已整理", "请在阅读后按流程提交确认", "文件来源：外部业务往来"],
      trigger: true,
    },
    {
      id: "budget",
      name: "费用预算表.xlsx",
      label: "XLSX",
      previewTitle: "费用预算表",
      previewLines: ["预算类别：业务运营", "当前版本：V3", "复核状态：待确认"],
      trigger: false,
    },
    {
      id: "meeting-note",
      name: "会议纪要.txt",
      label: "TXT",
      previewTitle: "会议纪要",
      previewLines: ["会议主题：项目例会", "行动项：补充交付材料", "记录状态：已保存"],
      trigger: false,
    },
    {
      id: "archive",
      name: "业务归档目录",
      label: "目录",
      previewTitle: "业务归档目录",
      previewLines: ["合同资料", "阶段报告", "历史归档"],
      trigger: false,
    },
  ],
} as const;
