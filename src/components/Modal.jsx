import { X } from "lucide-react";

export function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-base-850 border border-base-700 rounded-2xl shadow-card w-full max-h-[88vh] overflow-y-auto"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-700 sticky top-0 bg-base-850 rounded-t-2xl">
          <h3 className="font-semibold text-base-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-base-400 hover:text-base-100 rounded-lg p-1 hover:bg-base-800 focus-ring"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
