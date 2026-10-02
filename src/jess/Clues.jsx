/** Clues from Kyd, as little pink sticky notes (newest first). */
export function Clues({ clues }) {
  return clues
    .slice(-3)
    .reverse()
    .map((c, i) => (
      <p key={c.id} className={`scrap scrap-pink hand ${i === 0 ? "pop-in" : ""}`}>
        {c.text}
      </p>
    ));
}
