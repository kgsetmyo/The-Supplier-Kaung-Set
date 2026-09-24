"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  LayoutDashboard,
  Package,
  User,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkIsAdmin } from "@/app/actions/auth-nav";

type AuthUser = {
  email: string;
  isAdmin: boolean;
};

export function AuthMenu() {
  const t = useTranslations("header");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const isAdmin = await checkIsAdmin();
      setUser({
        email: authUser.email ?? "",
        isAdmin,
      });
      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  if (loading) {
    return <div className="hidden h-10 w-16 sm:block" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
      >
        <User className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{t("login")}</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-[10rem] items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
        aria-expanded={open}
      >
        <User className="size-4 shrink-0" aria-hidden />
        <span className="hidden truncate sm:inline">{t("account")}</span>
        <ChevronDown className="size-3.5 shrink-0 text-gray-400" aria-hidden />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-neutral-900">
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <UserRound className="size-4" />
            {t("account")}
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <User className="size-4" />
            {t("profile")}
          </Link>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Package className="size-4" />
            {t("myOrders")}
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Heart className="size-4" />
            {t("wishlist")}
          </Link>
          {user.isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LayoutDashboard className="size-4" />
              {tNav("admin")}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <LogOut className="size-4" />
            {t("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
