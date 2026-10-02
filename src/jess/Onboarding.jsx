export default function Onboarding({ step, onNext, me }) {
  if (step === 0) {
    return (
      <section className="center-screen">
        <p className="eyebrow rise" style={{ "--d": "0.1s" }}>it's happening</p>
        <h1 className="display rise" style={{ "--d": "0.3s" }}>
          Tonight belongs to Jess.
        </h1>
        <p className="lede rise" style={{ "--d": "0.7s" }}>
          You don't have to plan anything tonight.
        </p>
        <button className="btn btn-primary rise wide" style={{ "--d": "1.1s" }} onClick={onNext}>
          okay I'm ready
        </button>
      </section>
    );
  }
  return (
    <section className="center-screen">
      <p className="eyebrow rise" style={{ "--d": "0.1s" }}>Rule #1</p>
      <h1 className="display display-sm rise" style={{ "--d": "0.3s" }}>
        Don't ask {me} where you're going.
      </h1>
      <p className="hand aside rise" style={{ "--d": "0.7s" }}>
        he probably won't tell you anyway.
      </p>
      <button className="btn btn-primary rise wide" style={{ "--d": "1.1s" }} onClick={onNext}>
        fine 🙄
      </button>
    </section>
  );
}
