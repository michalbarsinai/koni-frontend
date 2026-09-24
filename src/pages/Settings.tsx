import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { usePreviewReport } from "../lib/queries/reports";
import { formatCurrency } from "../lib/format";
import { startOfWeekIso, endOfWeekIso, startOfMonthIso, endOfMonthIso, todayIsoDate } from "../lib/format";
import type { ReportPreviewResponse } from "../lib/types";

type Preset = "week" | "month" | "custom";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const previewReport = usePreviewReport();

  const [preset, setPreset] = useState<Preset>("week");
  const [customStart, setCustomStart] = useState(todayIsoDate());
  const [customEnd, setCustomEnd] = useState(todayIsoDate());
  const [error, setError] = useState<string | null>(null);

  function rangeForPreset(): { start: string; end: string } {
    if (preset === "week") return { start: startOfWeekIso(), end: endOfWeekIso() };
    if (preset === "month") return { start: startOfMonthIso(), end: endOfMonthIso() };
    return { start: customStart, end: customEnd };
  }

  async function handleGenerateReport() {
    setError(null);
    const { start, end } = rangeForPreset();
    try {
      await previewReport.mutateAsync({ start_date: start, end_date: end });
    } catch {
      setError(t("common.error"));
    }
  }

  async function handleDownloadPdf(report: ReportPreviewResponse) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Koni — Debt Report", pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${report.start_date} – ${report.end_date}`, pageWidth / 2, y, { align: "center" });
    doc.setTextColor(0);
    y += 12;

    if (report.payers.length === 0) {
      doc.setFontSize(11);
      doc.text("No outstanding balances.", 14, y);
    }

    for (const payer of report.payers) {
      if (y > 260) { doc.addPage(); y = 20; }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(payer.payer_name, 14, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(180, 60, 60);
      doc.text(`Owes: ${formatCurrency(Math.abs(parseFloat(payer.balance)))}`, pageWidth - 14, y, { align: "right" });
      doc.setTextColor(0);
      y += 6;

      if (payer.phone) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(payer.phone, 14, y);
        doc.setTextColor(0);
        y += 5;
      }

      if (payer.lessons_in_period.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`Lessons in period (${report.start_date} – ${report.end_date}):`, 14, y);
        doc.setTextColor(0);
        y += 5;

        for (const lesson of payer.lessons_in_period) {
          if (y > 270) { doc.addPage(); y = 20; }
          const paid = parseFloat(lesson.amount_paid);
          const charged = parseFloat(lesson.price_charged);
          const lessonText = `  ${lesson.date}  ${lesson.student_name} — ${lesson.lesson_type}  (charged: ${formatCurrency(charged)}, paid: ${formatCurrency(paid)})`;
          doc.setFontSize(8.5);
          doc.text(lessonText, 14, y);
          y += 5;
        }
      } else {
        doc.setFontSize(8.5);
        doc.setTextColor(120);
        doc.text("  No lessons in this period.", 14, y);
        doc.setTextColor(0);
        y += 5;
      }

      y += 6;
      doc.setDrawColor(220);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;
    }

    doc.save(`koni-report-${report.start_date}-${report.end_date}.pdf`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">{t("settings.language")}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => i18n.changeLanguage("en")}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${
              i18n.language === "en"
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t("settings.english")}
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage("he")}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${
              i18n.language === "he"
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t("settings.hebrew")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">{t("settings.appearance")}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${
              theme === "light"
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t("settings.lightMode")}
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${
              theme === "dark"
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t("settings.darkMode")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">{t("settings.debtReport")}</h2>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("settings.dateRange")}
          </label>
          <div className="flex gap-2">
            {(["week", "month", "custom"] as Preset[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  preset === p
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {p === "week" ? t("settings.thisWeek") : p === "month" ? t("settings.thisMonth") : t("settings.custom")}
              </button>
            ))}
          </div>
        </div>

        {preset === "custom" && (
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("settings.from")}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("settings.to")}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>
        )}

        {error && <p className="mb-3 text-sm text-coral-500 dark:text-coral-400">{error}</p>}

        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={previewReport.isPending}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {previewReport.isPending ? t("common.loading") : t("settings.generateReport")}
        </button>

        {previewReport.data && (
          <div className="mt-4 space-y-3">
            {previewReport.data.payers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.noDebtors")}</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {previewReport.data.payers.map((p) => (
                    <li key={p.payer_id} className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{p.payer_name}</p>
                        <span className="text-sm font-semibold text-coral-500 dark:text-coral-400">
                          {formatCurrency(Math.abs(parseFloat(p.balance)))}
                        </span>
                      </div>
                      {p.lessons_in_period.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {p.lessons_in_period.map((l, i) => (
                            <li key={i} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{l.date} · {l.student_name} · {l.lesson_type}</span>
                              <span>{formatCurrency(parseFloat(l.price_charged))}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewReport.data!)}
                  className="w-full rounded-lg border border-brand-500 px-4 py-2.5 text-base font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                >
                  {t("settings.downloadPdf")}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
