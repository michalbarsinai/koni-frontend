import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLessons } from "../lib/queries/lessons";
import { usePayments } from "../lib/queries/payments";
import { formatCurrency } from "../lib/format";

interface MonthData {
  key: string;
  total: number;
  byType: Map<string, number>;
  otherPayments: number;
}

export default function Earnings() {
  const { t, i18n } = useTranslation();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const isLoading = lessonsLoading || paymentsLoading;

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { year: "numeric", month: "long" }),
    [i18n.language]
  );

  const months = useMemo(() => {
    const map = new Map<string, MonthData>();

    function getMonth(key: string): MonthData {
      let m = map.get(key);
      if (!m) {
        m = { key, total: 0, byType: new Map(), otherPayments: 0 };
        map.set(key, m);
      }
      return m;
    }

    for (const lesson of lessons ?? []) {
      const key = lesson.date.slice(0, 7);
      const m = getMonth(key);
      for (const ls of lesson.lesson_students) {
        const paid = parseFloat(ls.amount_paid);
        m.total += paid;
        m.byType.set(lesson.lesson_type.name, (m.byType.get(lesson.lesson_type.name) ?? 0) + paid);
      }
    }

    for (const payment of payments ?? []) {
      const key = payment.date.slice(0, 7);
      const m = getMonth(key);
      const amount = parseFloat(payment.amount);
      m.total += amount;
      m.otherPayments += amount;
    }

    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [lessons, payments]);

  function toggleExpanded(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function monthLabel(key: string): string {
    const [year, month] = key.split("-").map(Number);
    return monthFormatter.format(new Date(year, month - 1, 1));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}
        {!isLoading && months.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("earnings.noData")}</p>
        )}

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {months.map((m) => {
            const isOpen = expanded.has(m.key);
            const typeRows = Array.from(m.byType.entries()).sort((a, b) => b[1] - a[1]);
            return (
              <li key={m.key} className="py-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(m.key)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <p className="font-medium">{monthLabel(m.key)}</p>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-mint-500 dark:text-mint-400">{formatCurrency(m.total)}</p>
                    <span className="text-sm text-brand-600 dark:text-brand-400">
                      {isOpen ? t("balances.hideDetails") : t("balances.showDetails")}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                    {typeRows.map(([typeName, amount]) => (
                      <div key={typeName} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{typeName}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    {m.otherPayments > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{t("earnings.otherPayments")}</span>
                        <span className="font-medium">{formatCurrency(m.otherPayments)}</span>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
