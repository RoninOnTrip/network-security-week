/**
 * 设计提醒：此场景以路径动画和网页内操作引导组织节奏。
 * 所有资源与状态均限于浏览器；不会下载、打开、运行或修改真实程序、设备或文件。
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, LockKeyhole, Mail, MonitorDown, RotateCcw, Search } from "lucide-react";

type RansomwareDesktopScenarioProps = {
  onLeave: () => void;
  onReset: () => void;
  onStageAudio: (step: number, onComplete?: () => void) => void;
  voiceEnabled: boolean;
};

type RansomwarePhase = "briefing" | "ready" | "desktopPrompt";

export function RansomwareDesktopScenario({ onLeave, onReset, onStageAudio, voiceEnabled }: RansomwareDesktopScenarioProps) {
  const [phase, setPhase] = useState<RansomwarePhase>("briefing");
  const [briefingStep, setBriefingStep] = useState(0);
  const hasPlayedEntryNarration = useRef(false);
  const hasPlayedStartPrompt = useRef(false);
  const hasTransitionedToReady = useRef(false);

  const transitionToReady = () => {
    if (hasTransitionedToReady.current) return;
    hasTransitionedToReady.current = true;
    setPhase("ready");
  };

  useEffect(() => {
    if (voiceEnabled && !hasPlayedEntryNarration.current) {
      hasPlayedEntryNarration.current = true;
      onStageAudio(0, transitionToReady);
      return undefined;
    }
    if (!voiceEnabled && phase === "briefing") {
      const fallbackTimer = window.setTimeout(transitionToReady, 26400);
      return () => window.clearTimeout(fallbackTimer);
    }
    return undefined;
  }, [onStageAudio, phase, voiceEnabled]);

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
    ];
    return () => steps.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const beginDesktopExercise = () => {
    setPhase("desktopPrompt");
    if (voiceEnabled) onStageAudio(2);
  };

  return (
    <div className="relative z-10 min-h-screen overflow-hidden bg-[#102b47] text-white">
      <header className="flex h-10 items-center justify-between border-b border-white/10 bg-[#17334d]/92 px-3 text-white shadow-[0_2px_10px_rgba(5,23,38,.24)] backdrop-blur sm:px-5">
        <button type="button" onClick={onLeave} className="grid h-7 w-7 place-items-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="返回体验中心"><ArrowLeft className="h-4 w-4" /></button>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-white/18"><RotateCcw className="h-3.5 w-3.5" />一键重置</button>
      </header>

      <main className="relative min-h-[calc(100vh-40px)] overflow-hidden bg-[radial-gradient(ellipse_at_76%_14%,rgba(124,217,246,.34),transparent_21%),radial-gradient(circle_at_16%_76%,rgba(67,154,215,.24),transparent_31%),linear-gradient(136deg,#0e3156_0%,#15578a_48%,#102b47_100%)] px-5 py-7 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-28 top-16 h-[520px] w-[770px] rounded-[50%] border-[44px] border-white/10" />
        <div className="pointer-events-none absolute -left-28 bottom-[-160px] h-96 w-96 rounded-full border-[38px] border-teal-300/10" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:34px_34px]" />

        {phase === "ready" && <section className="relative z-10 grid min-h-[calc(100vh-150px)] place-items-center"><button type="button" onClick={beginDesktopExercise} className="inline-flex min-w-36 items-center justify-center rounded-lg bg-[#e6c35b] px-7 py-3.5 text-base font-semibold text-[#19314a] shadow-[0_10px_24px_rgba(8,19,35,.25)] transition hover:bg-[#f5d47a] active:scale-[.98]">开始演示</button></section>}

        {phase === "desktopPrompt" && <section className="ransom-desktop-return relative z-20 grid min-h-[calc(100vh-150px)] place-items-center" aria-live="polite"><div className="ransom-desktop-return-aura pointer-events-none absolute inset-0" /><div className="ransom-desktop-return-scan pointer-events-none absolute inset-x-0 top-0 h-1/2" /><div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-100/25 bg-[#09233c]/90 p-7 text-center shadow-[0_28px_90px_rgba(2,11,25,.55)] backdrop-blur sm:p-11"><div className="ransom-desktop-return-icon mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-cyan-100/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_50px_rgba(82,214,242,.28)]"><MonitorDown className="h-10 w-10" /></div><p className="mt-8 font-mono text-[11px] tracking-[.22em] text-cyan-100/65">DESKTOP EXERCISE · STEP 01</p><h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl">请最小化浏览器</h1><p className="mx-auto mt-5 max-w-xl text-base leading-8 text-cyan-50/85 sm:text-lg">回到桌面，并打开任意文档。</p><div className="ransom-desktop-return-progress mt-8 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-[#e6c35b]" /></div><p className="mt-5 text-sm text-cyan-100/60">完成桌面演示后，请返回此页面继续培训。</p><button type="button" onClick={onLeave} className="mt-8 inline-flex items-center justify-center rounded-lg border border-cyan-100/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/18">我已完成桌面演示</button></div></section>}

        {phase === "briefing" && <section className="ransom-briefing absolute inset-0 z-10 overflow-hidden px-5 py-7 text-white sm:px-10 sm:py-10"><div className="ransom-briefing-grid pointer-events-none absolute inset-0" /><div className="pointer-events-none absolute -right-20 top-12 h-80 w-80 rounded-full border border-cyan-200/20" /><div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] tracking-[.22em] text-cyan-100/70">RANSOMWARE ENTRY PATH · WEB ANIMATION</p><h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-5xl">常见伪装进入路径</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">从业务往来、伪装资料到诱导打开，了解攻击者常利用的信任链路。</p></div><button type="button" onClick={() => setPhase("ready")} className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white/85 transition hover:bg-white/20">跳过动画</button></div><div className="relative my-auto grid gap-4 py-10 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]"><div className={`ransom-briefing-node ${briefingStep >= 1 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#56b7be] text-white shadow-[0_14px_30px_rgba(18,115,127,.3)]"><Mail className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">业务往来</p><p className="mt-1 text-xs leading-5 text-white/60">伪造来源、相似地址或异常附件。</p></div><div className={`ransom-briefing-link ${briefingStep >= 2 ? "briefing-link-active" : ""}`}><span>→</span></div><div className={`ransom-briefing-node ${briefingStep >= 2 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e4b856] text-white shadow-[0_14px_30px_rgba(151,102,13,.25)]"><FileText className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">伪装资料</p><p className="mt-1 text-xs leading-5 text-white/60">名称相关，但来源和信息不一致。</p></div><div className={`ransom-briefing-link ${briefingStep >= 3 ? "briefing-link-active" : ""}`}><span>→</span></div><div className={`ransom-briefing-node ${briefingStep >= 3 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d56c5f] text-white shadow-[0_14px_30px_rgba(141,43,38,.28)]"><Search className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">诱导打开</p><p className="mt-1 text-xs leading-5 text-white/60">误信内容可能导致业务数据不可用。</p></div><div className={`ransom-briefing-link ${briefingStep >= 4 ? "briefing-link-active" : ""}`}><span>→</span></div><div className={`ransom-briefing-node ${briefingStep >= 4 ? "briefing-step-active" : ""}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#b85254] text-white shadow-[0_14px_30px_rgba(122,29,32,.28)]"><LockKeyhole className="h-7 w-7" /></span><p className="mt-4 text-sm font-semibold">影响识别</p><p className="mt-1 text-xs leading-5 text-white/60">业务中断与恢复成本可能随之上升。</p></div></div><div className="ransom-briefing-progress mt-auto h-px overflow-hidden bg-white/15"><span className="block h-full bg-gradient-to-r from-cyan-300 via-[#f1cb66] to-[#df7770]" style={{ width: `${Math.max(briefingStep, 1) * 25}%` }} /></div></div></section>}
      </main>
    </div>
  );
}
