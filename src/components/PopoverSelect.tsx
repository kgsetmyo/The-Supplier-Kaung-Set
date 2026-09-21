"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type PopoverSelectOption = {
  value: string;
  label: string;
  emoji?: string;
};

type PopoverSelectProps = {
  value: string;
  options: PopoverSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  /** Accessible name for the trigger */
  "aria-label"?: string;
};

export function PopoverSelect({
  value,
  options,
  placeholder,
  onChange,
  "aria-label": ariaLabel,
}: PopoverSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;

    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-left text-sm font-normal text-foreground outline-none transition hover:bg-background focus-visible:border-foreground"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.emoji ? (
            <span className="text-base leading-none" aria-hidden>
              {selected.emoji}
            </span>
          ) : null}
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-foreground transition ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
        >
          <li role="option" aria-selected={value === ""}>
            <button
              type="button"
              onClick={() => choose("")}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-normal text-foreground hover:bg-background"
            >
              <span className="w-4 shrink-0" aria-hidden>
                {value === "" ? <Check className="size-3.5" /> : null}
              </span>
              <span className="truncate">{placeholder}</span>
            </button>
          </li>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => choose(opt.value)}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm text-foreground hover:bg-background ${
                    active ? "font-semibold" : "font-normal"
                  }`}
                >
                  <span className="w-4 shrink-0" aria-hidden>
                    {active ? <Check className="size-3.5" /> : null}
                  </span>
                  {opt.emoji ? (
                    <span className="text-base leading-none" aria-hidden>
                      {opt.emoji}
                    </span>
                  ) : null}
                  <span className="truncate">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
