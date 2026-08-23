/**
 * 设计提醒：本组件采用蓝色办公系统视觉与克制的路径动画；所有资料、预览和计时均为浏览器内 React 状态。
 * 设计原则：清晰的单一路径、可信的办公质感、不会访问或改变真实设备、真实文件或真实桌面。
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Folder, FolderOpen, LockKeyhole, Mail, RotateCcw, Search, X } from "lucide-react";
import { RANSOMWARE_DESKTOP_CONFIG } from "@/config/ransomwareScenario";

type RansomwareDesktopScenarioProps = {
  onLeave: () => void;
  onReset: () => void;
  onStageAudio: (step: number) => void;
  voiceEnabled: boolean;
};

type RansomwarePhase = "briefing" | "ready" | "folder" | "preview";

export function RansomwareDesktopScenario({ onLeave, onReset, onStageAudio, voiceEnabled }: RansomwareDesktopScenarioProps) {
  const [phase, setPhase] = useState<RansomwarePhase>("briefing");
  const [briefingStep, setBriefingStep] = useState(0);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const hasPlayedEntryNarration = useRef(false);
  const hasPlayedStartPrompt = useRef(false);
  const returnTimerRef = useRef<number | null>(null);
  const activeDocument = RANSOMWARE_DESKTOP_CONFIG.documents.find((document) => document.id === activeDocumentId) ?? null;

  const clearPendingReturn = () => {
    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (voiceEnabled && !hasPlayedEntryNarration.current) {
      hasPlayedEntryNarration.current = true;
      onStageAudio(0);
    }
  }, [onStageAudio, voiceEnabled]);

  useEffect(() => {
    if (phase === "ready" && voiceEnabled && !hasPlayedStartPrompt.current) {
      hasPlayedStartPrompt.current = true;
      onStageAudio(1);
    }
  }, [onStageAudio, phase, voiceEnabled]);

  useEffect(() => {
    const steps = [
      window.setTimeout(() => setBriefingStep(1), 220),
      window.setTimeout(() => setBriefingStep(2), 5200),
      window.setTimeout(() => setBriefingStep(3), 11200),
      window.setTimeout(() => setBriefingStep(4), 17700),
      window.setTimeout(() => setPhase("ready"), 26400),
    ];
    return () => steps.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => () => clearPendingReturn(), []);

  const handleLeave = () => {
    clearPendingReturn();
    onLeave();
  };

  const handleReset = () => {
    clearPendingReturn();
    onReset();
  };

  const skipBriefing = () => setPhase("ready");

  const beginFolderExperience = () => {
    clearPendingReturn();
    setActiveDocumentId(null);
    setPhase("folder");
  };

  const openDocument = (documentId: string) => {
    clearPendingReturn();
    setActiveDocumentId(documentId);
    setPhase("preview");
    returnTimerRef.current = window.setTimeout(() => {
      returnTimerRef.current = null;
      onLeave();
    }, 3000);
  };

  const closePreview = () => {
    clearPendingReturn();
    setActiveDocumentId(null);
    setPhase("folder");
  };

  return (
    <div className="relative z-10 min-h-screen overflow-hidden bg-[#dde5e8] text-[#172a35]">
      <header className="flex h-10 items-center justify-between border-b border-white/10 bg-[#17334d]/92 px-3 text-white shadow-[0_2px_10px_rgba(5,23,38,.24)] backdrop-blur sm:px-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleLeave} className="grid h-7 w-7 place-items-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="返回体验中心"><ArrowLeft className="h-4 w-4" /></button>
          <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-[linear-gradient(145deg,#217c8c,#264b79)] shadow-inner"><span className="h-3 w-3 rounded-full border-2 border-white/80" /></span>
          <div><p className="text-xs font-semibold tracking-wide">{RANSOMWARE_DESKTOP_CONFIG.systemName}</p><p className="text-[9px] tracking-[.14em] text-white/45">DESKTOP EXPERIENCE</p></div>
        </div>
        <div className="hidden items-center gap-3 text-[10px] text-white/70 sm:flex"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#63d6bb]" />网络已连接</span><span className="h-3 border-l border-white/15" /><span>{RANSOMWARE_DESKTOP_CONFIG.userName}</span><span>09:42</span><span className="h-2 w-3 rounded-sm border border-white/50" /></div>
        <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-white/18"><RotateCcw className="h-3.5 w-3.5" />一键重置</button>
      </header>

      <main className="relative min-h-[calc(100vh-40px)] overflow-hidden bg-[radial-gradient(ellipse_at_76%_14%,rgba(124,217,246,.58),transparent_21%),radial-gradient(circle_at_16%_76%,rgba(67,154,215,.38),transparent_31%),linear-gradient(136deg,#0f5b9d_0%,#187ebc_44%,#155896_100%)] px-5 pb-16 pt-5 sm:px-8 sm:pb-16 sm:pt-6">
        <div className="pointer-events-none absolute -right-28 top-16 h-[520px] w-[770px] rounded-[50%] border-[44px] border-white/10 blur-[.2px]" />
        <div className="pointer-events-none absolute -right-20 top-[118px] h-[430px] w-[680px] rounded-[50%] border border-white/20" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:34px_34px]" />

        {phase !== "briefing" && <section className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-4xl items-center justify-center">
          {phase === "ready" && <div className="ransom-ready-card w-full max-w-2xl overflow-hidden rounded-2xl border border-white/30 bg-[#0c3157]/78 p-7 text-center text-white shadow-[0_30px_90px_rgba(4,23,47,.35)] backdrop-blur-md sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-100/35 bg-cyan-100/10 text-cyan-100 shadow-[0_12px_32px_rgba(60,193,221,.17)]"><Folder className="h-8 w-8" /></div>
            <p className="mt-6 font-mono text-[10px] tracking-[.22em] text-cyan-100/70">ENTRY PATH REVIEW COMPLETE</p>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">资料查看环节</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/72">点击开始后，进入仅显示固定白名单资料的网页内文件夹。</p>
            <button type="button" onClick={beginFolderExperience} className="mt-8 inline-flex min-w-36 items-center justify-center rounded-lg bg-[#e6c35b] px-7 py-3.5 text-base font-semibold text-[#19314a] shadow-[0_10px_24px_rgba(8,19,35,.25)] transition hover:bg-[#f5d47a] active:scale-[.98]">开始</button>
          </div>}
        </section>}

        <div className="absolute inset-x-0 bottom-0 z-20 flex h-11 items-center justify-between border-t border-white/20 bg-[#0e2d51]/78 px-3 text-white shadow-[0_-5px_18px_rgba(4,23,47,.2)] backdrop-blur"><div className="flex items-center gap-1.5"><span className="inline-flex h-8 items-center gap-2 rounded-md bg-[#e9f3fa] px-2.5 text-[11px] font-semibold text-[#1d5f98] shadow-sm"><span className="h-3 w-3 rounded-full border-[3px] border-[#1b87c7]" />系统</span><span className="grid h-7 w-7 place-items-center rounded-md bg-[#2a79b5] text-white"><FileText className="h-4 w-4" /></span><span className="grid h-7 w-7 place-items-center rounded-md bg-[#da9b3b] text-white"><Mail className="h-4 w-4" /></span></div><div className="flex items-center gap-3 text-[10px] text-white/75"><span className="hidden sm:inline">输入法</span><span>网络</span><span>音量</span><span>09:42</span></div></div>
      </main>

      {phase === "briefing" && <section className="ransom-briefing fixed inset-x-0 bottom-0 top-10 z-[140] overflow-hidden bg-[#102b47] px-5 py-7 text-white sm:px-10 sm:py-10"><div className="ransom-briefing-grid pointer-events-none absolute inset-0" /><div className="pointer-events-none absolute -right-20 top-12 h-80 w-80 rounded-full border border-cyan-200/20" /><div className="pointer-events-none absolute -left-24 bottom-[-160px] h-96 w-96 rounded-full border-[38px] border-teal-300/10" /><div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] tracking-[.22em] text-cyan-100/70">RANSOMWARE ENTRY PATH · WEB ANIMATION</p><h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-5xl">常见伪装进入路径</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">从业务往来、伪装资料到诱导打开，了解攻击者常利用的信任链路。</p></div><button type="button" onClick={skipBriefing} className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white/85 transition hover:bg-white/20">跳过动画</button></div><div className="relative my-auto grid gap-4 py-10 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]"><div className={`ransom-briefing-node ${briefingStep >= 1 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#56b7be] text-white shadow-[0_14px_30px_rgba(18,115,127,.3)]"><Mail className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">业务往来</p><p className="mt-1 text-xs leading-5 text-white/60">伪造来源、相似地址或异常附件。</p></div><div className={`ransom-briefing-link ${briefingStep >= 2 ? "briefing-link-active" : ""}`}><span>→</span></div><div className={`ransom-briefing-node ${briefingStep >= 2 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e4b856] text-white shadow-[0_14px_30px_rgba(151,102,13,.25)]"><FileText className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">伪装资料</p><p className="mt-1 text-xs leading-5 text-white/60">名称相关，但来源和信息不一致。</p></div><div className={`ransom-briefing-link ${briefingStep >= 3 ? "briefing-link-active" : ""}`}><span>→</span></div><div className={`ransom-briefing-node ${briefingStep >= 3 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d56c5f] text-white shadow-[0_14px_30px_rgba(141,43,38,.28)]"><Search className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">诱导打开</p><p className="mt-1 text-xs leading-5 text-white/60">误信内容可能导致业务数据不可用。</p></div><div className={`ransom-briefing-link ${briefingStep >= 4 ? "briefing-link-active" : ""}`}><span>→</span></div><div className={`ransom-briefing-node ${briefingStep >= 4 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#b85254] text-white shadow-[0_14px_30px_rgba(122,29,32,.28)]"><LockKeyhole className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">影响识别</p><p className="mt-1 text-xs leading-5 text-white/60">业务中断与恢复成本可能随之上升。</p></div></div><div className="ransom-briefing-progress mt-auto h-px overflow-hidden bg-white/15"><span className="block h-full bg-gradient-to-r from-cyan-300 via-[#f1cb66] to-[#df7770]" style={{ width: `${Math.max(briefingStep, 1) * 25}%` }} /></div><p className="mt-4 text-right font-mono text-[10px] tracking-[.16em] text-white/45">NEXT · OPEN THE CONFIGURED DOCUMENT FOLDER</p></div></section>}

      {phase === "folder" && <div className="fixed inset-0 z-[145] grid place-items-center bg-[#14252f]/45 px-4 backdrop-blur-[2px]"><section className="w-full max-w-[760px] overflow-hidden rounded-xl border border-[#cbd9df] bg-[#f8fbfd] shadow-[0_28px_80px_rgba(8,25,35,.44)]"><header className="flex items-center justify-between border-b border-[#dbe6ec] bg-white px-5 py-3"><div className="flex min-w-0 items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-[#fff1bd] text-[#9b711f]"><FolderOpen className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-[#2d4655]">资料文件夹</p><p className="text-[10px] text-[#78909a]">仅显示配置中允许预览的资料</p></div></div><button type="button" onClick={() => setPhase("ready")} className="text-[#718492] transition hover:text-[#1f3e50]" aria-label="关闭资料文件夹"><X className="h-5 w-5" /></button></header><div className="grid gap-2 p-4 sm:grid-cols-2">{RANSOMWARE_DESKTOP_CONFIG.documents.map((document) => <button key={document.id} type="button" onClick={() => openDocument(document.id)} className="flex min-w-0 items-center gap-3 rounded-lg border border-transparent bg-white p-3 text-left shadow-sm transition hover:border-[#9fcde1] hover:bg-[#f2faff]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#e7f2ee] text-[#287968]"><FileText className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#294754]">{document.name}</span><span className="mt-0.5 block text-[10px] font-mono tracking-[.08em] text-[#78909a]">{document.label}</span></span></button>)}</div><footer className="border-t border-[#e1e9ed] bg-white px-5 py-3 text-xs text-[#718795]">此文件夹仅为网页内固定资料视图，不访问本机目录。</footer></section></div>}

      {phase === "preview" && activeDocument && <div className="fixed inset-0 z-[155] grid place-items-center bg-[#14252f]/50 px-4 backdrop-blur-[2px]"><section className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[#cbd9df] bg-white shadow-[0_28px_80px_rgba(8,25,35,.44)]"><header className="flex items-center justify-between border-b border-[#e1e8ec] bg-[#f8fafb] px-5 py-3"><div className="flex min-w-0 items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-[#e4f0ec] text-[#227b6d]"><FileText className="h-4 w-4" /></span><p className="truncate text-sm font-semibold text-[#2d4655]">{activeDocument.name}</p></div><button type="button" onClick={closePreview} className="text-[#718492] transition hover:text-[#1f3e50]" aria-label="关闭文档预览"><X className="h-5 w-5" /></button></header><div className="p-6 sm:p-8"><p className="font-mono text-[10px] tracking-[.14em] text-[#78919d]">DOCUMENT PREVIEW</p><h2 className="mt-3 font-serif text-2xl font-bold text-[#274657]">{activeDocument.previewTitle}</h2><div className="mt-6 space-y-3 border-y border-[#e4ecef] py-5 text-sm leading-7 text-[#59717e]">{activeDocument.previewLines.map((line) => <p key={line}>• {line}</p>)}</div><p className="mt-6 text-xs text-[#78909a]">已打开资料，正在返回体验中心…</p></div></section></div>}
    </div>
  );
}
