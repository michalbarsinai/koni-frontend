import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLessons } from "../lib/queries/lessons";
import { usePayments } from "../lib/queries/payments";
import { useStudents } from "../lib/queries/students";
import { usePayers } from "../lib/queries/payers";
import { formatCurrency } from "../lib/format";
import SelectField from "../components/SelectField";
import { PencilIcon } from "../components/icons";
import LogLessonForm from "../components/LogLessonForm";
import type { Lesson } from "../lib/types";

type Tab = "lessons" | "payments";

interface FeedEntry {
  date: string;
  kind: "lesson" | "payment";
  label: string;
  netEffect: number;
  lessonId?: number;
}

export default function History() {
  const { t } = useTranslation();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: students } = useStudents(false);
  const { data: payers } = usePayers();

  const [tab, setTab] = useState<Tab>("lessons");
  const [studentId, setStudentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const isLoading = lessonsLoading || paymentsLoading;

  const selectedStudent = students?.find((s) => String(s.id) === studentId);
  const payerId = selectedStudent?.payer_id;

  const entries = useMemo(() => {
    const result: FeedEntry[] = [];

    for (const lesson of lessons ?? []) {
      for (const ls of lesson.lesson_students) {
        if (studentId && ls.student_id !== Number(studentId)) continue;
        const student = students?.find((s) => s.id === ls.student_id);
        result.push({
          date: lesson.date,
          kind: "lesson",
          label: `${student?.name ?? "?"} — ${lesson.lesson_type.name}`,
          netEffect: parseFloat(ls.amount_paid) - parseFloat(ls.price_charged),
          lessonId: lesson.id,
        });
      }
    }

    for (const payment of payments ?? []) {
      if (payerId !== undefined && payment.payer_id !== payerId) continue;
      if (studentId && payerId === undefined) continue;
      const payer = payers?.find((p) => p.id === payment.payer_id);
      result.push({
        date: payment.date,
        kind: "payment",
        label: `${payer?.name ?? "?"} — ${t(`dashboard.method_${payment.method}`)}`,
        netEffect: parseFloat(payment.amount),
      });
    }

    return result.filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });
  }, [lessons, payments, students, payers, studentId, payerId, startDate, endDate, t]);

  const showRunningBalance = !!studentId;
  const sorted = showRunningBalance
    ? [...entries].sort((a, b) => (a.date < b.date ? -1 : 1))
    : [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  let running = 0;
  const withRunning = sorted.map((e) => {
    running += e.netEffect;
    return { ...e, running };
  });

  const displayRows = (showRunningBalance ? [...withRunning].reverse() : withRunning).filter(
    (e) => (tab === "lessons" ? e.kind === "lesson" : e.kind === "payment")
  );

  function clearFilters() {
    setStudentId("");
    setStartDate("");
    setEndDate("");
  }

  function openEdit(lessonId: number) {
    const lesson = lessons?.find((l) => l.id === lessonId);
    if (lesson) setEditingLesson(lesson);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("history.filterByStudent")}
            </label>
            <SelectField
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">{t("history.allStudents")}</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("history.startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("history.endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
        {(studentId || startDate || endDate) && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            {t("history.clearFilters")}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setTab("lessons")}
            className={`px-3 py-2 text-sm font-medium ${
              tab === "lessons"
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("history.tabLessons")}
          </button>
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`px-3 py-2 text-sm font-medium ${
              tab === "payments"
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("history.tabPayments")}
          </button>
        </div>

        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}

        {!isLoading && !studentId && (
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t("history.selectStudentHint")}</p>
        )}

        {!isLoading && displayRows.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === "lessons" ? t("history.noLessonEntries") : t("history.noPaymentEntries")}
          </p>
        )}

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {displayRows.map((entry, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{entry.date}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className={`text-sm font-medium ${entry.netEffect > 0 ? "text-mint-500 dark:text-mint-400" : entry.netEffect < 0 ? "text-coral-500 dark:text-coral-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {entry.netEffect > 0 ? "+" : entry.netEffect < 0 ? "−" : ""}
                    {formatCurrency(Math.abs(entry.netEffect))}
                  </p>
                  {showRunningBalance && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t("history.runningBalance")}: {formatCurrency(entry.running)}
                    </p>
                  )}
                </div>
                {entry.kind === "lesson" && entry.lessonId !== undefined && (
                  <button
                    type="button"
                    onClick={() => openEdit(entry.lessonId!)}
                    aria-label={t("history.editLesson")}
                    className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit lesson modal */}
      {editingLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingLesson(null); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{t("history.editLesson")}</h2>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <LogLessonForm
              initialLesson={editingLesson}
              onSaved={() => setEditingLesson(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
