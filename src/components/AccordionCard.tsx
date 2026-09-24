import type { ReactNode } from "react";
import { PlusIcon } from "./icons";

interface AccordionCardProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function AccordionCard({ label, open, onToggle, children }: AccordionCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-base font-semibold"
      >
        <span>{label}</span>
        <PlusIcon className={`h-5 w-5 text-brand-500 transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
