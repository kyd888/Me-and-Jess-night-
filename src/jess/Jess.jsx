import { useEffect, useRef, useState } from "react";
import Sky from "../components/Sky.jsx";
import Toast from "../components/Toast.jsx";
import { Bird } from "../components/icons.jsx";
import { guestApi, local, usePoll } from "../lib/api.js";
import { useTimeOfDay } from "../lib/timeOfDay.js";
import Waiting from "./Waiting.jsx";
import Onboarding from "./Onboarding.jsx";
import Beat from "./Beat.jsx";
import Round from "./Round.jsx";
import Between from "./Between.jsx";
import RequestSheet from "./RequestSheet.jsx";
import Scrapbook from "./Scrapbook.jsx";
import Finale from "./Finale.jsx";
import { Intermission, MessageOverlay } from "./Overlays.jsx";

/** Jess Mode: a little card game Kyd secretly runs from his phone. */
export default function Jess() {
  const { data, setData, error } = usePoll(guestApi.get, 2500);
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(null); // "request" | "scrapbook"
  const [seenMsg, setSeenMsg] = useState(() => local.get("jess-seen-message"));
  const [onboard, setOnboard] = useState(null);
  const prev = useRef(null);
  const toastTimer = useRef();

  const me = data?.me || "Kyd";
  const tod = useTimeOfDay();

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
      if (data.scrapbook.length > p.scrapbook.length) showToast("+1 card 🎟️");
      else if (data.clues.length > p.clues.length) showToast("new clue 👀");
    }
    if (data.message && data.message.id !== p?.message?.id && data.message.id !== seenMsg) navigator.vibrate?.(60);
    prev.current = data;
  }, [data, seenMsg]);

  const dismissMessage = () => {
    setSeenMsg(data.message.id);
    local.set("jess-seen-message", data.message.id);
  };

  const react = (text) => guestApi.send({ type: "react", roundId: data.round?.id || data.beat?.id, text }).catch(() => {});
  const request = async (mood) => setData(await guestApi.send({ type: "request", mood }));
  const pick = async (cardId) => {
    const view = await guestApi.send({ type: "pick", roundId: data.round.id, cardId });
    setData(view);
    return view;
  };

  let screen = null;
  let key = "loading";
  if (!data) {
    screen = (
      <section className="center-screen">
        <Bird className="loading-bird" />
        {error && <p className="tiny center-text">one sec…</p>}
      </section>
    );
  } else if (data.status === "waiting") {
    key = "waiting";
    screen = <Waiting me={me} tod={tod} />;
  } else if (data.status === "finished") {
    key = "finale";
    screen = <Finale finale={data.finale} scrapbook={data.scrapbook} />;
  } else if (onboard === null) {
    screen = null;
  } else if (onboard < 2) {
    key = `onboard-${onboard}`;
    screen = <Onboarding step={onboard} onNext={nextOnboard} me={me} tod={tod} />;
  } else if (data.stage === "opening" && data.beat) {
    key = `beat-${data.beat.id}`;
    screen = <Beat beat={data.beat} clues={data.clues} me={me} nightId={data.nightId} onReact={react} />;
  } else if (data.stage === "round" && data.round) {
    key = `round-${data.round.id}`;
    screen = (
      <Round
        round={data.round}
        clues={data.clues}
        me={me}
        nightId={data.nightId}
        onPick={pick}
        onReact={react}
        onNotFeelingIt={() => setSheet("request")}
      />
    );
  } else {
    key = `between-${data.scrapbook.length}`;
    screen = <Between me={me} clues={data.clues} />;
  }

  const inStory = data?.status === "started" && onboard >= 2;
  const showMessage = data?.message && data.message.id !== seenMsg && data.status !== "waiting";

  return (
    <>
      <Sky tod={tod} />
      <div className="app">
        {inStory && (
          <header className="topbar">
            <button className="trail" onClick={() => setSheet("scrapbook")} aria-label="your night so far">
              {data.scrapbook.map((t) => (
                <Bird key={t.id} className="trail-bird" />
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
