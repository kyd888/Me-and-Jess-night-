export function MessageOverlay({ message, me, onClose }) {
  return (
    <div className="overlay">
      <div className="note-card pop-in">
        <img className="sticker sticker-tilt" src="/memes/text_stickers/wait.png" alt="" />
        <p className="eyebrow eyebrow-ink">from {me}</p>
        <p className="note-text hand">{message.text}</p>
        <button className="btn btn-primary wide" onClick={onClose}>
          okay 🩷
        </button>
      </div>
    </div>
  );
}

export function Intermission() {
  return (
    <div className="overlay overlay-soft">
      <div className="center-screen">
        <p className="eyebrow">intermission</p>
        <p className="display display-sm">Look up.</p>
        <p className="lede">The story's on pause. You're missing the good part.</p>
      </div>
    </div>
  );
}
