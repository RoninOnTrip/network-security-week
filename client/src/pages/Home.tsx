/**
 * 设计提醒：行动指挥室——以深海军蓝、暖白与克制警示色组织可读、可复盘的安全推演；
 * 真实感来自信息细节，不来自真实恶意行为或真实品牌仿冒。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { MailDesktopHeader, MailDesktopSidebar } from "@/components/ConfigurableMailWorkbench";
import { RansomwareDesktopScenario } from "@/components/RansomwareDesktopScenario";
import { HIGH_RISK_TRAINING_ASSET, isAllowedTrainingFile } from "@/config/highRiskTrainingAssets";
import { NARRATION_CONFIG } from "@/config/narration";
import { MAIL_SCENARIO_CONFIG } from "@/config/mailScenario";
import { RANSOMWARE_DESKTOP_CONFIG } from "@/config/ransomwareScenario";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileSearch,
  FileText,
  Headphones,
  House,
  Inbox,
  LockKeyhole,
  Mail,
  MoreHorizontal,
  Network,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";

type SceneKey = "download" | "mail" | "ransomware";
type View = "home" | SceneKey;

const sceneCards: Array<{
  key: SceneKey;
  index: string;
  title: string;
  short: string;
  description: string;
  duration: string;
  accent: string;
  icon: typeof Download;
}> = [
  {
    key: "download",
    index: "01",
    title: "日常高风险操作",
    short: "高风险操作演示",
    description: "在多个看似合理的来源中，辨识推广位、异常权限和来源证据。",
    duration: "约 5 分钟",
    accent: "teal",
    icon: Download,
  },
  {
    key: "mail",
    index: "02",
    title: "钓鱼邮件",
    short: "钓鱼邮件演示",
    description: "检查发件人、业务语气、附件与业务确认路径，练习主动上报。",
    duration: "约 6 分钟",
    accent: "amber",
    icon: Mail,
  },
  {
    key: "ransomware",
    index: "03",
    title: "勒索病毒",
    short: "勒索病毒演示",
    description: "在虚拟业务桌面中观察异常，完成隔离、报告和恢复的关键顺序。",
    duration: "约 8 分钟",
    accent: "red",
    icon: LockKeyhole,
  },
];

const stepNames: Record<SceneKey, string[]> = {
  download: ["观察来源", "仿真下载", "风险处置", "复盘"],
  mail: ["邮件详情"],
  ransomware: ["业务资料", "异常出现", "隔离响应", "复盘"],
};

function downloadSafeTrainingFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** 仅下载配置中明确映射的非可执行教学资料，不读取本机目录。 */
function downloadMappedTrainingAsset(assetUrl: string, downloadName: string) {
  const allowedFile = isAllowedTrainingFile(downloadName);
  if (!assetUrl.startsWith("/manus-storage/") || !allowedFile) return;
  void fetch(assetUrl)
    .then((response) => (response.ok ? response.blob() : Promise.reject(new Error("附件无法获取"))))
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    })
    .catch(() => undefined);
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [step, setStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [manualSpeech, setManualSpeech] = useState(false);
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const [welcomeAudioPending, setWelcomeAudioPending] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const homeWelcomeTimerRef = useRef<number | null>(null);
  const narrationFollowUpTimerRef = useRef<number | null>(null);

  const activeScene = view === "home" ? null : sceneCards.find((scene) => scene.key === view) ?? sceneCards[0];
  const narration = activeScene ? NARRATION_CONFIG[activeScene.key].backupText[step] ?? "" : "";
  const steps = activeScene ? stepNames[activeScene.key] : [];

  const clearNarrationFollowUp = () => {
    if (narrationFollowUpTimerRef.current !== null) {
      window.clearTimeout(narrationFollowUpTimerRef.current);
      narrationFollowUpTimerRef.current = null;
    }
  };

  const stopNarration = () => {
    clearNarrationFollowUp();
    window.speechSynthesis?.cancel();
    setActiveSubtitle(null);
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const speak = (text: string, onComplete?: () => void) => {
    if (!("speechSynthesis" in window) || !text) {
      onComplete?.();
      return;
    }
    stopNarration();
    setActiveSubtitle(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.93;
    utterance.pitch = 1;
    utterance.onend = () => {
      setActiveSubtitle(null);
      onComplete?.();
    };
    utterance.onerror = () => {
      setActiveSubtitle(null);
      onComplete?.();
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const playSceneAudio = (key: SceneKey, audioStep = 0, onComplete?: () => void) => {
    const audio = audioRef.current;
    setWelcomeAudioPending(false);
    stopNarration();
    const subtitle = NARRATION_CONFIG[key].backupText[audioStep] ?? NARRATION_CONFIG[key].backupText[0];
    const source = NARRATION_CONFIG[key].audioSrc[audioStep] ?? NARRATION_CONFIG[key].audioSrc[0];
    if (!source) {
      speak(subtitle, onComplete);
      return;
    }
    if (!audio) {
      onComplete?.();
      return;
    }
    setActiveSubtitle(subtitle);
    audio.src = source;
    audio.onended = () => {
      audio.onended = null;
      audio.onerror = null;
      setActiveSubtitle(null);
      onComplete?.();
    };
    audio.onerror = () => {
      audio.onended = null;
      audio.onerror = null;
      setActiveSubtitle(null);
      onComplete?.();
    };
    audio.play().catch(() => {
      audio.onended = null;
      audio.onerror = null;
      setActiveSubtitle(null);
      onComplete?.();
    });
  };

  const playSceneAudioAfterCurrent = (key: SceneKey, audioStep: number, delayMs = 3000) => {
    const audio = audioRef.current;
    const scheduleNext = () => {
      clearNarrationFollowUp();
      narrationFollowUpTimerRef.current = window.setTimeout(() => {
        narrationFollowUpTimerRef.current = null;
        playSceneAudio(key, audioStep);
      }, delayMs);
    };
    if (!audio || !audio.src || audio.ended) {
      scheduleNext();
      return;
    }
    audio.onended = () => {
      audio.onended = null;
      setActiveSubtitle(null);
      scheduleNext();
    };
  };

  const playHomeWelcome = (fromUserAction = false) => {
    stopNarration();
    const source = NARRATION_CONFIG.home.audioSrc;
    if (!source) {
      speak(NARRATION_CONFIG.home.backupText);
      setWelcomeAudioPending(false);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    setActiveSubtitle(NARRATION_CONFIG.home.backupText);
    audio.src = source;
    audio.onended = () => {
      audio.onended = null;
      audio.onerror = null;
      setActiveSubtitle(null);
    };
    audio.onerror = () => {
      audio.onended = null;
      audio.onerror = null;
      setActiveSubtitle(null);
    };
    void audio.play().then(() => {
      setWelcomeAudioPending(false);
    }).catch(() => {
      setActiveSubtitle(null);
      // 多数浏览器会拦截没有用户手势的有声自动播放；保留一个用户可见的手动开启入口。
      if (!fromUserAction) setWelcomeAudioPending(true);
    });
  };

  useEffect(() => {
    // 日常高风险操作由 TrainingSoftwarePortal 在首次挂载时单独触发步骤 0，
    // 避免此处的通用自动讲解与其重复播放同一段内容。
    if (voiceEnabled && activeScene && activeScene.key !== "download" && activeScene.key !== "ransomware" && narration) {
      const timer = window.setTimeout(() => {
        playSceneAudio(activeScene.key, step);
      }, 160);
      return () => { window.clearTimeout(timer); stopNarration(); };
    }
    return undefined;
  }, [view, step, voiceEnabled]);

  useEffect(() => {
    return () => stopNarration();
  }, []);

  useEffect(() => {
    if (!voiceEnabled) {
      stopNarration();
    }
  }, [voiceEnabled]);

  useEffect(() => {
    if (view !== "home" || !voiceEnabled) return;
    homeWelcomeTimerRef.current = window.setTimeout(() => {
      homeWelcomeTimerRef.current = null;
      playHomeWelcome(false);
    }, 1200);
    return () => {
      if (homeWelcomeTimerRef.current !== null) {
        window.clearTimeout(homeWelcomeTimerRef.current);
        homeWelcomeTimerRef.current = null;
      }
    };
  }, [view, voiceEnabled]);

  const openScene = (key: SceneKey) => {
    setWelcomeAudioPending(false);
    setStep(0);
    setView(key);
  };

  const resetScene = () => {
    stopNarration();
    setStep(0);
    setManualSpeech(false);
    setSceneResetKey((key) => key + 1);
  };

  const leaveScene = () => {
    stopNarration();
    setView("home");
    setStep(0);
    setManualSpeech(false);
  };

  const toggleVoice = () => {
    const nextVoiceEnabled = !voiceEnabled;
    setVoiceEnabled(nextVoiceEnabled);
    if (nextVoiceEnabled && view === "home") {
      playHomeWelcome(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f0] text-[#152c3a]">
      <div className="app-grain pointer-events-none fixed inset-0 z-0" />
      {view === "home" && <div className="home-ambient" aria-hidden="true"><span className="home-grid" /><span className="home-orbit home-orbit-a" /><span className="home-orbit home-orbit-b" /><span className="home-orbit home-orbit-c" /><span className="home-stream home-stream-a" /><span className="home-stream home-stream-b" /><span className="home-stream home-stream-c" /><span className="home-scan home-scan-a" /><span className="home-scan home-scan-b" /><span className="home-node home-node-a" /><span className="home-node home-node-b" /><span className="home-node home-node-c" /></div>}
      <audio ref={audioRef} preload="auto" />
      {activeSubtitle && <div className="pointer-events-none fixed bottom-5 right-[4.25rem] z-[219] w-[min(74vw,31rem)] sm:bottom-7 sm:right-[5rem]" role="status" aria-live="polite"><div className="border border-[#9eb9c7]/70 bg-[#123f5b]/94 px-3 py-2.5 text-right shadow-[0_12px_28px_rgba(18,63,91,.22)] backdrop-blur-md sm:px-4"><p className="font-mono text-[9px] tracking-[.14em] text-[#a9d7d1]">语音讲解</p><p className="mt-1 text-xs leading-5 text-white sm:text-sm">{activeSubtitle}</p></div></div>}
      <div className="fixed bottom-5 right-5 z-[220] flex flex-col gap-2 sm:bottom-7 sm:right-7">
        <button type="button" onClick={leaveScene} className="grid h-11 w-11 place-items-center rounded-full border border-[#c9d8d4] bg-white/95 text-[#17495b] shadow-[0_12px_28px_rgba(18,63,91,.16)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#6a9b91] hover:bg-[#eff8f5] active:scale-[.96]" aria-label="返回主页面" title="返回主页面"><House className="h-4.5 w-4.5" /></button>
        <button type="button" onClick={toggleVoice} className={`grid h-11 w-11 place-items-center rounded-full border shadow-[0_12px_28px_rgba(18,63,91,.16)] backdrop-blur transition hover:-translate-y-0.5 active:scale-[.96] ${voiceEnabled ? "border-[#c9d8d4] bg-white/95 text-[#17495b] hover:border-[#6a9b91] hover:bg-[#eff8f5]" : "border-[#ead3d0] bg-[#fff8f6]/95 text-[#a24f48] hover:border-[#d88a83]"}`} aria-label={voiceEnabled ? "关闭音频" : "开启音频"} title={voiceEnabled ? "关闭音频" : "开启音频"}>{voiceEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}</button>
      </div>
      {view === "home" ? (
        <HomeScreen openScene={openScene} welcomeAudioPending={welcomeAudioPending} playHomeWelcome={() => playHomeWelcome(true)} />
      ) : view === "download" ? (
        <TrainingSoftwarePortal key={sceneResetKey} onLeave={leaveScene} onStageAudio={(audioStep) => playSceneAudio("download", audioStep)} onAudioAfterCurrent={(audioStep) => playSceneAudioAfterCurrent("download", audioStep)} />
      ) : view === "mail" ? (
        <MailScenario key={sceneResetKey} onLeave={leaveScene} onReset={resetScene} onAudioAfterCurrent={(audioStep) => playSceneAudioAfterCurrent("mail", audioStep)} />
      ) : view === "ransomware" ? (
        <RansomwareDesktopScenario key={sceneResetKey} onLeave={leaveScene} onReset={resetScene} onStageAudio={(audioStep, onComplete) => playSceneAudio("ransomware", audioStep, onComplete)} voiceEnabled={voiceEnabled} />
      ) : (
        <SceneShell
          key={sceneResetKey}
          scene={activeScene!}
          step={step}
          steps={steps}
          narration={narration}
          voiceEnabled={voiceEnabled}
          manualSpeech={manualSpeech}
          setManualSpeech={setManualSpeech}
          speak={speak}
          playSceneAudio={playSceneAudio}
          setVoiceEnabled={setVoiceEnabled}
          setStep={setStep}
          leaveScene={leaveScene}
          resetScene={resetScene}
        />
      )}
    </main>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-[15px] bg-[#123f5b] shadow-[0_10px_24px_rgba(18,63,91,0.2)]">
        <img src="/manus-storage/safety-week-mark_80032d93.png" alt="安全周推演台标志" className="h-10 w-10 object-contain" />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#456574]">SECURITY WEEK</p>
          <p className="mt-1 font-serif text-[19px] font-bold tracking-wide text-[#123f5b]">安全周·推演台</p>
        </div>
      )}
    </div>
  );
}

function VoiceToggle({ voiceEnabled, setVoiceEnabled }: { voiceEnabled: boolean; setVoiceEnabled: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setVoiceEnabled(!voiceEnabled)}
      className="inline-flex items-center gap-2 rounded-full border border-[#d4deda] bg-white/80 px-3.5 py-2 font-sans text-xs font-semibold text-[#315362] transition-all hover:-translate-y-0.5 hover:border-[#77a598] hover:shadow-sm active:scale-[0.97]"
      aria-pressed={voiceEnabled}
    >
      {voiceEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#1d8375]" /> : <VolumeX className="h-3.5 w-3.5 text-[#a15b48]" />}
      {voiceEnabled ? "语音讲解已开启" : "语音讲解已静音"}
    </button>
  );
}

function LegacyHomeScreen({ openScene }: { openScene: (key: SceneKey) => void }) {
  const missionMeta: Record<SceneKey, { status: string; riskCue: string; expectedAction: string; actionLabel: string; tone: string }> = {
    download: { status: "待核验", riskCue: "来源与安装包信息不一致", expectedAction: "核验来源", actionLabel: "开始来源核验", tone: "text-[#1d8375] border-[#a5d4c7] bg-[#eef8f4]" },
    mail: { status: "待研判", riskCue: "紧急催办与回复路径异常", expectedAction: "检查线索", actionLabel: "开始邮件核验", tone: "text-[#a26f24] border-[#ead39c] bg-[#fff9ea]" },
    ransomware: { status: "待处置", riskCue: "异常文件访问与扩散路径", expectedAction: "启动隔离", actionLabel: "启动隔离推演", tone: "text-[#b7463d] border-[#e7b8b1] bg-[#fff4f2]" },
  };

  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8 lg:py-7">
      <header className="flex items-center justify-between gap-4 border-b border-[#cbd9d4] pb-4 lg:pb-5">
        <BrandMark />
        <div className="flex items-center gap-3"><span className="hidden font-mono text-[10px] tracking-[0.18em] text-[#6f8589] sm:inline">NETWORK SECURITY WEEK · 2026</span><span className="inline-flex items-center gap-2 border border-[#a7d2c6] bg-[#edf8f4] px-2.5 py-1.5 font-mono text-[9px] tracking-[.12em] text-[#1d8375]"><span className="h-1.5 w-1.5 rounded-full bg-[#1d8375]" />训练台在线</span></div>
      </header>

      <div className="grid gap-5 py-6 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-7 lg:py-7">
        <aside className="command-rail border border-[#cbd9d4] bg-[#f8faf7] p-4 shadow-[0_12px_28px_rgba(18,63,91,.05)] lg:min-h-[640px]">
          <div className="border-b border-[#dce6e1] pb-4"><p className="font-mono text-[9px] font-semibold tracking-[.18em] text-[#66858a]">EXERCISE TRAJECTORY</p><p className="mt-2 font-serif text-xl font-bold text-[#123f5b]">任务轨迹</p></div>
          <div className="relative mt-6 space-y-0">{sceneCards.map((scene, index) => { const meta = missionMeta[scene.key]; return <div key={scene.key} className="relative flex gap-3 pb-6 last:pb-0"><span className="absolute left-[9px] top-5 h-[calc(100%-4px)] w-px bg-[#cbd9d4]" /><span className={`relative z-10 grid h-[20px] w-[20px] shrink-0 place-items-center border font-mono text-[9px] ${meta.tone}`}>{scene.index}</span><div className="-mt-0.5 min-w-0"><p className="font-sans text-xs font-bold text-[#254b5b]">{scene.title}</p><p className="mt-1 font-mono text-[9px] tracking-[.1em] text-[#71888c]">TASK {String(index + 1).padStart(2, "0")} · {meta.status}</p></div></div>; })}</div>
          <div className="mt-8 border-y border-[#dce6e1] py-4"><p className="font-mono text-[9px] tracking-[.14em] text-[#66858a]">CURRENT PROTOCOL</p><p className="mt-2 font-sans text-sm font-bold text-[#284c5b]">识别 → 止损 → 上报 → 恢复</p><p className="mt-2 font-sans text-xs leading-5 text-[#74898d]">选择任务后，沿指挥轨迹完成一次受指导的桌面推演。</p></div>
          <div className="mt-7 flex items-center gap-2 font-mono text-[9px] tracking-[.13em] text-[#55777b]"><span className="h-px w-6 bg-[#123f5b]" /><span>COORD. 31.230 · 121.473</span></div>
        </aside>

        <section className="min-w-0">
          <div className="relative overflow-hidden border border-[#123f5b] bg-[#123f5b] p-5 text-white shadow-[0_20px_45px_rgba(18,63,91,.15)] sm:p-7">
            <div className="absolute inset-0 opacity-[.12] [background-image:linear-gradient(rgba(216,245,236,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(216,245,236,.7)_1px,transparent_1px)] [background-size:26px_26px]" />
            <svg className="absolute bottom-0 right-0 h-full w-[46%] opacity-55" viewBox="0 0 380 210" fill="none" aria-hidden="true"><path d="M18 172C104 172 91 48 183 48C253 48 245 127 365 127" stroke="#9FE4D0" strokeWidth="1.5" strokeDasharray="6 7" /><circle cx="183" cy="48" r="7" fill="#9FE4D0" /><circle cx="365" cy="127" r="5" fill="#E8B05F" /><path d="M183 48L183 0M365 127L380 127" stroke="#9FE4D0" strokeWidth="1" /></svg>
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end"><div><div className="inline-flex items-center gap-2 border border-white/25 bg-white/10 px-2.5 py-1.5 font-mono text-[9px] tracking-[.14em] text-[#b7e7da]"><span className="h-1.5 w-1.5 rounded-full bg-[#8cdbc9]" />COMMAND CONSOLE · READY</div><h1 className="mt-5 max-w-2xl font-serif text-[38px] font-black leading-[1.08] tracking-[-.045em] sm:text-[54px]">开始本轮安全推演</h1><p className="mt-4 max-w-xl font-sans text-sm leading-7 text-white/75 sm:text-base">从一张任务单出发，观察线索、采取止损动作，并完成一次可复盘的处置练习。</p></div><div className="border border-white/20 bg-[#0d3148]/70 p-4 backdrop-blur-sm"><div className="flex justify-between font-mono text-[9px] tracking-[.12em] text-[#a5dacc]"><span>MISSION STATUS</span><span>01—03</span></div><div className="mt-5 flex items-end gap-2"><span className="text-4xl font-serif font-bold text-[#e9f6f1]">03</span><span className="mb-1 font-mono text-[10px] text-[#9fcdbf]">TASKS AVAILABLE</span></div><div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[9px] text-white/60"><span>MODE: GUIDED</span><span>STATE: STANDBY</span></div></div></div>
          </div>

          <div className="mt-5 flex items-center justify-between border-b border-[#cbd9d4] pb-3"><div><p className="font-mono text-[9px] font-semibold tracking-[.18em] text-[#638187]">MISSION SHEETS</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#123f5b]">选择一张任务单</h2></div><p className="hidden font-mono text-[9px] tracking-[.12em] text-[#698187] sm:block">VERIFY · ISOLATE · REPORT</p></div>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {sceneCards.map((scene) => {
              const meta = missionMeta[scene.key];
              return (
                <article key={scene.key} className="scene-card group relative overflow-hidden border border-[#c9dad4] bg-white p-3 shadow-[0_8px_20px_rgba(22,61,74,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5d8d85] hover:shadow-[0_18px_34px_rgba(22,61,74,0.12)]">
                  <SceneCardVisual scene={scene} />
                  <div className="px-1 pb-1 pt-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-semibold tracking-[.14em] text-[#739097]">TASK {scene.index} · {scene.short.toUpperCase()}</p><h3 className="mt-1.5 font-serif text-[21px] font-bold tracking-tight text-[#173e51]">{scene.title}</h3></div><span className={`shrink-0 border px-2 py-1 font-mono text-[9px] ${meta.tone}`}>{meta.status}</span></div><dl className="mt-4 space-y-2 border-y border-[#e1ebe6] py-3 font-sans text-[11px]"><div className="flex gap-2"><dt className="w-14 shrink-0 font-mono text-[9px] tracking-[.1em] text-[#789195]">线索</dt><dd className="text-[#506b73]">{meta.riskCue}</dd></div><div className="flex gap-2"><dt className="w-14 shrink-0 font-mono text-[9px] tracking-[.1em] text-[#789195]">行动</dt><dd className="font-semibold text-[#214f5d]">{meta.expectedAction}</dd></div></dl><div className="mt-3 flex items-center justify-between"><span className="font-mono text-[9px] tracking-[.1em] text-[#74898d]">预计 {scene.duration}</span><span className="font-mono text-[9px] text-[#638187]">COORD. {scene.index}</span></div><button onClick={() => openScene(scene.key)} className="mt-4 inline-flex w-full items-center justify-between border border-[#123f5b] bg-[#123f5b] px-3.5 py-3 font-sans text-sm font-bold text-white transition hover:bg-[#1b5a76] active:scale-[0.98]">{meta.actionLabel}<ArrowRight className="h-4 w-4" /></button></div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="flex justify-between border-t border-[#cbd9d4] py-5 font-mono text-[10px] tracking-[0.1em] text-[#6f8589]">
        <span>NETWORK SECURITY WEEK · GUIDED EXERCISES</span>
        <span>COMMAND CONSOLE / 2026</span>
      </footer>
    </div>
  );
}

/** 设计提醒：首页只承担场景入口职责，以暖白基底、沉浸式任务卡与克制动效建立吸引力。 */
function HomeScreen({ openScene, welcomeAudioPending, playHomeWelcome }: { openScene: (key: SceneKey) => void; welcomeAudioPending: boolean; playHomeWelcome: () => void }) {
  const entryMeta: Record<SceneKey, { label: string; status: string; action: string; theme: string; accent: string }> = {
    download: { label: "HIGH-RISK ACTION", status: "场景已就绪", action: "进入演示场景", theme: "from-[#eaf8f5] via-[#f8fcfa] to-[#dff1ec]", accent: "bg-[#1d8375]" },
    mail: { label: "PHISHING MAIL", status: "场景已就绪", action: "进入演示场景", theme: "from-[#fff9ea] via-[#fffdf7] to-[#f8edd1]", accent: "bg-[#c8892c]" },
    ransomware: { label: "RANSOMWARE", status: "场景已就绪", action: "进入演示场景", theme: "from-[#fff3f0] via-[#fffafa] to-[#f3e5e1]", accent: "bg-[#bc5047]" },
  };

  return <CommandEntryGrid openScene={openScene} welcomeAudioPending={welcomeAudioPending} playHomeWelcome={playHomeWelcome} />;

  /*
  return <div className="relative z-10 mx-auto min-h-screen max-w-[1380px] px-4 py-4 sm:px-6 lg:px-8 lg:py-7"><header className="flex items-center justify-between gap-4 border-b border-[#d8e1dd] pb-4 lg:pb-5"><BrandMark /><div className="flex items-center gap-3"><span className="hidden font-mono text-[10px] tracking-[0.18em] text-[#6f8589] sm:inline">NETWORK SECURITY WEEK · 2026</span><span className="inline-flex items-center gap-2 border border-[#a7d2c6] bg-[#edf8f4] px-2.5 py-1.5 font-mono text-[9px] tracking-[.12em] text-[#1d8375]"><span className="h-1.5 w-1.5 rounded-full bg-[#1d8375]" />训练台在线</span></div></header><main className="relative py-8 sm:py-11 lg:py-14"><div className="pointer-events-none absolute left-[8%] right-[8%] top-[84px] h-px bg-[linear-gradient(90deg,transparent,#9ac7bb_18%,#9ac7bb_82%,transparent)]" /><div className="relative mb-6 flex flex-wrap items-center justify-between gap-3"><div className="inline-flex items-center gap-2 border-y border-[#c8d9d3] py-2 font-mono text-[10px] tracking-[.16em] text-[#55777b]"><span className="h-1.5 w-1.5 rounded-full bg-[#123f5b] />SCENARIO ACCESS</div><p className="font-sans text-sm text-[#698087]">选择一个场景，开始互动演示。</p></div><div className="relative grid gap-5 lg:grid-cols-3">{sceneCards.map((scene, index) => { const meta = entryMeta[scene.key]; return <article key={scene.key} className={`group relative overflow-hidden border border-[#c6d8d1] bg-gradient-to-br ${meta.theme} p-3 shadow-[0_16px_34px_rgba(18,63,91,.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(18,63,91,.17)]`}><div className={`absolute left-0 top-0 h-full w-1 ${meta.accent}`} /><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[18px] border-white/45" /><div className="relative flex items-center justify-between px-2 pb-3 pt-1"><span className="font-mono text-[10px] font-semibold tracking-[.16em] text-[#53767a]">0{index + 1} · {meta.label}</span><span className="rounded-full border border-white/70 bg-white/65 px-2.5 py-1 font-mono text-[9px] text-[#48686e]">{scene.duration}</span></div><SceneCardVisual scene={scene} /><div className="relative px-2 pb-2 pt-5"><div className="flex items-start justify-between gap-3"><div><h1 className="font-serif text-[26px] font-bold tracking-tight text-[#143d50]">{scene.title}</h1><p className="mt-2 font-sans text-sm leading-6 text-[#5b7279]">{scene.description}</p></div><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meta.accent}`} /></div><div className="mt-5 flex items-center justify-between border-t border-[#cadbd4]/80 pt-3"><span className="font-mono text-[10px] tracking-[.12em] text-[#6b8587]">{meta.status}</span><span className="font-mono text-[9px] text-[#8a9da0]">SCENE 0{index + 1}</span></div><button onClick={() => openScene(scene.key)} className="mt-4 inline-flex w-full items-center justify-between bg-[#123f5b] px-4 py-3.5 font-sans text-sm font-bold text-white transition hover:bg-[#1b5a76] active:scale-[0.98]">{meta.action}<ArrowRight className="h-4 w-4" /></button></div></article>; })}</div></main><footer className="flex justify-between border-t border-[#d8e1dd] py-5 font-mono text-[10px] tracking-[0.1em] text-[#6f8589]"><span>NETWORK SECURITY WEEK</span><span>SCENE SELECTOR / 2026</span></footer></div>;
}

*/
}
/** 设计提醒：主页采用画廊式安全体验入口，留白、图形场景与单一行动按钮优先于状态信息。 */
/** 设计提醒：首页以简洁的指挥蓝入口画布承载三个独立场景；不增加状态、时长或长说明，强调明确的下一步动作。 */
function CommandEntryGrid({ openScene, welcomeAudioPending, playHomeWelcome }: { openScene: (key: SceneKey) => void; welcomeAudioPending: boolean; playHomeWelcome: () => void }) {
  const theme: Record<SceneKey, { tag: string; action: string; frame: string; glow: string }> = {
    download: { tag: "SOURCE CHECK", action: "开始下载", frame: "border-[#b9dfd4]", glow: "from-[#d6f2eb] via-[#f8fffc] to-[#e6f5f1]" },
    mail: { tag: "MESSAGE TRACE", action: "追踪邮件", frame: "border-[#ead5a0]", glow: "from-[#fff4d4] via-[#fffcf2] to-[#f7e8c8]" },
    ransomware: { tag: "RECOVERY PATH", action: "查看资料", frame: "border-[#d7c8c1]", glow: "from-[#f8f3f0] via-[#fffafa] to-[#f1e9e4]" },
  };

  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-[1320px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <header className="flex items-center justify-between border-b border-[#d8e1dd] pb-5">
        <BrandMark />
        <span className="hidden font-mono text-[10px] tracking-[.2em] text-[#718489] sm:block">NETWORK SECURITY WEEK</span>
      </header>
      <main className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] font-semibold tracking-[.22em] text-[#50747a]">SAFETY EXPERIENCE CENTER</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="font-serif text-[38px] font-bold leading-tight tracking-[-.035em] text-[#123f5b] sm:text-[52px]">选择一个体验场景</h1>
            {welcomeAudioPending && <button type="button" onClick={playHomeWelcome} className="inline-flex items-center gap-2 rounded-full border border-[#9bcfc2] bg-[#effaf6]/85 px-3 py-2 font-mono text-[10px] font-semibold tracking-[.08em] text-[#176b60] shadow-[0_8px_20px_rgba(22,112,104,.10)] transition hover:-translate-y-0.5 hover:bg-[#ddf4ec] active:scale-[.97]" aria-label="开启欢迎语音"><Headphones className="h-3.5 w-3.5" />开启欢迎语音</button>}
          </div>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {sceneCards.map((scene) => {
            const style = theme[scene.key];
            return <article key={scene.key} className={`group relative overflow-hidden rounded-[22px] border ${style.frame} bg-gradient-to-br ${style.glow} p-4 shadow-[0_18px_42px_rgba(18,63,91,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(18,63,91,.16)] sm:p-5`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold tracking-[.16em] text-[#52747a]">{scene.index} · {style.tag}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[#123f5b]/15 bg-white/65 font-mono text-[10px] text-[#123f5b]">{scene.index}</span>
              </div>
              <ScenarioHeroVisual scene={scene} />
              <div className="mt-6"><h2 className="font-serif text-[29px] font-bold tracking-tight text-[#123f5b]">{scene.title}</h2></div>
              <button onClick={() => openScene(scene.key)} className="mt-6 inline-flex w-full items-center justify-between rounded-xl bg-[#123f5b] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#1b5a76] active:scale-[.97]">{style.action}<ArrowRight className="h-4 w-4" /></button>
            </article>;
          })}
        </div>
      </main>
      <footer className="border-t border-[#d8e1dd] py-5 font-mono text-[10px] tracking-[.16em] text-[#809197]">NETWORK SECURITY WEEK</footer>
    </div>
  );
}

function HomeEntryGrid({ openScene, welcomeAudioPending, playHomeWelcome }: { openScene: (key: SceneKey) => void; welcomeAudioPending: boolean; playHomeWelcome: () => void }) {
  const theme: Record<SceneKey, { tag: string; frame: string; glow: string; button: string; buttonHover: string }> = {
    download: { tag: "SOURCE CHECK", frame: "border-[#b9dfd4]", glow: "from-[#d6f2eb] via-[#f8fffc] to-[#e6f5f1]", button: "bg-[#0e695f]", buttonHover: "hover:bg-[#0a514a]" },
    mail: { tag: "MESSAGE TRACE", frame: "border-[#ead5a0]", glow: "from-[#fff4d4] via-[#fffcf2] to-[#f7e8c8]", button: "bg-[#9b671f]", buttonHover: "hover:bg-[#764b12]" },
    ransomware: { tag: "RECOVERY PATH", frame: "border-[#e5b9b2]", glow: "from-[#fff0ed] via-[#fffafa] to-[#f4e1de]", button: "bg-[#a94038]", buttonHover: "hover:bg-[#84342e]" },
  };

  return <div className="relative z-10 mx-auto min-h-screen max-w-[1320px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"><header className="flex items-center justify-between border-b border-[#d8e1dd] pb-5"><BrandMark /><span className="hidden font-mono text-[10px] tracking-[.2em] text-[#718489] sm:block">NETWORK SECURITY WEEK</span></header><main className="py-12 sm:py-16 lg:py-20"><div className="max-w-xl"><p className="font-mono text-[10px] font-semibold tracking-[.22em] text-[#50747a]">SAFETY EXPERIENCE CENTER</p><div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3"><h1 className="font-serif text-[38px] font-bold leading-tight tracking-[-.035em] text-[#123f5b] sm:text-[52px]">选择一个体验场景</h1>{welcomeAudioPending && <button type="button" onClick={playHomeWelcome} className="inline-flex items-center gap-2 rounded-full border border-[#9bcfc2] bg-[#effaf6]/85 px-3 py-2 font-mono text-[10px] font-semibold tracking-[.08em] text-[#176b60] shadow-[0_8px_20px_rgba(22,112,104,.10)] transition hover:-translate-y-0.5 hover:bg-[#ddf4ec] active:scale-[.97]" aria-label="开启欢迎语音"><Headphones className="h-3.5 w-3.5" />开启欢迎语音</button>}</div></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{sceneCards.map((scene) => { const style = theme[scene.key]; return <article key={scene.key} className={`group relative overflow-hidden rounded-[22px] border ${style.frame} bg-gradient-to-br ${style.glow} p-4 shadow-[0_18px_42px_rgba(18,63,91,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(18,63,91,.16)] sm:p-5`}><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-semibold tracking-[.16em] text-[#52747a]">{scene.index} · {style.tag}</span><span className="grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/65 font-mono text-[10px] text-[#315862]">{scene.index}</span></div><ScenarioHeroVisual scene={scene} /><div className="mt-6"><h2 className="font-serif text-[29px] font-bold tracking-tight text-[#123f5b]">{scene.title}</h2></div><button onClick={() => openScene(scene.key)} className={`mt-6 inline-flex w-full items-center justify-between rounded-xl ${style.button} px-5 py-4 text-sm font-bold text-white transition ${style.buttonHover} active:scale-[.97]`}>进入场景<ArrowRight className="h-4 w-4" /></button></article>; })}</div></main><footer className="border-t border-[#d8e1dd] py-5 font-mono text-[10px] tracking-[.16em] text-[#809197]">NETWORK SECURITY WEEK</footer></div>;
}

function ScenarioHeroVisual({ scene }: { scene: (typeof sceneCards)[number] }) {
  const Icon = scene.icon;
  if (scene.key === "download") return <div className="relative mt-5 h-52 overflow-hidden rounded-[18px] border border-[#aad7cb] bg-[radial-gradient(circle_at_76%_14%,#fff_0%,#e2f8f1_30%,#b9e4d7_100%)]"><div className="absolute -right-10 -top-9 h-40 w-40 rounded-full border-[20px] border-white/55" /><div className="absolute left-6 top-6 right-6 rounded-2xl border border-[#b9d9d1] bg-white/82 p-4 shadow-[0_14px_26px_rgba(18,96,83,.14)] backdrop-blur"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#2eab95]" /><span className="h-2 w-2 rounded-full bg-[#9fd6c8]" /><span className="h-2 w-2 rounded-full bg-[#d9eee8]" /></div><div className="mt-5 flex items-center justify-between"><div><div className="h-2 w-24 rounded-full bg-[#77bcae]" /><div className="mt-3 h-2 w-16 rounded-full bg-[#c1ddd6]" /></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0f6d61] text-white shadow-lg"><Download className="h-5 w-5" /></div></div></div><div className="absolute bottom-7 left-7 right-7 flex items-center gap-2"><span className="h-2 flex-1 rounded-full bg-[#168471]" /><span className="h-2 w-12 rounded-full bg-white/75" /></div><div className="absolute bottom-6 left-8 grid h-8 w-8 place-items-center rounded-lg bg-white/85 text-[#0f6d61] shadow"><Icon className="h-4 w-4" /></div></div>;
  if (scene.key === "mail") return <div className="relative mt-5 h-52 overflow-hidden rounded-[18px] border border-[#e1c978] bg-[radial-gradient(circle_at_78%_18%,#fff_0%,#fff6d9_34%,#f2d88f_100%)]"><div className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full border-2 border-[#c7852c] bg-white/70 text-[#a56a1e]"><Mail className="h-5 w-5" /></div><div className="absolute left-7 top-9 h-[116px] w-[190px] rotate-[-3deg] rounded-2xl border border-[#d6b54e] bg-[#fffdf4] shadow-[0_18px_28px_rgba(145,100,27,.15)]"><div className="h-8 rounded-t-2xl border-b border-[#efdaa0] bg-[#ffefbb]" /><div className="mx-5 mt-5 h-2 w-24 rounded-full bg-[#d5b357]" /><div className="mx-5 mt-3 h-2 w-36 rounded-full bg-[#efe0ae]" /><div className="mx-5 mt-3 h-2 w-20 rounded-full bg-[#efe0ae]" /></div><div className="absolute bottom-7 left-8 flex items-center gap-3"><span className="h-px w-16 bg-[#b47528]" /><span className="h-3 w-3 rounded-full border-2 border-white bg-[#d58a2f]" /><span className="font-mono text-[10px] tracking-[.15em] text-[#9d6a2b]">MESSAGE PATH</span></div></div>;
  return <div className="relative mt-5 h-52 overflow-hidden rounded-[18px] border border-[#dfb8b2] bg-[radial-gradient(circle_at_78%_16%,#fff_0%,#fff2ef_32%,#edcbc5_100%)]"><div className="absolute -left-8 -bottom-10 h-36 w-36 rounded-full border-[18px] border-white/55" /><div className="absolute left-7 top-8 flex gap-3">{[0, 1, 2].map((index) => <div key={index} className={`grid h-14 w-14 place-items-center rounded-2xl border shadow-sm ${index === 1 ? "border-[#cf6d62] bg-[#fff0ed] text-[#b7433a]" : "border-white/75 bg-white/80 text-[#7b9296]"}`}><LockKeyhole className="h-5 w-5" /></div>)}</div><svg className="absolute bottom-9 left-7 h-12 w-[calc(100%-3.5rem)]" viewBox="0 0 280 48" preserveAspectRatio="none"><path d="M0 31C38 32 57 10 93 19C129 28 145 42 178 29C207 17 237 15 280 15" fill="none" stroke="#c6594e" strokeWidth="2.3" strokeDasharray="5 5" /><circle cx="178" cy="29" r="5" fill="#c6594e" /><path d="M178 29H260" stroke="#238b76" strokeWidth="2.3" /></svg><span className="absolute bottom-7 right-8 font-mono text-[10px] tracking-[.14em] text-[#267d6d]">CONTAIN</span></div>;
}

function SceneCardVisual({ scene }: { scene: (typeof sceneCards)[number] }) {
  const Icon = scene.icon;
  const isDownload = scene.key === "download";
  const isMail = scene.key === "mail";
  return (
    <div className={`task-visual task-visual-${scene.key} relative h-40 overflow-hidden rounded-[15px] border border-[#bdd0ca]`}>
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/55 bg-white/85 text-[#123f5b] shadow-sm backdrop-blur"><Icon className="h-4 w-4" /></div>
      <span className="absolute right-3 top-3 rounded-full border border-white/55 bg-[#123f5b]/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-white">{scene.index}</span>
      {isDownload && <><div className="absolute left-7 top-[68px] h-8 w-24 rounded-md border border-[#8ac7b8] bg-white/85 shadow-sm" /><div className="absolute left-12 top-[80px] h-1.5 w-14 rounded bg-[#c7dbd5]" /><div className="absolute right-7 top-[71px] grid h-12 w-12 place-items-center rounded-xl bg-[#123f5b] text-[#9ae1cf] shadow-lg"><Download className="h-5 w-5" /></div><div className="absolute bottom-5 left-7 right-7 flex items-center gap-2"><span className="h-1.5 flex-1 rounded-full bg-[#1d8375]" /><span className="h-1.5 w-8 rounded-full bg-[#d5e5df]" /></div></>}
      {isMail && <><div className="absolute left-7 top-[70px] h-14 w-[150px] rounded-lg border border-[#d9b25b] bg-[#fff9ea] shadow-sm"><div className="absolute left-0 right-0 top-0 h-4 border-b border-[#ecd999] bg-[#fff1c7]" /><div className="ml-4 mt-7 h-1.5 w-20 rounded bg-[#d9c993]" /><div className="ml-4 mt-2 h-1.5 w-12 rounded bg-[#eadfb7]" /></div><div className="absolute right-8 top-[76px] grid h-11 w-11 place-items-center rounded-full border-2 border-[#c9873e] bg-[#fff4d0] text-[#a16b2c]"><Mail className="h-4 w-4" /></div><div className="absolute bottom-5 left-7 font-mono text-[9px] tracking-[.12em] text-[#956927]">SENDER PATH ?</div></>}
      {!isDownload && !isMail && <><div className="absolute left-7 top-[68px] flex gap-3">{[0, 1, 2].map((i) => <div key={i} className={`grid h-11 w-11 place-items-center rounded-lg border shadow-sm ${i === 1 ? "border-[#ca796e] bg-[#fff0ec] text-[#c2574a]" : "border-white/70 bg-white/80 text-[#78969b]"}`}><LockKeyhole className="h-4 w-4" /></div>)}</div><svg className="absolute bottom-5 left-7 right-7 h-9 w-[calc(100%-3.5rem)]" viewBox="0 0 240 36" preserveAspectRatio="none"><path d="M0,25 C40,25 46,4 82,11 S135,30 160,20 S205,7 240,7" fill="none" stroke="#c75b50" strokeWidth="2" strokeDasharray="4 4" /><circle cx="160" cy="20" r="4" fill="#c75b50" /><path d="M160,20 L214,20" stroke="#2a9b83" strokeWidth="2" /></svg><div className="absolute bottom-4 right-7 font-mono text-[9px] tracking-[.12em] text-[#1d8375]">CONTAIN</div></>}
    </div>
  );
}

function SceneShell({
  scene,
  step,
  steps,
  narration,
  voiceEnabled,
  manualSpeech,
  setManualSpeech,
  speak,
  playSceneAudio,
  setVoiceEnabled,
  setStep,
  leaveScene,
  resetScene,
}: {
  scene: (typeof sceneCards)[number];
  step: number;
  steps: string[];
  narration: string;
  voiceEnabled: boolean;
  manualSpeech: boolean;
  setManualSpeech: (value: boolean) => void;
  speak: (text: string) => void;
  playSceneAudio: (key: SceneKey, step?: number) => void;
  setVoiceEnabled: (value: boolean) => void;
  setStep: (value: number) => void;
  leaveScene: () => void;
  resetScene: () => void;
}) {
  const Icon = scene.icon;
  const goTo = (next: number) => {
    setManualSpeech(false);
    setStep(next);
  };

  return (
    <div className="relative z-10 min-h-screen bg-[#eef2ef]">
      <header className="sticky top-0 z-30 border-b border-[#cddbd6] bg-[#f8f9f6]/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={leaveScene} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#d4dfda] bg-white text-[#315562] transition hover:border-[#7b9c98] hover:text-[#123f5b] active:scale-[0.97]" aria-label="返回体验中心">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <BrandMark compact />
            <div className="hidden min-w-0 border-l border-[#d9e3df] pl-4 sm:block">
              <p className="truncate font-sans text-sm font-bold text-[#173e51]">{scene.title}</p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-[#6f8589]">SIMULATION / {scene.index}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetScene} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d5deda] bg-white px-3 font-sans text-xs font-bold text-[#45636d] transition hover:border-[#a8bfba] hover:text-[#123f5b] active:scale-[0.97]">
              <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">一键重置</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[188px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="lg:border-r lg:border-[#d2ded9] lg:pr-6">
          <div className="rounded-2xl border border-[#d5e1dc] bg-white/75 p-4 shadow-[0_10px_24px_rgba(21,55,67,0.04)] lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f2ee] text-[#1d8375]"><Icon className="h-4 w-4" /></span>
              <div><p className="font-mono text-[10px] tracking-[0.14em] text-[#6d8688]">CURRENT TASK</p><p className="font-sans text-sm font-bold text-[#214c5c]">{scene.short}</p></div>
            </div>
            <div className="mt-6 space-y-0">
              {steps.map((name, index) => {
                const done = index < step;
                const current = index === step;
                return (
                  <div key={name} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < steps.length - 1 && <span className={`absolute left-[9px] top-5 h-[calc(100%-4px)] w-px ${done ? "bg-[#76ad9e]" : "bg-[#d9e4df]"}`} />}
                    <span className={`relative z-10 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full border text-[9px] ${done ? "border-[#1d8375] bg-[#1d8375] text-white" : current ? "border-[#1d8375] bg-white text-[#1d8375] shadow-[0_0_0_4px_rgba(29,131,117,.1)]" : "border-[#cbdad4] bg-white text-[#8b9fa1]"}`}>{done ? <Check className="h-3 w-3" /> : index + 1}</span>
                    <p className={`-mt-0.5 font-sans text-xs ${current ? "font-bold text-[#173e51]" : done ? "font-medium text-[#5d7779]" : "text-[#87999b]"}`}>{name}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 border-t border-[#e0e8e4] pt-4 font-sans text-[11px] leading-5 text-[#688087]">所有场景均为无害仿真。<br />不会记录您的选择或成绩。</div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#638187]">STEP {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#123f5b]">{steps[step]}</h1>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#bcd8cf] bg-[#ebf4f0] px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.1em] text-[#287365] sm:self-auto"><span className="h-1.5 w-1.5 rounded-full bg-[#1d8375]" /> SAFE SIMULATION</div>
          </div>

          {scene.key === "download" && <DownloadScenario step={step} goTo={goTo} />}
          {scene.key === "mail" && <MailScenario onLeave={leaveScene} onReset={resetScene} onAudioAfterCurrent={(audioStep) => playSceneAudio("mail", audioStep)} />}
          {scene.key === "ransomware" && <RansomwareScenario step={step} goTo={goTo} />}

        </section>
      </div>
    </div>
  );
}

function DownloadScenario({ step, goTo }: { step: number; goTo: (step: number) => void }) {
  const [downloaded, setDownloaded] = useState(false);
  const downloadGuide = () => {
    downloadSafeTrainingFile("软件来源核验清单_教学素材.txt", "安全周推演台：软件来源核验清单\n\n1. 从单位软件库或软件官网获取。\n2. 核验域名、发布者与数字签名。\n3. 不关闭安全防护，不运行未知来源文件。\n\n本文件为无害教学素材。");
    setDownloaded(true);
    goTo(1);
  };

  if (step === 0) return null;
  if (step === 1) return (
    <div className="workbench overflow-hidden">
      <div className="border-b border-[#e2eae6] px-4 py-4 sm:px-6"><p className="font-sans text-sm font-bold text-[#254f5e]">虚拟下载文件夹</p><p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-[#829499]">SIMULATED DOWNLOADS · NOT YOUR SYSTEM FOLDER</p></div>
      <div className="grid min-h-[320px] place-items-center bg-[linear-gradient(135deg,#f9faf6_0%,#eaf1ed_100%)] p-5">
        <div className="w-full max-w-sm rounded-2xl border border-[#c7dcd4] bg-white p-5 shadow-[0_18px_35px_rgba(25,70,78,.12)]">
          <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e9f1ec] text-[#d49b27]"><FileText className="h-7 w-7" /></div><div><p className="font-sans text-sm font-bold text-[#294f5d]">协作工具安装包.exe</p><p className="mt-1 font-mono text-[10px] text-[#7d9295]">虚拟文件 · 42.8 MB · 来源未核验</p></div></div>
          <div className="my-5 h-px bg-[#e4ebe7]" />
          <p className="font-sans text-sm leading-6 text-[#60767d]">该卡片模拟一次未核验安装包被打开后的决策节点。点击后只会进入网页内的虚拟事件回放。</p>
          <button onClick={() => goTo(2)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123f5b] px-4 py-3 font-sans text-sm font-bold text-white transition hover:bg-[#175774] active:scale-[0.98]"><ChevronRight className="h-4 w-4" /> 在仿真环境运行</button>
          {downloaded && <p className="mt-3 text-center font-sans text-xs text-[#1d8375]">教学素材已安全下载</p>}
        </div>
      </div>
    </div>
  );
  if (step === 2) return (
    <div className="terminal-window">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white/75"><span className="font-mono text-[10px] tracking-[0.14em]">VIRTUAL ENDPOINT MONITOR</span><span className="flex items-center gap-2 text-[10px] text-[#f5c169]"><span className="h-1.5 w-1.5 rounded-full bg-[#f0b53f]" /> SIMULATED ALERT</span></div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px] lg:p-7"><div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e75648]/15 text-[#ff9186]"><ShieldAlert className="h-5 w-5" /></span><div><p className="font-serif text-2xl font-bold text-white">虚拟木马感染告警</p><p className="mt-1 font-sans text-sm text-white/60">以下为浏览器内的虚拟感染事件回放。</p></div></div><div className="mt-7 space-y-0 border-l border-white/15 pl-5">{["未核验安装包已在虚拟终端中运行", "虚拟凭据与业务文件访问风险升高", "终端防护发出阻断告警，建议隔离并报告"].map((item, index) => <div key={item} className="relative pb-6 last:pb-0"><span className={`absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full ${index === 2 ? "bg-[#70d4be]" : "bg-[#ec7267]"}`} /><p className="font-sans text-sm text-white/80">{item}</p><p className="mt-1 font-mono text-[10px] text-white/35">00:0{index + 1}:14</p></div>)}</div></div><div className="rounded-2xl border border-[#77c7b7]/30 bg-[#9cf0dd]/8 p-5"><p className="font-mono text-[10px] tracking-[0.15em] text-[#9fe3d3]">优先行动</p><p className="mt-2 font-sans text-sm leading-6 text-white">停止继续操作，断开网络连接，并及时报告安全人员。</p><button onClick={() => goTo(3)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8cdbc9] px-3 py-3 font-sans text-sm font-bold text-[#123f5b] transition hover:bg-white active:scale-[0.98]"><WifiOff className="h-4 w-4" /> 执行虚拟隔离</button></div></div>
    </div>
  );
  return <ReviewPanel title="软件下载推演已完成" eyebrow="虚拟隔离已执行" points={["从单位软件库或软件官网获取软件", "核验来源、发布者、签名与权限请求", "若已运行可疑文件，立即断网、报告并按预案处置"]} onReset={() => goTo(0)} />;
}

function LegacyTrainingSoftwarePortal({ onDownload }: { onDownload: () => void }) {
  const quickApps = [
    ["云", "云协办公", "办公协作", "bg-[#d8ebff] text-[#1f71ba]"],
    ["会", "迅写会议", "视频会议", "bg-[#e2f7ee] text-[#158763]"],
    ["文", "文档助手", "效率工具", "bg-[#fff0da] text-[#bc741f]"],
    ["览", "极速浏览", "网络工具", "bg-[#eee7ff] text-[#7357a8]"],
    ["压", "压缩专家", "系统工具", "bg-[#ffe7e7] text-[#c35b5b]"],
    ["图", "图像轻工厂", "图形图像", "bg-[#e1f3f4] text-[#267d8b]"],
  ];
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d7e7eb] bg-white shadow-[0_18px_42px_rgba(38,97,126,.08)]">
      <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#e6eff2] px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex shrink-0 items-center gap-2.5 text-[#185da0]">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#2379db_0%,#4bc9cb_100%)] text-white shadow-[0_6px_12px_rgba(35,121,219,.23)]"><Download className="h-4 w-4" /></span>
            <span className="font-sans text-sm font-bold tracking-tight">云端软件中心</span>
          </div>
          <nav className="hidden items-center gap-5 font-sans text-sm text-[#496a79] md:flex"><span className="relative font-bold text-[#1e7bda] after:absolute after:-bottom-[20px] after:left-0 after:h-0.5 after:w-full after:bg-[#2283e3]">首页</span><span>软件分类</span><span>装机必备</span><span>游戏娱乐</span></nav>
        </div>
        <div className="hidden max-w-[355px] flex-1 items-center rounded-md border border-[#d9e8ee] bg-[#f8fbfc] px-3 py-2 sm:flex"><Search className="h-4 w-4 text-[#829ba9]" /><span className="ml-2 flex-1 font-sans text-xs text-[#91a6b1]">输入软件名称或功能</span><span className="rounded bg-[#287ee0] px-3 py-1 font-sans text-[11px] font-bold text-white">搜索</span></div>
      </div>
      <div className="relative overflow-hidden bg-[linear-gradient(110deg,#f1fbff_0%,#d9f6f7_52%,#f5fcff_100%)] px-5 py-8 sm:px-9 sm:py-10">
        <div className="absolute right-[-46px] top-[-86px] h-64 w-64 rounded-full border-[24px] border-[#5ccfd2]/15" /><div className="absolute bottom-[-105px] right-[22%] h-48 w-48 rounded-full bg-[#52b7f0]/10 blur-2xl" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,.9fr)_minmax(330px,.7fr)] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#a9dfe5] bg-white/70 px-3 py-1.5 font-mono text-[10px] tracking-[.12em] text-[#267583]"><span className="h-1.5 w-1.5 rounded-full bg-[#27a8bd]" /> SOFTWARE DISCOVERY</p>
            <h3 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#1763ac] sm:text-[42px]">海量工具，一站获取</h3>
            <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-[#57808c]">办公、会议、图像和系统工具集中展示。选择所需软件，即刻开始下载流程。</p>
            <div className="mt-6 flex flex-wrap gap-3"><button onClick={onDownload} className="inline-flex items-center gap-2 rounded-md bg-[#2180e3] px-5 py-3 font-sans text-sm font-bold text-white shadow-[0_9px_18px_rgba(33,128,227,.24)] transition hover:bg-[#0e6dcc] active:scale-[.98]"><Download className="h-4 w-4" /> 立即下载</button><button className="rounded-md border border-[#a8d9df] bg-white/65 px-5 py-3 font-sans text-sm font-semibold text-[#40808d]">热门软件</button></div>
          </div>
          <div className="relative mx-auto w-full max-w-[390px] rounded-[18px] border border-white/80 bg-white/90 p-3 shadow-[0_20px_42px_rgba(56,132,157,.17)] backdrop-blur"><div className="flex items-center gap-1.5 border-b border-[#e7eff3] pb-2.5"><span className="h-2 w-2 rounded-full bg-[#f6a998]" /><span className="h-2 w-2 rounded-full bg-[#f1d081]" /><span className="h-2 w-2 rounded-full bg-[#88cfb6]" /><span className="ml-2 font-mono text-[9px] tracking-[.1em] text-[#8aa1ac]">SOFTWARE PANEL</span></div><div className="mt-3 grid grid-cols-3 gap-2.5">{quickApps.map(([initial, name, category, tone]) => <div key={name} className="rounded-xl border border-[#e7eff2] bg-white p-2.5"><span className={`grid h-8 w-8 place-items-center rounded-lg font-mono text-xs font-bold ${tone}`}>{initial}</span><p className="mt-2 truncate font-sans text-[11px] font-bold text-[#315c72]">{name}</p><p className="mt-1 truncate font-sans text-[9px] text-[#8da3ad]">{category}</p></div>)}</div><div className="mt-3 flex items-center justify-between rounded-lg bg-[#eef9fb] px-3 py-2"><span className="font-sans text-[10px] text-[#4b7f8e]">本周热门软件推荐</span><span className="font-mono text-[9px] text-[#1a9aaa]">TOP 20 ›</span></div></div>
        </div>
      </div>
      <div className="grid gap-3 border-b border-[#e6eff2] bg-white px-4 py-4 sm:grid-cols-3 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f4ff] text-[#2c80db]"><FileSearch className="h-4 w-4" /></span><div><p className="font-sans text-xs font-bold text-[#315d72]">软件分类</p><p className="mt-0.5 font-sans text-[10px] text-[#90a4ae]">快速查找常用工具</p></div></div><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8faf3] text-[#20a379]"><Download className="h-4 w-4" /></span><div><p className="font-sans text-xs font-bold text-[#315d72]">高速下载</p><p className="mt-0.5 font-sans text-[10px] text-[#90a4ae]">一键获取软件安装包</p></div></div><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff3e4] text-[#d38a31]"><ShieldCheck className="h-4 w-4" /></span><div><p className="font-sans text-xs font-bold text-[#315d72]">热门推荐</p><p className="mt-0.5 font-sans text-[10px] text-[#90a4ae]">发现近期高频工具</p></div></div></div>
      <div className="flex flex-col justify-between gap-3 bg-[#f7fafc] px-4 py-4 font-sans text-[10px] text-[#8a9fa9] sm:flex-row sm:items-center sm:px-6"><span>云端软件中心 · 软件发现与下载演示</span><span>关于我们　服务协议　帮助中心　意见反馈</span></div>
    </div>
  );
}

function TrainingSoftwarePortal({ onLeave, onStageAudio, onAudioAfterCurrent }: { onLeave: () => void; onStageAudio: (step: number) => void; onAudioAfterCurrent: (step: number) => void }) {
  const [stage, setStage] = useState<"idle" | "downloaded" | "runPrompt" | "infected" | "monitoring" | "contained">("idle");
  const [selectedApp, setSelectedApp] = useState("腾讯视频");
  const hasPlayedEntryNarration = useRef(false);
  const appIcons: Record<string, string> = {
    WorkBuddy: "/manus-storage/workbuddy_44df2417.png",
    "DClaw龙虾安全本地版": "/manus-storage/dclaw_ba52c34d.png",
    元宝: "/manus-storage/yuanbao_747b0abc.png",
    腾讯视频: "/manus-storage/tencent-video_fd612cbd.png",
    "WPS Office": "/manus-storage/wps-office_d345b3f3.png",
    腾讯会议: "/manus-storage/tencent-meeting_b28b0a3b.png",
    QQ: "/manus-storage/qq_f2ba01d0.png",
    "QQ音乐": "/manus-storage/qq-music_728c4f3c.png",
    "腾讯电脑管家": "/manus-storage/index-banner-logo_e5c82f0b.svg",
  };
  const installerInfo: Record<string, { file: string; version: string; size: string }> = {
    WorkBuddy: { file: "WorkBuddy_Setup_5.3.0.exe", version: "5.3.0", size: "388.37 MB" },
    "DClaw龙虾安全本地版": { file: "DClaw_Security_Local_1.3.0.exe", version: "1.3.0", size: "236.28 MB" },
    元宝: { file: "Yuanbao_Setup_2.80.0.exe", version: "2.80.0", size: "51.84 MB" },
    腾讯视频: { file: "TencentVideo_11.179.0.exe", version: "11.179.0", size: "101.82 MB" },
    "WPS Office": { file: "WPSOffice_12.1.0.exe", version: "12.1.0", size: "300.53 MB" },
    腾讯会议: { file: "TencentMeeting_3.44.0.exe", version: "3.44.0", size: "279.94 MB" },
    QQ: { file: "QQ_9.9.0.exe", version: "9.9.0", size: "300.01 MB" },
    "QQ音乐": { file: "QQMusic_22.52.0.exe", version: "22.52.0", size: "94.23 MB" },
    "腾讯电脑管家": { file: "QQPCManager_17.2.0.exe", version: "17.2.0", size: "89.70 MB" },
  };
  const featured = [
    ["WorkBuddy", "腾讯版小龙虾，AI 办公伙伴"],
    ["DClaw龙虾安全本地版", "养只会干活的 AI 龙虾"],
    ["元宝", "元宝电脑版·AI 智能新体验"],
    ["腾讯视频", "下载客户端，体验流畅播放"],
    ["WPS Office", "All in One 一站式办公服务平台"],
    ["腾讯会议", "稳定可靠的高清云会议"],
    ["QQ", "新不止步，乐不设限"],
    ["QQ音乐", "天天新歌精选，即时在线收听"],
  ];
  const zones = [
    { title: "办公必备", caption: "90%用户都在使用", tone: "border-[#ffb96e]/50 bg-[linear-gradient(155deg,#fff5e9_0%,#fff_55%)]", items: ["WorkBuddy", "DClaw龙虾安全本地版", "元宝", "WPS Office"] },
    { title: "追剧必备", caption: "正版内容，畅享视听", tone: "border-[#9fcaff]/50 bg-[linear-gradient(155deg,#eff8ff_0%,#fff_55%)]", items: ["腾讯视频", "QQ音乐", "QQ", "腾讯会议"] },
    { title: "热门推荐", caption: "常用软件，集中发现", tone: "border-[#9be5bd]/50 bg-[linear-gradient(155deg,#effff0_0%,#fff_55%)]", items: ["腾讯会议", "腾讯视频", "WPS Office", "QQ"] },
  ];
  useEffect(() => {
    if (!hasPlayedEntryNarration.current) {
      hasPlayedEntryNarration.current = true;
      onStageAudio(0);
    }
  }, [onStageAudio]);

  const beginDownload = (app = "腾讯视频") => { setSelectedApp(app); setStage("downloaded"); };
  const downloadTrainingAsset = () => {
    const expectedSafeDownloadName = selectedInstaller.file.replace(/\.exe$/i, ".txt");
    downloadMappedTrainingAsset(HIGH_RISK_TRAINING_ASSET.assetUrl, expectedSafeDownloadName);
    onStageAudio(1);
    onAudioAfterCurrent(2);
    setStage("idle");
  };
  const openVirtualRun = () => { setStage("runPrompt"); onStageAudio(1); };
  const simulateRun = () => { setStage("contained"); onStageAudio(3); };
  const showMonitoring = () => setStage("monitoring");
  const showPrevention = () => { setStage("contained"); onStageAudio(3); };
  const restart = () => { setStage("idle"); };
  const selectedInstaller = installerInfo[selectedApp];
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#edf1f7] font-sans text-[#222]">
      <header className="h-20 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,.04)]">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center gap-5 px-4 xl:px-0">
          <img src="/manus-storage/header-logo_feccb5bc.png" alt="腾讯软件中心" className="h-8 w-36 shrink-0 object-contain" />
          <nav className="hidden h-full items-stretch lg:flex"><button className="relative w-24 text-base font-semibold text-[#2049ee] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#31abff]">首页</button><button className="w-24 text-base text-[#38435a] hover:bg-[#f7f9fa]">分类</button><button className="w-24 text-base text-[#38435a] hover:bg-[#f7f9fa]">游戏</button><button className="w-24 text-base text-[#38435a] hover:bg-[#f7f9fa]">开放平台</button></nav>
          <div className="ml-auto hidden w-[330px] lg:block"><div className="flex h-10 items-center rounded-sm border-2 border-[#33acff] bg-white px-3"><Search className="h-4 w-4 text-[#7f91a4]" /><span className="ml-2 flex-1 text-xs text-[#a4b0bd]">在这里输入你要找的软件</span><span className="grid h-7 w-8 place-items-center bg-[#33acff] text-white"><Search className="h-4 w-4" /></span></div><p className="mt-1 truncate text-[9px] text-[#8ca0b0]">https://pc.qqqq.example-training.local/ · 203.0.113.42</p></div>
          <button onClick={() => beginDownload("腾讯电脑管家")} className="shrink-0 bg-[#2049ee] px-4 py-2.5 text-sm font-bold text-white shadow-[0_5px_12px_rgba(32,73,238,.22)] transition hover:bg-[#153bca] active:scale-[.98]">下载电脑管家</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-5 xl:px-0">
        <section className="relative min-h-[282px] overflow-hidden bg-[linear-gradient(90deg,#e0fbff_0%,#c9f6f8_55%,#dcfcff_100%)] px-9 py-7 sm:px-14">
          <div className="absolute bottom-[-80px] right-[2%] h-64 w-64 rounded-full border-[32px] border-[#69dce0]/20" />
          <div className="relative z-10 max-w-[510px] pt-4"><img src="/manus-storage/index-banner-logo_e5c82f0b.svg" alt="腾讯电脑管家" className="h-12 w-auto" /><h1 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-.045em] text-[#2049ee] sm:text-[44px]">海量软件下载 管理无忧</h1><p className="mt-3 text-lg tracking-tight text-[#345ec0]">一键下载安装|安全无捆绑|更新无插件|卸载无残留</p><button onClick={() => beginDownload("腾讯电脑管家")} className="mt-7 bg-[#2049ee] px-7 py-3 text-lg font-medium text-white shadow-[0_7px_16px_rgba(32,73,238,.25)] transition hover:bg-[#123ad2] active:scale-[.98]">下载电脑管家</button></div>
          <img src="/manus-storage/index-banner-fimg_1b12f41e.png" alt="软件管理面板" className="absolute bottom-0 right-[-12px] hidden h-[282px] w-auto object-contain object-bottom sm:block" />
          <img src="/manus-storage/index-banner-other_4bee470b.svg" alt="" className="absolute bottom-4 right-[24%] hidden h-20 w-20 opacity-90 lg:block" />
        </section>

        <section className="mt-5 bg-white p-7 sm:p-[30px]"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-black">精选软件</h2><button className="text-sm font-medium text-[#1232da]">换一换</button></div><div className="mt-1 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{featured.map(([name, desc]) => <article key={name} className="group relative mt-4 flex h-[90px] items-center border border-black/[.06] bg-white px-5 transition hover:shadow-[0_10px_20px_rgba(0,0,0,.07)]"><img src={appIcons[name]} alt="" className="h-[60px] w-[60px] shrink-0 object-contain" /><div className="ml-3 min-w-0"><div className="flex items-center gap-1"><h3 className="truncate text-[15px] text-[#181818]">{name}</h3><span className="rounded-sm bg-[#00b35d]/10 px-1 text-[10px] text-[#00ab59]">推荐</span></div><p className="mt-1 truncate text-xs text-[#999]">{desc}</p></div><button onClick={() => beginDownload(name)} className="absolute right-3 top-[31px] hidden h-[24px] w-[54px] bg-[#2049ee] text-xs text-white group-hover:block">下载</button></article>)}</div></section>

        <section className="mt-5 grid gap-3 lg:grid-cols-3">{zones.map((zone) => <article key={zone.title} className={`min-h-[310px] border p-5 ${zone.tone}`}><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-[#303744]">{zone.title}</h2><p className="mt-1 text-xs text-[#8f96a2]">{zone.caption}</p></div><button className="text-xs text-[#5c8de7]">更多 &gt;</button></div><div className="mt-5 space-y-2">{zone.items.map((item) => <button onClick={() => beginDownload(item)} key={item} className="group flex w-full items-center gap-3 bg-white/85 p-3 text-left transition hover:bg-white hover:shadow-sm"><img src={appIcons[item]} alt="" className="h-9 w-9 object-contain" /><span className="flex-1 text-sm text-[#3d4655]">{item}</span><span className="hidden text-xs text-[#2049ee] group-hover:inline">下载</span></button>)}</div></article>)}</section>
      </main>

      {stage === "downloaded" && <DownloadTaskNotice appName={selectedApp} iconSrc={appIcons[selectedApp]} onDismiss={restart} onChoose={downloadTrainingAsset} />}

      <footer className="border-t border-[#e0e5ec] bg-white py-7 text-center text-xs leading-7 text-[#9aa5b1]"><p>腾讯网　腾讯电脑管家　腾讯小鹅桌面</p><p className="mt-2">腾讯公司　版权所有　市场合作　投诉建议　侵权投诉指引　关于管家</p><p className="mt-1">Copyright © 1998 - 2017 Tencent. All Rights Reserved.</p><button onClick={onLeave} className="mt-4 text-xs text-[#5f7a8b] underline underline-offset-4">返回活动主页</button></footer>

      {false && stage !== "idle" && <div className="fixed inset-0 z-[120] grid place-items-center bg-[#0a2032]/45 px-4 backdrop-blur-[2px]"><div className={`w-full max-w-[480px] overflow-hidden rounded-lg bg-white shadow-[0_24px_60px_rgba(7,28,48,.32)] ${stage === "infected" ? "ring-1 ring-[#e85c53]" : ""}`}>
        {stage === "downloaded" && <><div className="border-b border-[#e7edf3] px-6 py-4 text-[15px] font-semibold text-[#263c50]">下载完成</div><div className="px-6 py-6"><div className="flex items-center gap-4 rounded-md bg-[#f5f8fb] p-4"><img src={appIcons[selectedApp]} alt="" className="h-12 w-12 object-contain" /><div><p className="text-sm font-medium text-[#233a50]">{selectedInstaller.file}</p><p className="mt-1 text-xs text-[#8b9bab]">{selectedApp} · 版本 {selectedInstaller.version} · {selectedInstaller.size}</p></div></div><p className="mt-5 text-sm leading-6 text-[#536a7d]">安装包已准备就绪，是否立即运行？</p></div><div className="flex justify-end gap-3 border-t border-[#e7edf3] bg-[#f8fafc] px-6 py-3"><button onClick={restart} className="px-3 py-2 text-sm text-[#667b8b]">取消</button><button onClick={simulateRun} className="bg-[#2049ee] px-4 py-2 text-sm font-medium text-white">立即运行</button></div></>}
        {stage === "infected" && <><div className="flex items-center gap-3 border-b border-[#f1d6d3] bg-[#fff5f3] px-6 py-4 text-[15px] font-semibold text-[#b54139]"><TriangleAlert className="h-5 w-5" /> 安装结果</div><div className="px-6 py-6"><p className="text-base font-semibold text-[#263c50]">程序已启动</p><p className="mt-3 text-sm leading-7 text-[#566d7f]">{selectedInstaller.file} 已在虚拟回放中触发异常行为。攻击者可能借此窃取账号凭据、读取业务文件或获取设备控制权。</p><div className="mt-5 rounded-md border border-[#f0ddd8] bg-[#fffafa] p-3 text-xs leading-5 text-[#9a5c56]">下一步将展示虚拟监控端看到的预置画面与数据。</div></div><div className="flex justify-end gap-3 border-t border-[#f0ddd8] bg-[#fffafa] px-6 py-3"><button onClick={showMonitoring} className="bg-[#d84d43] px-4 py-2 text-sm font-medium text-white">查看模拟监控端</button></div></>}
        {stage === "monitoring" && <><div className="flex items-center gap-3 border-b border-[#d2e0ec] bg-[#edf5fb] px-6 py-4 text-[15px] font-semibold text-[#245e87]"><Network className="h-5 w-5" /> 模拟监控端 · 虚拟回放</div><div className="bg-[#102331] px-5 py-5 sm:px-6"><div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[.12em] text-[#9ac5dc]"><span>REMOTE SESSION / DEMO-024</span><span className="rounded bg-[#d94d48]/20 px-2 py-1 text-[#ffaaa5]">SIMULATED</span></div><div className="grid gap-3 md:grid-cols-[1.35fr_.85fr]"><div className="overflow-hidden rounded-md border border-white/10 bg-[#17384c]"><div className="flex items-center gap-1.5 border-b border-white/10 bg-[#0e2938] px-3 py-2"><span className="h-2 w-2 rounded-full bg-[#ef756d]" /><span className="h-2 w-2 rounded-full bg-[#e9c463]" /><span className="h-2 w-2 rounded-full bg-[#75cdaa]" /><span className="ml-2 font-mono text-[9px] text-white/45">DESKTOP VIEW</span></div><div className="min-h-[168px] bg-[radial-gradient(circle_at_70%_25%,#35758d_0%,#1d4f65_34%,#132f42_100%)] p-4"><div className="grid grid-cols-4 gap-3">{["项目计划书","客户资料","周报汇总","备份索引"].map((name, index) => <div key={name} className="text-center"><span className={`mx-auto grid h-9 w-9 place-items-center rounded-md ${index === 1 ? "bg-[#c85850]" : "bg-[#e9f3ef]"} text-[9px] ${index === 1 ? "text-white" : "text-[#207363]"}`}>{index === 1 ? <TriangleAlert className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><span className="mt-1 block truncate text-[8px] text-white/80">{name}</span></div>)}</div><div className="mt-6 rounded bg-white/10 p-2 font-mono text-[9px] text-white/55">虚拟桌面画面 · 预置演示内容</div></div></div><div className="rounded-md border border-white/10 bg-[#0d202d] p-3"><p className="font-mono text-[9px] tracking-[.1em] text-[#9ac5dc]">VIRTUAL ACTIVITY</p><div className="mt-3 space-y-3 font-mono text-[10px] leading-5 text-white/65"><p><span className="mr-2 text-[#e9756e]">09:42:16</span> 屏幕会话已建立</p><p><span className="mr-2 text-[#e9756e]">09:42:29</span> 虚拟文件列表已显示</p><p><span className="mr-2 text-[#e9756e]">09:42:41</span> 输入框内容已截取</p><p><span className="mr-2 text-[#e9756e]">09:42:55</span> 网络状态：已连接</p></div></div></div></div><div className="px-6 py-5"><p className="text-base font-semibold text-[#263c50]">这是伪装成 {selectedApp} 安装包的虚拟木马回放</p><p className="mt-2 text-sm leading-6 text-[#566d7f]">你已在演示中“中毒”。另一台主机上所见的桌面、文件和操作记录均为预置的虚拟数据，用于说明远程监控可能造成的影响。</p></div><div className="flex justify-end border-t border-[#dce7ef] bg-[#f7fafc] px-6 py-3"><button onClick={showPrevention} className="bg-[#2049ee] px-4 py-2 text-sm font-medium text-white">查看处理建议</button></div></>}
        {stage === "contained" && <><div className="flex items-center gap-3 border-b border-[#dcebe5] bg-[#f3fbf7] px-6 py-4 text-[15px] font-semibold text-[#207c61]"><ShieldCheck className="h-5 w-5" /> 处理建议</div><div className="px-6 py-6"><p className="text-base font-semibold text-[#263c50]">建议立即完成以下操作</p><ol className="mt-4 space-y-3 text-sm leading-6 text-[#536a7d]"><li><b className="mr-2 text-[#2049ee]">01</b>停止继续打开未知文件，并断开网络连接。</li><li><b className="mr-2 text-[#2049ee]">02</b>报告安全人员，保留现场信息并依据预案处置。</li><li><b className="mr-2 text-[#2049ee]">03</b>后续仅从官方渠道获取软件，核验发布者与签名。</li></ol></div><div className="flex justify-end border-t border-[#dcebe5] bg-[#f8fcfa] px-6 py-3"><button onClick={restart} className="bg-[#2049ee] px-4 py-2 text-sm font-medium text-white">重新体验</button></div></>}
      </div></div>}
    </div>
  );
}

function DownloadTaskNotice({ appName, iconSrc, onDismiss, onChoose }: { appName: string; iconSrc: string; onDismiss: () => void; onChoose: () => void }) {
  const featureLines = ["一站式下载必备软件", "软件更新提醒，卸载干净无残留", "软件权限管理，一键拦截广告弹窗"];
  return <div className="fixed inset-0 z-[130] grid place-items-center bg-[#162331]/55 px-4 backdrop-blur-[1px]" aria-label={`${appName} 下载方式选择`}><section className="relative w-full max-w-[888px] overflow-hidden rounded-[5px] border border-[#bfd8eb] bg-[#dff2ff] p-7 shadow-[0_24px_70px_rgba(14,39,65,.35)] sm:p-12"><button onClick={onDismiss} className="absolute right-5 top-4 grid h-9 w-9 place-items-center text-[#263c50] transition hover:rotate-90 hover:text-[#1c5cd7]" aria-label="关闭下载选择"><X className="h-7 w-7" /></button><div className="space-y-5"><div className="rounded-[5px] border border-white/80 bg-white/80 p-5 shadow-[0_1px_1px_rgba(83,138,173,.08)] sm:p-8"><div className="inline-flex rounded-r-full bg-[#56aeff] px-4 py-2 text-sm text-white shadow-sm">下载中心功能说明</div><div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex items-start gap-4"><img src={iconSrc} alt={`${appName} 图标`} className="mt-1 h-12 w-12 shrink-0 object-contain" /><div><h3 className="font-serif text-[25px] leading-tight text-[#263c50] sm:text-[29px]">使用软件下载中心查看 {appName}</h3><div className="mt-4 space-y-2 text-sm leading-6 text-[#435a6d]">{featureLines.map((line) => <p key={line}><span className="mr-2 text-[#1a74e8]">●</span>{line}</p>)}</div></div></div><button onClick={onChoose} className="h-12 shrink-0 rounded-[4px] bg-[#2457e7] px-8 text-base text-white shadow-[0_4px_9px_rgba(36,87,231,.23)] transition hover:bg-[#1747d0] active:scale-[.98]">直接下载</button></div></div><div className="rounded-[5px] border border-white/80 bg-white/80 p-5 shadow-[0_1px_1px_rgba(83,138,173,.08)] sm:flex sm:items-center sm:justify-between sm:p-8"><div><h3 className="font-serif text-[25px] text-[#263c50] sm:text-[29px]">直接下载</h3><p className="mt-1 text-sm text-[#667b8d]">下载对应说明内容</p></div><button onClick={onChoose} className="mt-4 h-11 rounded-[4px] border border-[#d6e0e8] bg-white px-8 text-base text-[#3d4d5d] shadow-sm transition hover:border-[#86a9c8] hover:text-[#2457e7] sm:mt-0">直接下载</button></div><p className="px-1 text-xs text-[#7c8d9d]">安全说明：当前入口仅下载固定说明内容，不安装或执行程序。</p></div></section></div>;
}

function VirtualRunPrompt({ appName, iconSrc, installer, onDismiss, onRun }: { appName: string; iconSrc: string; installer: { file: string; version: string; size: string }; onDismiss: () => void; onRun: () => void }) {
  return <div className="fixed inset-0 z-[130] grid place-items-center bg-[#162331]/55 px-4 backdrop-blur-[1px]"><section className="w-full max-w-[520px] overflow-hidden rounded-[5px] border border-[#c9d9e7] bg-white shadow-[0_24px_70px_rgba(14,39,65,.35)]"><div className="flex items-center justify-between border-b border-[#e6edf3] bg-[#f7fafe] px-5 py-3"><p className="text-sm font-medium text-[#263c50]">软件安装包</p><button onClick={onDismiss} className="text-[#778c9c]"><X className="h-5 w-5" /></button></div><div className="p-5"><div className="flex items-center gap-4 rounded-[4px] bg-[#f5f9fd] p-4"><img src={iconSrc} alt="" className="h-12 w-12 object-contain" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#263c50]">{installer.file}</p><p className="mt-1 text-xs text-[#8294a3]">{appName} · {installer.size}</p></div></div><p className="mt-5 text-sm text-[#4d6576]">请点击虚拟运行，继续查看。</p></div><div className="flex justify-end gap-3 border-t border-[#e6edf3] bg-[#f8fbfd] px-5 py-3"><button onClick={onDismiss} className="px-3 py-2 text-sm text-[#708595]">取消</button><button onClick={onRun} className="rounded-[4px] bg-[#2457e7] px-5 py-2 text-sm text-white">虚拟运行</button></div></section></div>;
}

function ControlOutcomePanel({ appName, onClose, onContinue }: { appName: string; onClose: () => void; onContinue: () => void }) {
  return <div className="fixed inset-0 z-[140] grid place-items-center bg-[#102331]/70 px-4"><section className="w-full max-w-[780px] overflow-hidden rounded-[6px] border border-[#27475b] bg-[#0e202d] shadow-[0_25px_80px_rgba(0,0,0,.5)]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><div><p className="font-mono text-[10px] tracking-[.15em] text-[#8ebbd1]">TRAINING VIEW / PRESET DATA</p><h3 className="mt-1 text-base font-medium text-white">预置受控主机信息</h3></div><button onClick={onClose} className="text-white/55 hover:text-white"><X className="h-5 w-5" /></button></div><div className="grid gap-4 p-5 md:grid-cols-[1.3fr_.7fr]"><div className="rounded-[4px] border border-white/10 bg-[#16384d]"><div className="flex items-center gap-1.5 border-b border-white/10 bg-[#0b1d29] px-3 py-2"><span className="h-2 w-2 rounded-full bg-[#ee7269]" /><span className="h-2 w-2 rounded-full bg-[#edc466]" /><span className="h-2 w-2 rounded-full bg-[#72cba8]" /><span className="ml-2 font-mono text-[9px] text-white/45">HOST DESKTOP · 203.0.113.42</span></div><div className="min-h-[210px] bg-[radial-gradient(circle_at_70%_20%,#3a7890_0%,#1d4d62_40%,#102c3e_100%)] p-5"><div className="grid grid-cols-4 gap-4">{["项目计划书","客户资料","周报汇总","备份索引"].map((name, index) => <div key={name} className="text-center"><span className={`mx-auto grid h-10 w-10 place-items-center rounded-md ${index === 1 ? "bg-[#c85850]" : "bg-[#e9f3ef]"} ${index === 1 ? "text-white" : "text-[#207363]"}`}>{index === 1 ? <TriangleAlert className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><span className="mt-1 block truncate text-[9px] text-white/80">{name}</span></div>)}</div><p className="mt-9 rounded bg-white/10 px-3 py-2 font-mono text-[10px] text-white/60">预置桌面与文件视图</p></div></div><div className="rounded-[4px] border border-white/10 bg-[#0a1a25] p-4"><p className="font-mono text-[10px] tracking-[.12em] text-[#89bfd6]">SESSION DETAILS</p><div className="mt-4 space-y-3 text-sm text-white/70"><p>主机标识：TRAINING-PC-024</p><p>地址：203.0.113.42</p><p>状态：预置数据展示</p><p>软件：{appName}</p></div><div className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-white/55">此处为网页中的预置教学数据，用于说明未知程序可能造成的主机信息暴露。</div></div></div><div className="flex items-center justify-between border-t border-white/10 bg-[#0b1b27] px-5 py-3"><p className="text-sm text-white/65">已进入风险后果展示，请继续查看防范建议。</p><button onClick={onContinue} className="rounded-[4px] bg-[#2d73e7] px-4 py-2 text-sm text-white">查看防范建议</button></div></section></div>;
}

function PreventionPanel({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-[140] grid place-items-center bg-[#102331]/65 px-4"><section className="w-full max-w-[680px] overflow-hidden rounded-[6px] bg-white shadow-[0_24px_70px_rgba(14,39,65,.35)]"><div className="border-b border-[#dce8f2] bg-[#f3f9ff] px-6 py-4"><p className="font-mono text-[10px] tracking-[.14em] text-[#5283a5]">防范要点</p><h3 className="mt-1 text-xl font-medium text-[#263c50]">为什么会遇到风险</h3></div><div className="grid gap-3 p-6 sm:grid-cols-3">{[["核验域名", "检查完整域名，警惕相似拼写和异常后缀。"],["核验地址", "核对 IP 地址归属与访问路径，不通过陌生跳转下载。"],["核验软件", "从正规渠道获取软件，核验发布者与数字签名。"]].map(([title, detail], index) => <div key={title} className="rounded-[4px] border border-[#dbe7ef] bg-[#f9fcff] p-4"><p className="font-mono text-[10px] text-[#2d73e7]">0{index + 1}</p><p className="mt-2 text-sm font-medium text-[#2d4357]">{title}</p><p className="mt-2 text-xs leading-5 text-[#6b8090]">{detail}</p></div>)}</div><div className="flex justify-end border-t border-[#e4edf3] bg-[#f8fbfd] px-6 py-3"><button onClick={onClose} className="rounded-[4px] bg-[#2457e7] px-5 py-2 text-sm text-white">重新体验</button></div></section></div>;
}

function DownloadMarket({ onDownload, onInspect }: { onDownload: () => void; onInspect: () => void }) {
  const categories = ["办公协作", "浏览器", "图像工具", "安全防护", "压缩工具", "系统工具", "远程工具", "开发工具"];
  const catalog = [["云协办公", "办公协作", "发布者已验证", "bg-[#e7f1ff] text-[#3f75c6]"], ["迅写会议", "效率工具", "官方通道", "bg-[#e8f6f1] text-[#237c68]"], ["文档助手", "办公工具", "签名已验证", "bg-[#fff3df] text-[#bd7720]"], ["浏览通", "浏览器", "版本 9.2.1", "bg-[#f0ebfb] text-[#7557ab]"]];
  return <div className="market-shell overflow-hidden rounded-[18px] border border-[#d9e5e1] bg-white shadow-[0_16px_34px_rgba(21,62,74,.06)]"><div className="flex h-14 items-center justify-between border-b border-[#e7eeeb] px-4 sm:px-6"><div className="flex items-center gap-5"><div className="flex items-center gap-2 text-[#256172]"><span className="grid h-7 w-7 place-items-center rounded-md bg-[#15a47f] text-white"><Download className="h-4 w-4" /></span><span className="font-sans text-sm font-bold">数安软件市场</span><span className="hidden border-l border-[#e1e9e5] pl-5 font-mono text-[9px] tracking-[.12em] text-[#809399] sm:block">SOFTWARE CATALOG · DEMO</span></div><nav className="hidden items-center gap-5 font-sans text-xs text-[#536d74] md:flex"><span className="font-bold text-[#167e66]">首页</span><span>分类</span><span>热门排行</span><span>装机清单</span></nav></div><div className="hidden items-center gap-2 rounded-md border border-[#dce6e2] bg-[#fafcfb] px-3 py-1.5 text-[#8a9da1] sm:flex"><Search className="h-3.5 w-3.5" /><span className="font-sans text-xs">搜索软件名称</span><span className="ml-2 rounded bg-[#18a37e] px-2 py-1 font-sans text-[10px] font-bold text-white">搜索</span></div></div><div className="grid place-items-center border-b border-[#dbe9e4] bg-[linear-gradient(115deg,#edf7f4_0%,#e2f2ee_45%,#f7fbfa_100%)] px-5 py-7 text-center sm:py-9"><p className="font-mono text-[10px] tracking-[.14em] text-[#5c8883]">SAFE SOFTWARE MARKET · TRAINING VIEW</p><h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#23566a] sm:text-3xl">常用工具，一站核验与获取</h3><p className="mt-2 font-sans text-xs text-[#668187]">请选择来源、发布者与下载方式均可被核验的软件。</p></div><div className="grid lg:grid-cols-[174px_minmax(0,1fr)_168px]"><aside className="border-b border-[#e4ece8] bg-[#fbfcfb] p-4 lg:min-h-[335px] lg:border-b-0 lg:border-r"><div className="flex items-center justify-between"><p className="font-sans text-sm font-bold text-[#315766]">软件分类</p><span className="font-mono text-[9px] text-[#8b9ea1]">MORE ›</span></div><div className="mt-3 grid grid-cols-2 gap-y-1 lg:grid-cols-1">{categories.map((item, index) => <button key={item} onClick={index === 0 ? onInspect : undefined} className={`flex items-center gap-2 rounded-md px-2 py-2 text-left font-sans text-xs transition ${index === 0 ? "bg-[#e3f2ec] font-bold text-[#1c7767]" : "text-[#637b82] hover:bg-[#eef5f1]"}`}><span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-[#19a17e]" : "bg-[#c5d5d0]"}`} />{item}</button>)}</div></aside><section className="min-w-0 p-4 sm:p-5"><div className="flex items-center justify-between border-b border-[#e6eeea] pb-3"><div><p className="font-sans text-sm font-bold text-[#325867]">常用软件</p><p className="mt-1 font-mono text-[9px] tracking-[.1em] text-[#8a9ea1]">VERIFIED PUBLISHER CATALOG</p></div><span className="rounded-full bg-[#e9f5f0] px-2.5 py-1 font-mono text-[9px] text-[#217666]">4 项可核验</span></div><div className="grid grid-cols-2 divide-x divide-y divide-[#edf1ef] border-b border-[#edf1ef]">{catalog.map(([name, category, note, tone], index) => <button key={name} onClick={index === 0 ? onInspect : undefined} className="group min-w-0 px-3 py-4 text-left transition hover:bg-[#f7fbf8]"><span className={`grid h-8 w-8 place-items-center rounded-lg font-mono text-xs font-bold ${tone}`}>{name.slice(0, 1)}</span><p className="mt-2 truncate font-sans text-xs font-bold text-[#315765]">{name}</p><p className="mt-1 truncate font-sans text-[10px] text-[#789096]">{category} · {note}</p></button>)}</div><div className="mt-4 rounded-xl border border-[#ead29a] bg-[#fffdf7] p-3"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fff0c7] text-[#b37d21]"><TriangleAlert className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-sans text-xs font-bold text-[#5d4a20]">协作工具加速下载</p><span className="rounded bg-[#ffe9b4] px-1.5 py-0.5 font-mono text-[9px] text-[#93641a]">推广</span></div><p className="mt-1 font-sans text-[10px] leading-5 text-[#8b774d]">请求额外安装器与异常权限。该入口用于训练识别风险信号。</p></div><button onClick={onDownload} className="shrink-0 rounded-md bg-[#24a772] px-3 py-2 font-sans text-xs font-bold text-white transition hover:bg-[#148561] active:scale-[.98]">高速下载</button></div></div></section><aside className="border-t border-[#e4ece8] bg-[#fbfcfb] p-4 lg:border-l lg:border-t-0"><div className="flex items-center justify-between"><p className="font-sans text-sm font-bold text-[#315766]">热度排行</p><span className="font-mono text-[9px] text-[#8b9ea1]">TOP 05</span></div><ol className="mt-3 space-y-3">{["云协办公", "迅写会议", "浏览通", "文档助手", "格式转换器"].map((item, index) => <li key={item} className="flex items-center gap-2"><span className={`grid h-5 w-5 place-items-center rounded text-[10px] font-bold ${index < 3 ? "bg-[#dff0e9] text-[#177762]" : "bg-[#edf1ef] text-[#84989b]"}`}>{index + 1}</span><span className="truncate font-sans text-xs text-[#5b747c]">{item}</span></li>)}</ol><div className="mt-5 border-t border-[#e5ece9] pt-3 font-sans text-[10px] leading-5 text-[#7c9297]">本页为原创教学仿真；高风险下载只提供无害素材。</div></aside></div></div>;
}

function SoftwareSource({ name, tag, icon, detail, action, onClick, good, risk }: { name: string; tag: string; icon: React.ReactNode; detail: string; action: string; onClick: () => void; good?: boolean; risk?: boolean }) {
  return <div className={`relative rounded-2xl border p-4 ${risk ? "border-[#ead09b] bg-[#fffdf7]" : good ? "border-[#b8d8ce] bg-[#f8fcfa]" : "border-[#dde5e1] bg-white"}`}><div className="flex items-start justify-between gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${risk ? "bg-[#fff0c7] text-[#a7781a]" : good ? "bg-[#e1f3ec] text-[#197b6d]" : "bg-[#eff2ef] text-[#74888c]"}`}>{icon}</span><span className={`rounded-full px-2 py-1 font-mono text-[10px] ${risk ? "bg-[#fff2cf] text-[#9c7024]" : good ? "bg-[#e2f3ed] text-[#207364]" : "bg-[#eef2f0] text-[#71858a]"}`}>{tag}</span></div><p className="mt-5 font-sans text-sm font-bold text-[#264e5d]">{name}</p><p className="mt-2 min-h-10 font-sans text-xs leading-5 text-[#73858a]">{detail}</p><button onClick={onClick} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-sans text-xs font-bold transition active:scale-[0.98] ${risk ? "bg-[#f4ca61] text-[#624811] hover:bg-[#eeb942]" : "bg-[#eaf1ee] text-[#315867] hover:bg-[#dbeae4]"}`}>{action}<ChevronRight className="h-3.5 w-3.5" /></button></div>;
}

/** 设计提醒：邮件场景采用企业办公软件的紧凑比例；移除教学任务卡与结果区，仅保留邮件详情和附件下载动作。 */
function MailScenario({ onLeave, onReset, onAudioAfterCurrent }: { onLeave: () => void; onReset: () => void; onAudioAfterCurrent: (step: number) => void }) {
  const downloadAttachment = () => {
    downloadMappedTrainingAsset(MAIL_SCENARIO_CONFIG.inbox.attachment.assetUrl, MAIL_SCENARIO_CONFIG.inbox.attachment.downloadName);
    onAudioAfterCurrent(1);
  };
  return <div className="relative z-10 min-h-screen bg-[#f3f6f8] pt-0"><header className="border-b border-[#d7e0e7] bg-white/95 px-4 shadow-[0_1px_0_rgba(40,70,96,.04)] backdrop-blur sm:px-6 lg:px-8"><div className="mx-auto flex h-[66px] max-w-[1560px] items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onLeave} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d9e2e9] bg-white text-[#4f687e] transition hover:border-[#8ca8bb] hover:bg-[#f5f9fc] active:scale-[.97]" aria-label="返回体验中心"><ArrowLeft className="h-4 w-4" /></button><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1f639e] text-white shadow-[0_6px_14px_rgba(31,99,158,.22)]"><Mail className="h-[18px] w-[18px]" /></span><div className="min-w-0"><p className="truncate font-sans text-[15px] font-bold text-[#23425d]">企业邮箱系统</p><p className="mt-0.5 font-mono text-[9px] tracking-[.13em] text-[#8397a8]">MAIL WORKSPACE</p></div></div><button type="button" onClick={onReset} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-[#d8e2e9] bg-white px-3.5 font-sans text-xs font-semibold text-[#526a7d] transition hover:border-[#9ab0c1] hover:bg-[#f6f9fb] active:scale-[.97]"><RotateCcw className="h-3.5 w-3.5" />一键重置</button></div></header><main className="mx-auto max-w-[1560px] px-3 py-4 sm:px-5 lg:px-7 lg:py-6"><ConfigurableMailDetail onAttachment={downloadAttachment} /></main></div>;
}

function MailWorkbench({ onOpen }: { onOpen: () => void }) {
  const routineMail = [["行政服务中心", "周例会提醒：会议室调整", "10:05"], ["IT 服务台", "系统维护通知", "昨日"], ["项目管理办公室", "周报收集", "昨日"], ["人事服务", "假期余额提醒", "周二"]];
  return <div className="mail-client min-h-[510px] overflow-hidden rounded-[18px] border border-[#cddbd7] bg-white shadow-[0_16px_34px_rgba(21,62,74,.07)]"><div className="flex items-center justify-between border-b border-[#dce7e3] bg-[#f7faf8] px-4 py-3 sm:px-5"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#21637c] text-white"><Mail className="h-4 w-4" /></span><div><p className="font-sans text-sm font-bold text-[#1d4356]">华东数字服务中心</p><p className="font-mono text-[9px] tracking-[.11em] text-[#7c9297]">ENTERPRISE MAIL · DEMO</p></div></div><div className="hidden items-center gap-3 font-sans text-xs text-[#6a8288] sm:flex"><span>通讯录</span><span>日程</span><span className="rounded-full border border-[#d5e3dd] bg-white px-2.5 py-1">演示账号</span></div></div><div className="grid md:grid-cols-[184px_minmax(0,1fr)]"><aside className="border-b border-[#e2ebe7] bg-[#f8faf9] p-4 md:min-h-[455px] md:border-b-0 md:border-r"><button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#28728b] px-3 py-2.5 font-sans text-xs font-bold text-white shadow-sm"><Mail className="h-3.5 w-3.5" /> 写邮件</button><div className="mt-5 border-b border-[#e4ece8] pb-4 font-sans text-xs text-[#607980]"><p className="rounded-md bg-[#dfeeed] px-3 py-2 font-bold text-[#1d7165]">收件箱 <span className="float-right rounded-full bg-[#1d8e78] px-1.5 py-0.5 text-[9px] text-white">1</span></p><p className="px-3 py-2">重要邮件</p><p className="px-3 py-2">草稿箱 <span className="float-right text-[#92a3a6]">2</span></p><p className="px-3 py-2">已发送</p><p className="px-3 py-2">已删除</p></div><div className="mt-4 font-mono text-[9px] tracking-[.12em] text-[#8c9da0]">个人文件夹</div><p className="mt-2 px-3 font-sans text-xs text-[#72868b]">项目资料</p></aside><div className="min-w-0"><div className="flex items-center justify-between border-b border-[#e1eae6] px-4 py-3"><div className="flex items-center gap-3"><input aria-label="搜索邮件" className="w-40 rounded-md border border-[#d6e2de] bg-[#fafcfa] px-3 py-1.5 font-sans text-xs text-[#6e8389] outline-none focus:border-[#579a8c]" placeholder="搜索邮件" readOnly /><span className="hidden font-mono text-[9px] tracking-[.1em] text-[#8fa0a3] sm:inline">邮件 1-5 / 5</span></div><div className="flex gap-2 text-[#7b8f93]"><MoreHorizontal className="h-4 w-4" /><Search className="h-4 w-4" /></div></div><div className="grid grid-cols-[minmax(0,1fr)_84px] gap-3 border-b border-[#dbe6e1] bg-[#f9fbfa] px-4 py-2.5 font-mono text-[9px] tracking-[.1em] text-[#899ca0]"><span>发件人 / 主题</span><span className="text-right">时间</span></div><button onClick={onOpen} className="grid w-full grid-cols-[minmax(0,1fr)_84px] gap-3 border-b border-[#e2eae6] bg-[#fffdf6] px-4 py-4 text-left transition hover:bg-[#fff8df]"><span className="min-w-0"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e1a52d]" /><b className="truncate font-sans text-sm text-[#244c5b]">采购协作组</b><span className="rounded bg-[#fff0c8] px-1.5 py-0.5 font-mono text-[9px] text-[#9a701f]">外部</span></span><span className="mt-1 block truncate font-sans text-xs text-[#567077]">请在今日 16:00 前确认：会议资料补正</span><span className="mt-1 flex items-center gap-1 font-mono text-[10px] text-[#9b7b42]"><FileText className="h-3 w-3" /> 会议资料补正.pdf · 412 KB</span></span><span className="pt-0.5 text-right font-mono text-[10px] text-[#819499]">09:42</span></button>{routineMail.map(([sender, subject, time]) => <div key={sender} className="grid grid-cols-[minmax(0,1fr)_84px] gap-3 border-b border-[#edf1ee] px-4 py-3.5"><span className="min-w-0"><span className="block truncate font-sans text-xs font-medium text-[#526c74]">{sender}</span><span className="mt-1 block truncate font-sans text-[11px] text-[#829599]">{subject}</span></span><span className="text-right font-mono text-[10px] text-[#9aa9ac]">{time}</span></div>)}</div></div><div className="border-t border-[#e3ece8] bg-[#fafcfb] px-4 py-2.5 font-sans text-[10px] text-[#7b9196]">提示：请通过完整地址、回复地址、附件与业务流程核验外部邮件。</div></div>;
}

function MailDetail({ onReport, onAttachment }: { onReport: () => void; onAttachment: () => void }) {
  return <div className="workbench overflow-hidden"><div className="flex items-center justify-between border-b border-[#e2eae6] px-4 py-3 sm:px-6"><button className="inline-flex items-center gap-2 font-sans text-xs font-bold text-[#55737c]"><ArrowLeft className="h-3.5 w-3.5" /> 收件箱</button><div className="flex gap-2"><button onClick={onReport} className="rounded-lg border border-[#b5d4ca] bg-[#edf7f2] px-3 py-1.5 font-sans text-xs font-bold text-[#217266]">举报可疑邮件</button><button className="grid h-7 w-7 place-items-center rounded-lg border border-[#dce5e1] text-[#71858b]"><MoreHorizontal className="h-4 w-4" /></button></div></div><div className="p-5 sm:p-7"><div className="flex flex-col gap-5 border-b border-[#e6ede9] pb-5 sm:flex-row sm:justify-between"><div><h2 className="font-serif text-2xl font-bold text-[#193f51]">请在今日 16:00 前确认：会议资料补正</h2><div className="mt-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7e6c3] font-sans text-xs font-bold text-[#8a6520]">采</span><div><p className="font-sans text-sm font-bold text-[#315563]">采购协作组 <span className="ml-1 font-normal text-[#839599]">&lt;notice@procure-service.example-training.cn&gt;</span></p><p className="mt-1 font-mono text-[10px] text-[#8b9a9e]">回复至：office-confirm@procure-service-cn.example-training.cn</p></div></div></div><span className="self-start rounded-full bg-[#fff2d0] px-3 py-1.5 font-mono text-[10px] text-[#9b7024]">发现 3 处可核验线索</span></div><div className="max-w-3xl pt-6 font-sans text-sm leading-7 text-[#4e6872]"><p>各位同事：</p><p className="mt-4">因会议安排调整，请务必在今日 16:00 前打开附件确认。若未及时处理，将影响本月项目交付。</p><p className="mt-4">请直接在附件中完成确认。</p><p className="mt-5">采购协作组</p></div><div className="mt-7 rounded-2xl border border-[#ead39c] bg-[#fffdf7] p-3 sm:max-w-md"><button onClick={onAttachment} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#fff5da]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0c5] text-[#ac7d25]"><FileText className="h-5 w-5" /></span><span><span className="block font-sans text-sm font-bold text-[#315260]">会议资料补正.pdf</span><span className="mt-1 block font-mono text-[10px] text-[#8c9a9b]">412 KB · 来自外部邮件</span></span><ChevronRight className="ml-auto h-4 w-4 text-[#aa7e2a]" /></button></div><div className="mt-7 flex items-start gap-3 rounded-xl bg-[#eef5f1] p-4 text-[#3e6a62]"><FileSearch className="mt-0.5 h-4 w-4 shrink-0" /><p className="font-sans text-sm leading-6">请点击“举报可疑邮件”或附件，在下一步查看不同选择的安全含义。附件点击只触发页面内仿真，不会下载或打开真实文件。</p></div></div></div>;
}

/** 设计提醒：原创企业邮箱教学界面；正文与附件均由 mailScenario.ts 的显式配置驱动。 */
function LegacyConfigurableMailDetail({ onReport, onAttachment }: { onReport: () => void; onAttachment: () => void }) {
  const { inbox } = MAIL_SCENARIO_CONFIG;
  return <div className="mail-client overflow-x-auto border border-[#cad8e8] bg-white shadow-[0_18px_38px_rgba(35,72,112,.10)]"><div className="min-w-[760px]"><MailDesktopHeader activeTab="邮件详情" /><div className="flex min-h-[520px]"><MailDesktopSidebar /><section className="min-w-0 flex-1"><div className="flex items-center gap-2 border-b border-[#dfe7f0] bg-[#f8fafc] px-4 py-2.5"><button className="inline-flex items-center gap-1 border border-[#d5e0ec] bg-white px-3 py-1.5 font-sans text-xs text-[#526a83]"><ArrowLeft className="h-3.5 w-3.5" /> 返回</button><button className="border border-[#d5e0ec] bg-white px-3 py-1.5 font-sans text-xs text-[#526a83]">回复</button><button className="border border-[#d5e0ec] bg-white px-3 py-1.5 font-sans text-xs text-[#526a83]">转发</button><button onClick={onReport} className="border border-[#d3a9a4] bg-[#fff8f7] px-3 py-1.5 font-sans text-xs font-semibold text-[#a74a42]">举报</button><button className="border border-[#d5e0ec] bg-white px-3 py-1.5 font-sans text-xs text-[#526a83]">更多 <ChevronDown className="ml-1 inline h-3 w-3" /></button><span className="ml-auto font-mono text-[10px] text-[#8a9aab]">邮件详情</span></div><div className="p-5"><h2 className="font-sans text-lg font-bold text-[#203f61]">{inbox.subject}</h2><div className="mt-4 grid max-w-4xl grid-cols-[70px_minmax(0,1fr)] gap-y-2 border-y border-[#e4eaf1] py-4 font-sans text-xs"><span className="text-[#8396aa]">发件人：</span><span className="text-[#3d5975]">{inbox.senderName} &lt;{inbox.senderAddress}&gt;</span><span className="text-[#8396aa]">收件人：</span><span className="text-[#3d5975]">{MAIL_SCENARIO_CONFIG.accountAddress}</span><span className="text-[#8396aa]">时间：</span><span className="text-[#3d5975]">{inbox.receivedDate}</span><span className="text-[#8396aa]">回复至：</span><span className="text-[#a66b37]">{inbox.replyTo}</span></div><div className="mt-5 max-w-4xl font-sans text-sm leading-7 text-[#405e78]">{inbox.body.map((paragraph, index) => <p key={`${paragraph}-${index}`} className={index === 0 ? "" : "mt-4"}>{paragraph}</p>)}</div><div className="mt-8 max-w-4xl border border-[#dfe7f0] bg-[#f8fafc]"><div className="border-b border-[#e2e9f1] px-4 py-2 font-mono text-[10px] tracking-[.1em] text-[#627e9c]">附件 (1)</div><button onClick={onAttachment} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[#eef5ff]"><span className="grid h-10 w-10 place-items-center rounded-sm bg-[#e8f0fd] text-[#3c75c3]"><FileText className="h-5 w-5" /></span><span><span className="block font-sans text-sm font-semibold text-[#2e557e]">{inbox.attachment.displayName}</span><span className="mt-1 block font-mono text-[10px] text-[#8295a8]">{inbox.attachment.metadata} · 教学资料</span></span><ChevronRight className="ml-auto h-4 w-4 text-[#6482a1]" /></button></div><div className="mt-5 flex items-start gap-3 border-l-2 border-[#7ba8d9] bg-[#f3f8fe] px-4 py-3 text-[#55718b]"><FileSearch className="mt-0.5 h-4 w-4 shrink-0" /><p className="font-sans text-xs leading-6">附件下载仅使用邮件配置中固定映射的非可执行教学资料。你可以替换显示文字与静态资源地址，但不能连接本机路径或可执行文件。</p></div></div></section></div></div></div>;
}

/** 设计提醒：邮件详情页遵循真实企业邮箱的头部、文件夹栏、工具条和阅读区比例；不显示培训结果模块。 */
function ConfigurableMailDetail({ onAttachment }: { onAttachment: () => void }) {
  const { inbox } = MAIL_SCENARIO_CONFIG;
  const passiveAction = () => undefined;

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#d6e0e7] bg-white shadow-[0_16px_36px_rgba(33,65,90,.10)]">
      <div className="flex min-h-[calc(100vh-154px)] min-h-[640px] flex-col">
        <div className="flex min-h-[56px] items-center gap-4 border-b border-[#dce5ec] bg-white px-4 sm:px-5"><div className="flex shrink-0 items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#e6f0fb] text-[#2668a9]"><Mail className="h-4 w-4" /></span><div><p className="font-sans text-sm font-bold tracking-tight text-[#224968]">{MAIL_SCENARIO_CONFIG.productName}</p><p className="mt-0.5 font-mono text-[8px] tracking-[.12em] text-[#91a1af]">{MAIL_SCENARIO_CONFIG.productSubtitle}</p></div></div><nav className="hidden items-center gap-5 font-sans text-sm text-[#5c7183] lg:flex"><button type="button" onClick={passiveAction} className="font-semibold text-[#236bb1]">收件箱</button><button type="button" onClick={passiveAction}>通讯录</button><button type="button" onClick={passiveAction}>日程</button><button type="button" onClick={passiveAction}>协作空间</button></nav><button type="button" onClick={passiveAction} className="ml-auto hidden w-[220px] items-center gap-2 rounded-md border border-[#d7e1e8] bg-[#f7f9fb] px-3 py-2 text-left text-[#9aa8b5] sm:flex"><Search className="h-3.5 w-3.5" /><span className="font-sans text-xs">搜索邮件</span></button><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e7f1fb] font-mono text-[10px] font-bold text-[#2c6cac]">林</span></div>
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[204px] shrink-0 border-r border-[#dce5ec] bg-[#f8fafc] p-3 lg:block"><button type="button" onClick={passiveAction} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#367fc7] px-3 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_4px_10px_rgba(54,127,199,.18)]"><Mail className="h-4 w-4" />写邮件</button><div className="mt-4 space-y-0.5">{[["收件箱", true, "1"], ["星标邮件", false, ""], ["待办邮件", false, ""], ["草稿箱", false, "2"], ["已发送", false, ""], ["已删除", false, ""]].map(([label, active, count], index) => <button type="button" key={`${String(label)}-${index}`} onClick={passiveAction} className={`flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left font-sans text-xs transition ${active ? "border-[#4a8fe0] bg-[#eaf3ff] font-semibold text-[#266ab0]" : "border-transparent text-[#5e7385] hover:bg-[#f0f5f9]"}`}><Inbox className="h-3.5 w-3.5" />{String(label)}{Boolean(count) && <span className="ml-auto rounded-full bg-[#4a8fe0] px-1.5 py-0.5 font-mono text-[8px] text-white">{String(count)}</span>}</button>)}</div><div className="mt-6 border-t border-[#e1e8ee] pt-4"><p className="px-3 font-mono text-[9px] tracking-[.12em] text-[#90a0ae]">个人文件夹</p><button type="button" onClick={passiveAction} className="mt-2 flex w-full items-center gap-2 px-3 py-2 font-sans text-xs text-[#5e7385] hover:bg-[#f0f5f9]"><FileText className="h-3.5 w-3.5" />项目资料</button></div></aside>
          <section className="min-w-0 flex-1 bg-white"><div className="flex min-h-[48px] items-center gap-2 border-b border-[#e0e7ed] bg-[#fbfcfd] px-3 sm:px-5"><button type="button" onClick={passiveAction} className="inline-flex items-center gap-1 rounded border border-[#d8e2e9] bg-white px-2.5 py-1.5 font-sans text-xs text-[#526b80]"><ArrowLeft className="h-3.5 w-3.5" />返回</button>{["回复", "转发", "删除", "标记为"].map((label) => <button type="button" onClick={passiveAction} key={label} className="hidden rounded border border-[#d8e2e9] bg-white px-2.5 py-1.5 font-sans text-xs text-[#526b80] sm:block">{label}</button>)}<button type="button" onClick={passiveAction} className="hidden rounded border border-[#d8e2e9] bg-white px-2.5 py-1.5 font-sans text-xs text-[#526b80] md:block">更多 <ChevronDown className="ml-1 inline h-3 w-3" /></button><span className="ml-auto font-mono text-[10px] text-[#90a0ae]">邮件详情</span></div><article className="mx-auto w-full max-w-[1060px] px-5 py-7 sm:px-8 sm:py-9"><div className="border-b border-[#e3e9ee] pb-5"><h1 className="font-sans text-[21px] font-semibold leading-8 text-[#263f55] sm:text-[24px]">{inbox.subject}</h1><div className="mt-5 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f0fa] font-sans text-sm font-semibold text-[#326da9]">海</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><button type="button" onClick={passiveAction} className="font-sans text-sm font-semibold text-[#2f4d67]">{inbox.senderName}</button><span className="font-sans text-xs text-[#7e90a0]">&lt;{inbox.senderAddress}&gt;</span></div><div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-[#778b9d]"><span>收件人：{MAIL_SCENARIO_CONFIG.accountAddress}</span><span>时间：{inbox.receivedDate}</span></div><button type="button" onClick={passiveAction} className="mt-1.5 font-sans text-xs text-[#a06a35]">回复至：{inbox.replyTo}</button></div><button type="button" onClick={passiveAction} className="grid h-8 w-8 shrink-0 place-items-center rounded border border-[#dce5eb] text-[#71879a]" aria-label="更多邮件操作"><MoreHorizontal className="h-4 w-4" /></button></div></div><div className="max-w-[780px] pt-7 font-sans text-[15px] leading-8 text-[#405b72]">{inbox.body.map((paragraph, index) => <p key={`${paragraph}-${index}`} className={index === 0 ? "" : "mt-4"}>{paragraph}</p>)}</div><section className="mt-9 max-w-[720px] border border-[#dbe4eb] bg-[#fbfcfd]"><div className="border-b border-[#e2e9ee] px-4 py-2.5 font-sans text-xs text-[#687f93]">附件（1）</div><button type="button" onClick={onAttachment} className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[#f1f7fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b8fd3] focus-visible:ring-inset"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#e7f0fb] text-[#3378bd]"><FileText className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block truncate font-sans text-sm font-semibold text-[#315675]">{inbox.attachment.displayName}</span><span className="mt-1 block font-mono text-[10px] text-[#8a9baa]">{inbox.attachment.metadata}</span></span><Download className="h-4 w-4 shrink-0 text-[#7b96ad] transition group-hover:text-[#357ac0]" /></button></section></article></section>
        </div>
      </div>
    </div>
  );
}

function RansomwareScenario({ step, goTo }: { step: number; goTo: (step: number) => void }) {
  if (step === 0) return <VirtualDesktop stage="normal" action={() => goTo(1)} />;
  if (step === 1) return <VirtualDesktop stage="alert" action={() => goTo(2)} />;
  if (step === 2) return <VirtualDesktop stage="contained" action={() => goTo(3)} />;
  return <ReviewPanel title="虚拟勒索事件已完成处置" eyebrow="终端已隔离 · 预案已启动" points={["先隔离终端，避免影响扩散到其他业务资源", "及时报告并保留现场，避免自行反复尝试", "依据预案使用离线备份和系统镜像进行专业恢复"]} onReset={() => goTo(0)} />;
}

function VirtualDesktop({ stage, action }: { stage: "normal" | "alert" | "contained"; action: () => void }) {
  const alert = stage === "alert";
  const contained = stage === "contained";
  return <div className="virtual-desktop overflow-hidden"><div className="flex h-9 items-center justify-between bg-[#112d3d] px-3 text-white/70"><span className="font-mono text-[10px] tracking-[0.12em]">VIRTUAL BUSINESS DESKTOP · TRAINING ONLY</span><div className="flex gap-2"><span className="h-2 w-2 rounded-full bg-white/30" /><span className="h-2 w-2 rounded-full bg-white/30" /></div></div><div className={`relative min-h-[435px] overflow-hidden bg-[radial-gradient(circle_at_70%_20%,#25576c_0%,#173d50_38%,#102f40_100%)] p-5 sm:p-7 ${alert ? "desktop-alert" : ""}`}><div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:32px_32px]" /><div className="relative mb-5 flex items-center justify-between border-b border-white/10 pb-3"><div><p className="font-sans text-sm font-bold text-white">华东数字服务中心 · 业务终端</p><p className="mt-1 font-mono text-[9px] tracking-[.12em] text-white/45">DEVICE ID: EDSC-WKS-024 · STANDARD USER</p></div><div className="flex items-center gap-2 rounded-md bg-white/8 px-2.5 py-1.5 font-mono text-[9px] text-white/65"><ShieldCheck className="h-3 w-3 text-[#87d8c6]" /> 终端防护在线</div></div><div className="relative grid grid-cols-3 gap-4 sm:grid-cols-5"><DesktopFile name="项目计划书" normal /><DesktopFile name="供应商对账资料" locked={alert || contained} highlighted={!alert && !contained} onClick={!alert && !contained ? action : undefined} /><DesktopFile name="周报汇总" locked={alert || contained} /><DesktopFile name="备份索引" normal /><DesktopFile name="客户资料" locked={alert || contained} /></div><div className="relative mt-12 rounded-2xl border border-white/15 bg-[#f7f9f8]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,.25)] sm:max-w-2xl"><div className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${alert ? "bg-[#fff0ea] text-[#c55448]" : contained ? "bg-[#e1f2eb] text-[#1d8375]" : "bg-[#e6f1ec] text-[#1d8375]"}`}>{alert ? <TriangleAlert className="h-5 w-5" /> : contained ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span><div><p className="font-sans text-sm font-bold text-[#1d4051]">{alert ? "终端防护中心：检测到异常文件访问" : contained ? "终端已进入虚拟隔离状态" : "供应商对账资料已就绪"}</p><p className="mt-1 font-sans text-xs leading-5 text-[#63808a]">{alert ? "多个虚拟文件出现不可访问状态。请优先阻断可能的扩散路径。" : contained ? "网络通道已断开，下一步应报告安全人员并依预案恢复。" : "请双击高亮资料，开始虚拟业务流程。"}</p></div></div>{alert && <button onClick={action} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c55349] px-4 py-2.5 font-sans text-sm font-bold text-white transition hover:bg-[#a94139] active:scale-[0.98]"><WifiOff className="h-4 w-4" /> 立即执行虚拟隔离</button>}{contained && <button onClick={action} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123f5b] px-4 py-2.5 font-sans text-sm font-bold text-white transition hover:bg-[#175774] active:scale-[0.98]"><ClipboardCheck className="h-4 w-4" /> 启动恢复与复盘</button>}</div>{alert && <div className="absolute bottom-0 left-0 right-0 bg-[#4b1922]/95 p-3 text-center font-mono text-[10px] tracking-[0.12em] text-[#ffd4cc]">SIMULATED RANSOM NOTICE · NO REAL FILES ARE AFFECTED</div>}</div><div className="flex items-center gap-3 bg-[#0f2633] px-4 py-2 text-white/65"><span className="grid h-6 w-6 place-items-center rounded bg-white/10"><Network className="h-3.5 w-3.5" /></span><span className="font-mono text-[10px]">{contained ? "NETWORK: ISOLATED" : alert ? "NETWORK: AT RISK" : "NETWORK: CONNECTED"}</span><span className="ml-auto font-mono text-[10px]">09:48</span></div></div>;
}

function DesktopFile({ name, normal, locked, highlighted, onClick }: { name: string; normal?: boolean; locked?: boolean; highlighted?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} disabled={!onClick} className={`group relative flex flex-col items-center rounded-xl p-2 text-center transition ${highlighted ? "bg-white/12 ring-1 ring-[#9fe4d0]/60 hover:bg-white/20" : ""} ${onClick ? "cursor-pointer" : "cursor-default"}`}><span className={`grid h-12 w-12 place-items-center rounded-xl shadow-lg ${locked ? "bg-[#7a8992] text-white" : normal ? "bg-[#e7f2ec] text-[#1a8374]" : "bg-[#e9f1ed] text-[#1a8374]"}`}>{locked ? <LockKeyhole className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span><span className="mt-2 line-clamp-2 font-sans text-[11px] leading-4 text-white drop-shadow">{name}{locked ? ".locked" : ".pdf"}</span>{highlighted && <span className="mt-1 rounded bg-[#9fe4d0] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#143c4b]">点击打开</span>}</button>;
}

function ReviewPanel({ title, eyebrow, points, onReset }: { title: string; eyebrow: string; points: string[]; onReset: () => void }) {
  return <div className="workbench overflow-hidden"><div className="relative bg-[#123f5b] px-6 py-9 text-white sm:px-9"><div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#1d8375]/30" /><p className="relative font-mono text-[10px] tracking-[0.17em] text-[#a2d9cd]">{eyebrow.toUpperCase()}</p><h2 className="relative mt-3 max-w-xl font-serif text-3xl font-bold tracking-tight">{title}</h2><p className="relative mt-3 max-w-xl font-sans text-sm leading-6 text-white/75">本次推演没有保存您的任何选择、成绩或个人信息。您可以直接返回，或重新体验本场景。</p></div><div className="p-5 sm:p-7"><p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#66858a]">带走这三点</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{points.map((point, index) => <div key={point} className="rounded-xl border border-[#dbe5e1] bg-[#f7faf8] p-4"><span className="font-mono text-[10px] text-[#1d8375]">0{index + 1}</span><p className="mt-2 font-sans text-sm leading-6 text-[#405e68]">{point}</p></div>)}</div><button onClick={onReset} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#e3f1ec] px-4 py-3 font-sans text-sm font-bold text-[#1c7466] transition hover:bg-[#cde7dc] active:scale-[0.98]"><RotateCcw className="h-4 w-4" /> 重新体验本场景</button></div></div>;
}
