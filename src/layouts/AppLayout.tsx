import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import {
  HomeIcon,
  UsersIcon,
  HistoryIcon,
  TagIcon,
  ChartIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  GlobeIcon,
} from "../components/icons";

const NAV_ITEMS = [
  { to: "/", labelKey: "nav.dashboard", Icon: HomeIcon },
  { to: "/clients", labelKey: "nav.clients", Icon: UsersIcon },
  { to: "/history", labelKey: "nav.history", Icon: HistoryIcon },
  { to: "/lesson-types", labelKey: "nav.lessonTypes", Icon: TagIcon },
  { to: "/earnings", labelKey: "nav.earnings", Icon: ChartIcon },
  { to: "/settings", labelKey: "nav.settings", Icon: SettingsIcon },
] as const;

function KoniLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="Koni" className="h-8 w-8 object-contain" />
      <span className="font-koni text-2xl font-bold leading-none tracking-wide text-white">Koni</span>
    </div>
  );
}

function navLinkClass(isActive: boolean) {
  return [
    "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg text-[11px] transition-colors",
    isActive
      ? "text-brand-500 dark:text-brand-400"
      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
  ].join(" ");
}

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  function toggleLanguage() {
    i18n.changeLanguage(i18n.language === "he" ? "en" : "he");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navy header with Koni branding */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-navy-700 px-4 py-3 shadow-md">
        <KoniLogo />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-200 hover:bg-navy-600"
          >
            <GlobeIcon />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-200 hover:bg-navy-600"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <nav data-nav="desktop" className="hidden sm:flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
        <div className="flex gap-1 py-2">
          {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                ].join(" ")
              }
            >
              <Icon className="w-4 h-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="flex-1 px-4 py-4 pb-24 sm:pb-6">
        <Outlet />
      </main>

      <nav data-nav="mobile" className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sm:hidden">
        <div className="grid grid-cols-6">
          {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => navLinkClass(isActive)}>
              <Icon />
              <span className="text-center leading-none">{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
