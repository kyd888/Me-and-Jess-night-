export function MessageOverlay({ message, me, onClose }) {
  return (
    <div className="overlay">
      <div className="note-card pop-in">
        <p className="note-text hand">{message.text}</p>
        <button className="btn btn-primary wide" onClick={onClose}>
          ok
        </button>
      </div>
    </div>
  );
}

export function Intermission() {
  return (
    <div className="overlay overlay-soft">
      <div className="center-screen">
        <p className="display display-sm">look up 👀</p>
      </div>
    </div>
  );
}
