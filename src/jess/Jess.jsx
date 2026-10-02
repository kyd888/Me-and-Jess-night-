import { useEffect, useRef, useState } from "react";
import Sky from "../components/Sky.jsx";
import Toast from "../components/Toast.jsx";
import { Bird } from "../components/icons.jsx";
import { guestApi, local, usePoll } from "../lib/api.js";
import Waiting from "./Waiting.jsx";
import Onboarding from "./Onboarding.jsx";
import StepView from "./StepView.jsx";
import RequestSheet from "./RequestSheet.jsx";
import Scrapbook from "./Scrapbook.jsx";
import Finale from "./Finale.jsx";
import { Intermission, MessageOverlay } from "./Overlays.jsx";

/** Jess Mode: a calm little storybook that Kyd moves from his phone. */
export default function Jess() {
  const { data, setData, error } = usePoll(guestApi.get, 2500);
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(null); // "request" | "scrapbook"
  const [seenMsg, setSeenMsg] = useState(() => local.get("jess-seen-message"));
  const [onboard, setOnboard] = useState(null);
  const prev = useRef(null);
  const toastTimer = useRef();

  const me = data?.me || "Kyd";

  const showToast = (text) => {
    clearTimeout(toastTimer.current);
    setToast({ text, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  // Onboarding is remembered per night, so a reset starts it fresh.
  useEffect(() => {
    if (data?.nightId) setOnboard(local.get(`jess-onboard-${data.nightId}`, 0));
  }, [data?.nightId]);

  const nextOnboard = () => {
    const n = (onboard || 0) + 1;
    setOnboard(n);
    local.set(`jess-onboard-${data.nightId}`, n);
  };

  // Little "something changed" moments.
  useEffect(() => {
    if (!data) return;
    const p = prev.current;
    if (p && p.status === data.status) {
      if (data.scrapbook.length > p.scrapbook.length) showToast("+1 ticket for your night 🎟️");
      else if (data.step && p.step?.id === data.step.id && data.step.clues.length > p.step.clues.length) showToast("new clue 👀");
    }
    if (data.message && data.message.id !== p?.message?.id && data.message.id !== seenMsg) {
      navigator.vibrate?.(60);
    }
    prev.current = data;
  }, [data, seenMsg]);

  const dismissMessage = () => {
    setSeenMsg(data.message.id);
    local.set("jess-seen-message", data.message.id);
  };

  const react = (text) => guestApi.send({ type: "react", stepId: data.step?.id, text }).catch(() => {});
  const request = async (mood) => {
    const next = await guestApi.send({ type: "request", mood, stepId: data.step?.id });
    setData(next);
  };

  let screen;
  let key;
  if (!data) {
    key = "loading";
    screen = (
      <section className="center-screen">
        <Bird className="loading-bird" />
        {error && <p className="tiny">can't reach {me}'s server… trying again</p>}
      </section>
    );
  } else if (data.status === "waiting") {
    key = "waiting";
    screen = <Waiting me={me} />;
  } else if (data.status === "finished") {
    key = "finale";
    screen = <Finale finale={data.finale} scrapbook={data.scrapbook} />;
  } else if (onboard === null) {
    key = "loading";
    screen = null;
  } else if (onboard < 2) {
    key = `onboard-${onboard}`;
    screen = <Onboarding step={onboard} onNext={nextOnboard} me={me} />;
  } else if (data.step) {
    key = `step-${data.step.id}`;
    screen = <StepView step={data.step} me={me} nightId={data.nightId} onReact={react} onNotFeelingIt={() => setSheet("request")} />;
  }

  const inStory = data?.status === "started" && onboard >= 2;
  const showMessage = data?.message && data.message.id !== seenMsg && data.status !== "waiting";

  return (
    <>
      <Sky phase={data?.phase ?? 0} />
      <div className="app">
        {inStory && (
          <header className="topbar">
            <button className="trail" onClick={() => setSheet("scrapbook")} aria-label="your night so far">
              {data.scrapbook.map((t) => (
                <Bird key={t.stepId} className="trail-bird" />
              ))}
              <span className="trail-now" />
              {data.scrapbook.length > 0 && <span className="trail-count">{data.scrapbook.length}</span>}
            </button>
          </header>
        )}
        <main key={key} className="screen">
          {screen}
        </main>
      </div>

      {data?.paused && data.status === "started" && <Intermission />}
      {showMessage && <MessageOverlay message={data.message} me={me} onClose={dismissMessage} />}
      {sheet === "request" && <RequestSheet me={me} onSend={request} onClose={() => setSheet(null)} />}
      {sheet === "scrapbook" && <Scrapbook items={data.scrapbook} onClose={() => setSheet(null)} />}
      <Toast toast={toast} />
    </>
  );
}
