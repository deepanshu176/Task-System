import * as React from "react";

export function Switch({ checked, onChange, className }: { checked: boolean; onChange: (checked: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-lumina-primary/30 focus:ring-offset-2 ${
        checked ? "bg-lumina-primary" : "bg-white/10"
      } ${className || ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
