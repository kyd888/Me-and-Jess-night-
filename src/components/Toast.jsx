export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast" key={toast.key} role="status">
      {toast.text}
    </div>
  );
}
