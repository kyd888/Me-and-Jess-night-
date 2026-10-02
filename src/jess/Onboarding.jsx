export default function Onboarding({ step, onNext, me }) {
  if (step === 0) {
    return (
      <section className="center-screen">
        <h1 className="display rise" style={{ "--d": "0.3s" }}>
          Hey Jess.
        </h1>
        <p className="lede rise" style={{ "--d": "0.7s" }}>
          you don't have to plan anything tonight.
        </p>
        <button className="btn btn-primary rise wide" style={{ "--d": "1.1s" }} onClick={onNext}>
          okay
        </button>
      </section>
    );
  }
  return (
    <section className="center-screen">
      <p className="eyebrow rise" style={{ "--d": "0.1s" }}>rule #1</p>
      <h1 className="display display-sm rise" style={{ "--d": "0.3s" }}>
        don't ask where we're going.
      </h1>
      <button className="btn btn-primary rise wide" style={{ "--d": "1.1s" }} onClick={onNext}>
        fine 🙄
      </button>
    </section>
  );
}
