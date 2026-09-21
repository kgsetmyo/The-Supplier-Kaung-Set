"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

type SearchBarProps = {
  /** When true (on /products or /search), keep existing filter params when submitting */
  retainFilters?: boolean;
  /** Notify parent so the header can raise hamburger z-index / hide chrome */
  onExpandedChange?: (expanded: boolean) => void;
};

export function SearchBar({
  retainFilters = false,
  onExpandedChange,
}: SearchBarProps) {
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const [draftQ, setDraftQ] = useState(urlQ);
  const [isSearchExpanded, setIsSearchExpanded] = useState(Boolean(urlQ));
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraftQ(urlQ);
    if (urlQ) setIsSearchExpanded(true);
  }, [urlQ]);

  useEffect(() => {
    onExpandedChange?.(isSearchExpanded);
  }, [isSearchExpanded, onExpandedChange]);

  useEffect(() => {
    if (isSearchExpanded) {
      inputRef.current?.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  function expand() {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setIsSearchExpanded(true);
  }

  function collapse() {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setIsSearchExpanded(false);
    inputRef.current?.blur();
  }

  function stopBubble(e: MouseEvent) {
    e.stopPropagation();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = draftQ.trim();
    const params = retainFilters
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();

    params.delete("search");
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    const qs = params.toString();
    const target = qs ? `/search?${qs}` : "/search";

    if (pathname === "/search" || pathname === "/products") {
      router.replace(target, { scroll: false });
      router.refresh();
    } else {
      router.push(target);
    }

    if (!trimmed) collapse();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      collapse();
    }
  }

  function onBlur() {
    // Desktop: collapse when focus leaves. Mobile uses explicit X.
    blurTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
        setIsSearchExpanded(false);
      }
    }, 150);
  }

  function onFocus() {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setIsSearchExpanded(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      onClick={(e) => {
        stopBubble(e);
        if (!isSearchExpanded) expand();
      }}
      onMouseDown={stopBubble}
      className={
        isSearchExpanded
          ? // Mobile: absolute cover of the header row (leaves hamburger on the left).
            // md+: inline expanding field in the action cluster.
            "absolute inset-y-0 right-0 left-12 z-30 flex items-center gap-1 bg-white px-2 dark:bg-neutral-950 md:relative md:inset-auto md:left-auto md:right-auto md:z-auto md:h-10 md:w-56 md:gap-0 md:overflow-hidden md:rounded-full md:bg-gray-100 lg:w-72 dark:md:bg-gray-800"
          : "relative z-10 flex h-10 w-10 shrink-0 cursor-pointer items-center overflow-hidden rounded-full bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      }
    >
      <button
        type={isSearchExpanded ? "submit" : "button"}
        onClick={(e) => {
          stopBubble(e);
          if (!isSearchExpanded) {
            e.preventDefault();
            expand();
          }
        }}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors duration-200 hover:text-black dark:text-gray-300 dark:hover:text-white"
        aria-label={
          isSearchExpanded ? t("searchButton") : t("searchPlaceholder")
        }
      >
        <Search className="size-5" aria-hidden />
      </button>

      <label className="sr-only" htmlFor="header-search-input">
        {t("searchPlaceholder")}
      </label>
      <input
        id="header-search-input"
        ref={inputRef}
        type="search"
        value={draftQ}
        onChange={(e) => setDraftQ(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={isSearchExpanded ? t("searchPlaceholder") : ""}
        tabIndex={isSearchExpanded ? 0 : -1}
        className={`h-10 min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500 ${
          isSearchExpanded
            ? "opacity-100"
            : "pointer-events-none w-0 p-0 opacity-0"
        }`}
      />

      {isSearchExpanded ? (
        <button
          type="button"
          onMouseDown={(e) => {
            // Prevent blur-collapse race before click fires
            e.preventDefault();
            stopBubble(e);
          }}
          onClick={(e) => {
            stopBubble(e);
            e.preventDefault();
            collapse();
          }}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-black md:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label={t("closeSearch")}
        >
          <X className="size-5" aria-hidden />
        </button>
      ) : null}
    </form>
  );
}
