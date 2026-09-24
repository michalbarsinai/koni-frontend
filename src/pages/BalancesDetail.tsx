import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePayers } from "../lib/queries/payers";
import { useStudents } from "../lib/queries/students";
import { useLessons } from "../lib/queries/lessons";
import { formatCurrency } from "../lib/format";

interface PayerDebt {
  payerId: number;
  payerName: string;
  amount: number; // price_charged − amount_paid for this lesson type
}

interface LessonTypeRow {
  name: string;
  totalOwed: number;
  debtors: PayerDebt[];
}

export default function BalancesDetail() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: payers, isLoading: payersLoading } = usePayers();
  const { data: students, isLoading: studentsLoading } = useStudents(false);
  const { data: lessons, isLoading: lessonsLoading } = useLessons();

  const isLoading = payersLoading || studentsLoading || lessonsLoading;

  const studentToPayer = useMemo(() => {
    const map = new Map<number, number>();
    students?.forEach((s) => map.set(s.id, s.payer_id));
    return map;
  }, [students]);

  const payerName = useMemo(() => {
    const map = new Map<number, string>();
    payers?.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [payers]);

  // For each lesson type, compute per-payer (price_charged − amount_paid) across all
  // their students' lesson_students rows. Only show payers with a positive deficit.
  const byLessonType = useMemo((): LessonTypeRow[] => {
    const typeMap = new Map<string, Map<number, number>>();

    for (const lesson of lessons ?? []) {
      const typeName = lesson.lesson_type.name;
      if (!typeMap.has(typeName)) typeMap.set(typeName, new Map());
      const payerTotals = typeMap.get(typeName)!;

      for (const ls of lesson.lesson_students) {
        const pid = studentToPayer.get(ls.student_id);
        if (pid === undefined) continue;
        const deficit = parseFloat(ls.price_charged) - parseFloat(ls.amount_paid);
        payerTotals.set(pid, (payerTotals.get(pid) ?? 0) + deficit);
      }
    }

    const rows: LessonTypeRow[] = [];
    for (const [name, payerTotals] of typeMap) {
      const debtors: PayerDebt[] = [];
      for (const [pid, amount] of payerTotals) {
        if (amount > 0.005) {
          debtors.push({ payerId: pid, payerName: payerName.get(pid) ?? "?", amount });
        }
      }
      if (debtors.length === 0) continue;
      debtors.sort((a, b) => b.amount - a.amount);
      const totalOwed = debtors.reduce((sum, d) => sum + d.amount, 0);
      rows.push({ name, totalOwed, debtors });
    }
    return rows.sort((a, b) => b.totalOwed - a.totalOwed);
  }, [lessons, studentToPayer, payerName]);

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to="/" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
        ← {t("balances.back")}
      </Link>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <h1 className="mb-4 text-base font-semibold">{t("balances.byLessonType")}</h1>

        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}

        {!isLoading && byLessonType.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("balances.noOutstanding")}</p>
        )}

        {!isLoading && (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {byLessonType.map((row) => {
              const isOpen = expanded.has(row.name);
              return (
                <li key={row.name} className="py-3">
                  <button
                    type="button"
                    onClick={() => toggle(row.name)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {row.debtors.length} {row.debtors.length === 1 ? t("balances.client") : t("balances.clients")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-medium text-coral-500 dark:text-coral-400">
                        {formatCurrency(row.totalOwed)}
                      </span>
                      <span className="text-sm text-brand-600 dark:text-brand-400">
                        {isOpen ? t("balances.hideDetails") : t("balances.showDetails")}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3">
                      {row.debtors.map((d) => (
                        <li key={d.payerId} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-200">{d.payerName}</span>
                          <span className="text-sm font-medium text-coral-500 dark:text-coral-400">
                            {formatCurrency(d.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
