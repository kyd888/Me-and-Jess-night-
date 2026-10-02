import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sky from "./components/Sky.jsx";
import Progress from "./components/Progress.jsx";
import Intro from "./components/Intro.jsx";
import Chapter from "./components/Chapter.jsx";
import Reveal from "./components/Reveal.jsx";
import Finale from "./components/Finale.jsx";
import Toast from "./components/Toast.jsx";
import HostMode from "./components/HostMode.jsx";
import Handoff from "./components/Handoff.jsx";
import { isHomeScreenApp } from "./lib/share.js";
import { useLongPress } from "./lib/useLongPress.js";
import {
  clearPlan,
  clearProgress,
  clonePlan,
  initialProgress,
  loadPlan,
  loadProgress,
  savePlan,
  saveProgress,
} from "./lib/storage.js";

export default function App() {
  const [plan, setPlan] = useState(loadPlan);
  const [progress, setProgress] = useState(loadProgress);
  const [toast, setToast] = useState(null);
  const [hostOpen, setHostOpen] = useState(() =>
    new URLSearchParams(window.location.search).has("host")
  );
  // Launched from the Home Screen icon (or ?qr) → show the QR for Jess first.
  // Her link carries ?jess, so her phone always goes straight to the night.
  const [handoff, setHandoff] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("jess")) {
      try {
        localStorage.setItem("jess-night:role", "jess");
      } catch {
        /* ignore */
      }
      return false;
    }
    if (params.has("qr")) return true;
    let isJessPhone = false;
    try {
      isJessPhone = localStorage.getItem("jess-night:role") === "jess";
    } catch {
      /* ignore */
    }
    return !isJessPhone && isHomeScreenApp();
  });
  const toastTimer = useRef();

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => savePlan(plan), [plan]);

  const { screen, chapter } = progress;
  const chapters = plan.chapters;
  const current = chapters[chapter];
  const update = (patch) => setProgress((p) => ({ ...p, ...patch }));

  // Sky darkens as the night goes on: 0 golden hour → 4 full night.
  const phase = screen === "intro" ? 0 : screen === "finale" ? 4 : Math.min(chapter + 1, 3);

  // Playful progress: one icon per chapter, plus the finale.
  const activeStep = screen === "finale" ? chapters.length : chapter;
  const stepsDone =
    screen === "finale"
      ? chapters.length + (progress.finaleStep >= 2 ? 1 : 0)
      : chapter + (screen === "reveal" ? 1 : 0);

  const showToast = useCallback((text) => {
    clearTimeout(toastTimer.current);
    setToast({ text, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const start = () => update({ screen: "choose", chapter: 0 });

  const pick = (choiceId) => {
    const pool = plan.quips.filter((q) => !progress.usedQuips.includes(q));
    const options = pool.length ? pool : plan.quips;
    const quip = options[Math.floor(Math.random() * options.length)];
    if (quip) showToast(quip);
    setProgress((p) => ({
      ...p,
      screen: "reveal",
      picks: { ...p.picks, [p.chapter]: choiceId },
      usedQuips: quip ? [...p.usedQuips, quip] : p.usedQuips,
    }));
  };

  const next = () =>
    setProgress((p) =>
      p.chapter < chapters.length - 1
        ? { ...p, screen: "choose", chapter: p.chapter + 1 }
        : { ...p, screen: "finale", finaleStep: 0 }
    );

  // ── Host controls ────────────────────────────────
  const host = {
    skip: () => {
      if (screen === "intro") return start();
      if (screen === "finale") return update({ finaleStep: Math.min(progress.finaleStep + 1, 2) });
      next();
    },
    jump: (target) => {
      if (target === "intro") update({ screen: "intro" });
      else if (target === "finale") update({ screen: "finale", finaleStep: 0 });
      else update({ screen: "choose", chapter: target });
    },
    resetNight: () => {
      clearProgress();
      setProgress({ ...initialProgress });
    },
    restorePlan: () => {
      clearPlan();
      setPlan(clonePlan());
    },
  };

  const hostPress = useLongPress(() => setHostOpen(true), 1200);

  const pickedChoice = useMemo(
    () => current?.choices.find((c) => c.id === progress.picks[chapter]),
    [current, progress.picks, chapter]
  );

  let content;
  if (handoff) {
    content = <Handoff plan={plan} onPreview={() => setHandoff(false)} />;
  } else if (screen === "intro") {
    content = <Intro plan={plan} onStart={start} />;
  } else if (screen === "choose" && current) {
    content = <Chapter chapter={current} index={chapter} onPick={pick} onSkip={next} />;
  } else if (screen === "reveal" && current && pickedChoice) {
    content = <Reveal chapter={current} choice={pickedChoice} onNext={next} isLast={chapter === chapters.length - 1} />;
  } else if (screen === "reveal" && current) {
    // The picked card was edited away in Host Mode, so let her pick again.
    content = <Chapter chapter={current} index={chapter} onPick={pick} onSkip={next} />;
  } else {
    content = (
      <Finale
        plan={plan}
        step={progress.finaleStep}
        onStep={(finaleStep) => update({ finaleStep })}
        picks={progress.picks}
      />
    );
  }

  return (
    <>
      <Sky phase={phase} />

      {/* Hidden Host Mode door: long-press the top-right corner (or add ?host to the URL). */}
      <div className="host-door" aria-hidden="true" {...hostPress} />

      <div className="app">
        {!handoff && screen !== "intro" && (
          <Progress total={chapters.length + 1} done={stepsDone} active={activeStep} />
        )}
        <main key={handoff ? "handoff" : `${screen}-${chapter}`} className="screen">
          {content}
        </main>
      </div>

      <Toast toast={toast} />

      {hostOpen && (
        <HostMode
          plan={plan}
          setPlan={setPlan}
          progress={progress}
          host={host}
          onShowQr={() => {
            setHandoff(true);
            setHostOpen(false);
          }}
          onClose={() => setHostOpen(false)}
        />
      )}
    </>
  );
}
