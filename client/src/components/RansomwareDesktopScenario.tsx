/**
 * 设计提醒：该组件以麒麟银河风格的办公桌面营造可信工作环境；所有文档、锁定与提示均为 React 状态，绝不触及真实文件。
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, LockKeyhole, Mail, MoreHorizontal, RotateCcw, Search, X } from "lucide-react";
import { RANSOMWARE_DESKTOP_CONFIG } from "@/config/ransomwareScenario";

type RansomwareDesktopScenarioProps = {
  onLeave: () => void;
  onReset: () => void;
  onStageAudio: (step: number) => void;
  voiceEnabled: boolean;
};

export function RansomwareDesktopScenario({ onLeave, onReset, onStageAudio, voiceEnabled }: RansomwareDesktopScenarioProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [ransomVisible, setRansomVisible] = useState(false);
  const hasPlayedEntryNarration = useRef(false);
  const activeDocument = RANSOMWARE_DESKTOP_CONFIG.documents.find((document) => document.id === activeDocumentId) ?? null;

  useEffect(() => {
    if (voiceEnabled && !hasPlayedEntryNarration.current) {
      hasPlayedEntryNarration.current = true;
      onStageAudio(0);
    }
  }, [onStageAudio, voiceEnabled]);

  const openDocument = (documentId: string) => {
    if (locked) {
      setRansomVisible(true);
      if (voiceEnabled) onStageAudio(3);
      return;
    }
    setActiveDocumentId(documentId);
    if (voiceEnabled) onStageAudio(1);
  };

  const triggerLock = () => {
    setActiveDocumentId(null);
    setLocked(true);
    setRansomVisible(true);
    if (voiceEnabled) onStageAudio(2);
  };

  return (
    <div className="relative z-10 min-h-screen overflow-hidden bg-[#dde5e8] text-[#172a35]">
      <header className="flex h-10 items-center justify-between border-b border-white/10 bg-[#17334d]/92 px-3 text-white shadow-[0_2px_10px_rgba(5,23,38,.24)] backdrop-blur sm:px-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onLeave} className="grid h-7 w-7 place-items-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="返回体验中心"><ArrowLeft className="h-4 w-4" /></button>
          <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-[linear-gradient(145deg,#217c8c,#264b79)] shadow-inner"><span className="h-3 w-3 rounded-full border-2 border-white/80" /></span>
          <div><p className="text-xs font-semibold tracking-wide">{RANSOMWARE_DESKTOP_CONFIG.systemName}</p><p className="text-[9px] tracking-[.14em] text-white/45">DESKTOP EXPERIENCE</p></div>
        </div>
        <div className="hidden items-center gap-3 text-[10px] text-white/70 sm:flex"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#63d6bb]" />网络已连接</span><span className="h-3 border-l border-white/15" /><span>{RANSOMWARE_DESKTOP_CONFIG.userName}</span><span>09:42</span><span className="h-2 w-3 rounded-sm border border-white/50" /></div>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-white/18"><RotateCcw className="h-3.5 w-3.5" />一键重置</button>
      </header>

      <main className="relative min-h-[calc(100vh-40px)] overflow-hidden bg-[radial-gradient(ellipse_at_76%_14%,rgba(124,217,246,.58),transparent_21%),radial-gradient(circle_at_16%_76%,rgba(67,154,215,.38),transparent_31%),linear-gradient(136deg,#0f5b9d_0%,#187ebc_44%,#155896_100%)] px-5 pb-16 pt-5 sm:px-8 sm:pb-16 sm:pt-6">
        <div className="pointer-events-none absolute -right-28 top-16 h-[520px] w-[770px] rounded-[50%] border-[44px] border-white/10 blur-[.2px]" />
        <div className="pointer-events-none absolute -right-20 top-[118px] h-[430px] w-[680px] rounded-[50%] border border-white/20" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:34px_34px]" />
        <aside className="relative z-10 hidden w-20 space-y-5 text-center text-white/90 sm:block"><div className="flex flex-col items-center gap-1"><span className="grid h-10 w-10 place-items-center rounded-lg border border-white/40 bg-white/12 shadow-[0_6px_12px_rgba(5,24,54,.2)]"><FileText className="h-5 w-5" /></span><span className="text-[10px] drop-shadow">我的文档</span></div><div className="flex flex-col items-center gap-1"><span className="grid h-10 w-10 place-items-center rounded-lg border border-white/40 bg-white/12 shadow-[0_6px_12px_rgba(5,24,54,.2)]"><Mail className="h-5 w-5" /></span><span className="text-[10px] drop-shadow">邮件</span></div></aside>
        <div className="relative z-10 mt-[-108px] max-w-[1320px] sm:mt-[-106px] sm:pl-28">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-white"><div><p className="text-[10px] font-medium tracking-[.2em] text-white/72">业务文件桌面</p><h1 className="mt-1 font-serif text-2xl font-bold tracking-tight sm:text-3xl">工作资料</h1></div><div className={`rounded-full border px-3 py-1.5 text-[10px] font-mono tracking-[.1em] ${locked ? "border-[#ffb0a8]/60 bg-[#802f32]/65 text-[#ffe5e0]" : "border-white/35 bg-white/12 text-white/85"}`}>{locked ? "文件状态：已锁定" : "文件状态：可正常访问"}</div></div>
          <section className="grid max-w-[770px] grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-7 lg:grid-cols-4">
            {RANSOMWARE_DESKTOP_CONFIG.documents.map((document) => <button key={document.id} type="button" onClick={() => openDocument(document.id)} className={`group relative flex min-h-[118px] flex-col items-center rounded-xl p-3 text-center transition ${locked ? "desktop-alert bg-[#532f38]/30 hover:bg-[#65383f]/45" : "hover:bg-white/12"}`}><span className={`grid h-14 w-14 place-items-center rounded-[15px] border shadow-[0_10px_20px_rgba(5,20,29,.18)] ${locked ? "border-[#e6a8a1]/45 bg-[#74464b] text-[#ffe9e6]" : document.trigger ? "border-[#f1c977] bg-[#fff5d3] text-[#bd7a1c]" : "border-white/60 bg-[#f4faf7] text-[#278572]"}`}>{locked ? <LockKeyhole className="h-6 w-6" /> : <FileText className="h-6 w-6" />}</span><span className="mt-2 line-clamp-2 max-w-[112px] text-[12px] font-medium leading-4 text-white drop-shadow">{locked ? `${document.name}.locked` : document.name}</span><span className={`mt-1 rounded px-1.5 py-0.5 text-[8px] font-mono tracking-[.08em] ${locked ? "bg-white/12 text-white/70" : document.trigger ? "bg-[#f7d98f] text-[#7d5714]" : "bg-white/16 text-white/75"}`}>{locked ? "LOCKED" : document.trigger ? "新收到" : document.label}</span></button>)}
          </section>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-11 items-center justify-between border-t border-white/20 bg-[#0e2d51]/78 px-3 text-white shadow-[0_-5px_18px_rgba(4,23,47,.2)] backdrop-blur"><div className="flex items-center gap-1.5"><span className="inline-flex h-8 items-center gap-2 rounded-md bg-[#e9f3fa] px-2.5 text-[11px] font-semibold text-[#1d5f98] shadow-sm"><span className="h-3 w-3 rounded-full border-[3px] border-[#1b87c7]" />开始</span><span className="grid h-7 w-7 place-items-center rounded-md bg-[#2a79b5] text-white"><FileText className="h-4 w-4" /></span><span className="grid h-7 w-7 place-items-center rounded-md bg-[#da9b3b] text-white"><Mail className="h-4 w-4" /></span><span className="hidden h-7 w-24 rounded-md border border-white/15 bg-white/10 sm:block" /></div><div className="flex items-center gap-3 text-[10px] text-white/75"><span className="hidden sm:inline">输入法</span><span>网络</span><span>音量</span><span>09:42</span></div></div>
      </main>

      {!locked && activeDocument && <div className="fixed inset-0 z-[155] grid place-items-center bg-[#14252f]/50 px-4 backdrop-blur-[2px]"><section className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[#cbd9df] bg-white shadow-[0_28px_80px_rgba(8,25,35,.44)]"><header className="flex items-center justify-between border-b border-[#e1e8ec] bg-[#f8fafb] px-5 py-3"><div className="flex min-w-0 items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-[#e4f0ec] text-[#227b6d]"><FileText className="h-4 w-4" /></span><p className="truncate text-sm font-semibold text-[#2d4655]">{activeDocument.name}</p></div><button type="button" onClick={() => setActiveDocumentId(null)} className="text-[#718492] transition hover:text-[#1f3e50]" aria-label="关闭文档预览"><X className="h-5 w-5" /></button></header><div className="p-6 sm:p-8"><p className="font-mono text-[10px] tracking-[.14em] text-[#78919d]">DOCUMENT PREVIEW</p><h2 className="mt-3 font-serif text-2xl font-bold text-[#274657]">{activeDocument.previewTitle}</h2><div className="mt-6 space-y-3 border-y border-[#e4ecef] py-5 text-sm leading-7 text-[#59717e]">{activeDocument.previewLines.map((line) => <p key={line}>• {line}</p>)}</div>{activeDocument.trigger ? <div className="mt-6 rounded-lg border border-[#ead29a] bg-[#fffaf0] p-4"><p className="text-sm font-semibold text-[#76531b]">该资料需要继续打开才能查看完整内容。</p><p className="mt-1 text-xs leading-5 text-[#94774b]">此操作仅改变本网页中的预置桌面状态。</p><button type="button" onClick={triggerLock} className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#b77b22] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#966018] active:scale-[.98]"><FileText className="h-4 w-4" />打开资料</button></div> : <p className="mt-6 text-xs text-[#78909a]">文档内容已在此页面内预览。</p>}</div></section></div>}

      {locked && ransomVisible && <div className="fixed inset-0 z-[165] grid place-items-center bg-[#100e14]/72 px-4 backdrop-blur-[3px]"><section className="w-full max-w-[660px] overflow-hidden border border-[#bb6764]/70 bg-[#21191f] shadow-[0_28px_90px_rgba(0,0,0,.56)]"><header className="flex items-center justify-between border-b border-white/10 bg-[#3b2027] px-5 py-4 text-[#ffe9e7]"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#b64d4a] text-white"><LockKeyhole className="h-4 w-4" /></span><div><p className="text-sm font-semibold">文件访问提示</p><p className="mt-0.5 font-mono text-[9px] tracking-[.14em] text-white/45">DESKTOP FILE NOTICE</p></div></div><button type="button" onClick={() => setRansomVisible(false)} className="text-white/60 transition hover:text-white" aria-label="关闭提示"><X className="h-5 w-5" /></button></header><div className="p-6 sm:p-8"><p className="font-serif text-[26px] font-bold text-white sm:text-3xl">文档当前无法访问</p><p className="mt-4 max-w-xl text-sm leading-7 text-white/70">桌面文件已进入锁定状态。本页面仅展示预置的浏览器内事件效果；真实事件发生时，不应反复尝试打开文件或自行处理。</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="border border-white/10 bg-white/[.04] p-3"><p className="font-mono text-[9px] tracking-[.12em] text-[#f2aaa2]">FIRST</p><p className="mt-2 text-xs leading-5 text-white/80">停止继续操作并断开网络连接。</p></div><div className="border border-white/10 bg-white/[.04] p-3"><p className="font-mono text-[9px] tracking-[.12em] text-[#f2aaa2]">THEN</p><p className="mt-2 text-xs leading-5 text-white/80">及时报告安全团队，保留现场信息。</p></div><div className="border border-white/10 bg-white/[.04] p-3"><p className="font-mono text-[9px] tracking-[.12em] text-[#f2aaa2]">RECOVER</p><p className="mt-2 text-xs leading-5 text-white/80">依预案从离线备份恢复并复盘。</p></div></div></div><footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-6 py-4"><p className="text-xs text-white/50">页面内虚拟事件效果</p><button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-md bg-[#d5eade] px-4 py-2.5 text-sm font-semibold text-[#1b554b] transition hover:bg-white active:scale-[.98]"><RotateCcw className="h-4 w-4" />重新体验</button></footer></section></div>}
    </div>
  );
}
