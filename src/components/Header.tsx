"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  Bug,
  ClipboardList,
  Heart,
  Menu,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCartHasHydrated, useCartStore } from "@/store/cart";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SearchBar } from "@/components/SearchBar";
import { AuthMenu } from "@/components/AuthMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrackOrderModal } from "@/components/TrackOrderModal";
import { CategoryExplorer } from "@/components/CategoryExplorer";

type HeaderProps = {
  showSearch?: boolean;
};

const iconBtnClass =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-black sm:size-10 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-md p-3 text-sm font-medium text-gray-800 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800";

function SearchBarFallback() {
  return (
    <div
      className="size-10 shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800"
      aria-hidden
    />
  );
}

function HeaderSearch({
  onExpandedChange,
}: {
  onExpandedChange: (expanded: boolean) => void;
}) {
  const pathname = usePathname();
  return (
    <SearchBar
      retainFilters={pathname === "/search" || pathname === "/products"}
      onExpandedChange={onExpandedChange}
    />
  );
}

export function Header({ showSearch = true }: HeaderProps) {
  const t = useTranslations();
  const hydrated = useCartHasHydrated();
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const visibleCount = hydrated ? itemCount : 0;
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const onSearchExpandedChange = useCallback((expanded: boolean) => {
    setSearchExpanded(expanded);
    if (expanded) setMenuOpen(false);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function openTrackOrder() {
    setMenuOpen(false);
    setIsTrackingModalOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-neutral-950/80">
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 md:px-8 md:py-4 lg:px-12">
          {/* Left: hamburger + logo — always above mobile search overlay */}
          <div
            className={`flex min-w-0 items-center gap-1 sm:gap-2 ${
              searchExpanded ? "relative z-40 max-md:flex-none" : "min-w-0 flex-1"
            }`}
          >
            <div className="relative z-40 shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={iconBtnClass}
                aria-expanded={menuOpen}
                aria-controls="header-support-menu"
                aria-label={
                  menuOpen ? t("header.closeMenu") : t("header.openMenu")
                }
              >
                {menuOpen ? (
                  <X className="size-5" aria-hidden />
                ) : (
                  <Menu className="size-5" aria-hidden />
                )}
              </button>

              {menuOpen ? (
                <div
                  id="header-support-menu"
                  role="menu"
                  className="absolute left-0 z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] origin-top-left overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg will-change-[opacity,transform] transition-[opacity,transform] duration-200 ease-out dark:border-gray-800 dark:bg-neutral-900"
                  style={{
                    animation: "headerMenuIn 160ms ease-out both",
                  }}
                >
                  <p className="px-3 py-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    {t("header.supportMenu")}
                  </p>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openTrackOrder}
                    className={menuItemClass}
                  >
                    <Package className="size-4 shrink-0" aria-hidden />
                    {t("header.trackOrder")}
                  </button>
                  <Link
                    href="/request-product"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className={menuItemClass}
                  >
                    <ClipboardList className="size-4 shrink-0" aria-hidden />
                    {t("header.requestProduct")}
                  </Link>
                  <Link
                    href="/report-bug"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className={menuItemClass}
                  >
                    <Bug className="size-4 shrink-0" aria-hidden />
                    {t("header.reportBug")}
                  </Link>
                </div>
              ) : null}
            </div>

            <Link
              href="/"
              className={`min-w-0 truncate text-sm font-bold tracking-tight text-gray-900 uppercase sm:text-base md:max-w-none md:text-lg md:tracking-widest dark:text-white ${
                searchExpanded
                  ? "max-md:pointer-events-none max-md:invisible max-md:w-0 max-md:overflow-hidden"
                  : "max-w-[7.5rem] sm:max-w-[11rem]"
              }`}
              aria-label="The supplier Kaung Set"
              tabIndex={searchExpanded ? -1 : 0}
            >
              {t("brand")}
            </Link>
          </div>

          {/* Right actions — search expands as absolute cover on mobile */}
          <div
            className={`flex shrink-0 items-center justify-end gap-0.5 sm:gap-1 ${
              searchExpanded ? "max-md:static" : ""
            }`}
          >
            {showSearch ? (
              <Suspense fallback={<SearchBarFallback />}>
                <HeaderSearch onExpandedChange={onSearchExpandedChange} />
              </Suspense>
            ) : null}

            <div
              className={`flex items-center gap-0.5 sm:gap-1 ${
                searchExpanded ? "max-md:pointer-events-none max-md:invisible" : ""
              }`}
            >
              <ThemeToggle />
              <LanguageToggle />
              <AuthMenu />
              <Link
                href="/wishlist"
                className={iconBtnClass}
                aria-label={t("header.wishlist")}
                tabIndex={searchExpanded ? -1 : 0}
              >
                <Heart className="size-5" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={openCart}
                className={`relative ${iconBtnClass}`}
                aria-label={t("header.cart")}
                tabIndex={searchExpanded ? -1 : 0}
              >
                <ShoppingBag className="size-5" aria-hidden />
                {visibleCount > 0 ? (
                  <span className="absolute top-0.5 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">
                    {visibleCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </header>

      <TrackOrderModal
        open={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />
      <CategoryExplorer />
    </>
  );
}
