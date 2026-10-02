/** The full plan: reorder, edit, remove, jump, add. Only on Kyd's phone. */
export default function PlanList({ state, busy, onSetSteps, onGoto, onEdit, onAdd }) {
  const steps = state.steps;
  const curIdx = steps.findIndex((s) => s.id === state.currentId);
  const done = new Set(state.scrapbook.map((s) => s.stepId));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const list = [...steps];
    [list[i], list[j]] = [list[j], list[i]];
    onSetSteps(list, "Reordered ✓");
  };

  const remove = (step) => {
    if (!window.confirm(`Remove "${step.title}" from tonight?`)) return;
    onSetSteps(
      steps.filter((s) => s.id !== step.id),
      "Removed ✓"
    );
  };

  return (
    <details className="k-card" open={state.status === "waiting"}>
      <summary className="k-summary">Tonight's plan ({steps.length} steps)</summary>
      <ol className="k-plan">
        {steps.map((s, i) => {
          const isNow = i === curIdx;
          const isDone = done.has(s.id) && !isNow;
          return (
            <li key={s.id} className={`k-step ${isNow ? "is-now" : ""} ${isDone ? "is-done" : ""}`}>
              <div className="k-step-main" onClick={() => onEdit(s)}>
                <span className="k-step-n">{isDone ? "✓" : isNow ? "▶" : i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <span className="k-muted small block">
                    {s.destination?.name || s.status}
                    {s.estimatedMinutes ? ` · ~${s.estimatedMinutes}m` : ""}
                  </span>
                </span>
              </div>
              <div className="k-step-tools">
                <button className="k-mini" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="move up">↑</button>
                <button className="k-mini" disabled={busy || i === steps.length - 1} onClick={() => move(i, 1)} aria-label="move down">↓</button>
                {state.status === "started" && !isNow && (
                  <button className="k-mini" disabled={busy} onClick={() => onGoto(s.id)}>go</button>
                )}
                {!isNow && (
                  <button className="k-mini k-mini-danger" disabled={busy} onClick={() => remove(s)} aria-label="remove">✕</button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <button className="k-btn wide" onClick={onAdd}>+ Add a step</button>
      <p className="k-muted small">Tap a step to edit it. "go" jumps straight there; skipped steps are just passed over.</p>
    </details>
  );
}
