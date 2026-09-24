import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useStudents } from "../lib/queries/students";
import type { LessonType } from "../lib/types";

export interface LessonTypeFormValues {
  name: string;
  default_price_per_student: string;
  default_student_count?: number;
  student_ids: number[];
}

interface LessonTypeFormProps {
  initial?: LessonType;
  onSubmit: (values: LessonTypeFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
  isPending: boolean;
  error?: string | null;
  // The create card and edit modal can both be mounted at once, so each needs
  // its own id — a bare selector like button[type="submit"] would be ambiguous.
  submitTestId: string;
}

export default function LessonTypeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
  error,
  submitTestId,
}: LessonTypeFormProps) {
  const { t } = useTranslation();
  const { data: allStudents } = useStudents(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.default_price_per_student ?? "");
  const [count, setCount] = useState(
    initial?.default_student_count != null ? String(initial.default_student_count) : ""
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(initial?.students.map((s) => s.id) ?? [])
  );

  function toggleStudent(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({
      name,
      default_price_per_student: price,
      default_student_count: count ? Number(count) : undefined,
      student_ids: Array.from(selectedIds),
    });
  }

  const hasRoster = selectedIds.size > 0;
  const hasCount = count.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("lessonTypes.name")}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("lessonTypes.pricePerStudent")}
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("lessonTypes.studentCount")} <span className="text-gray-400">({t("common.optional")})</span>
        </label>
        <input
          type="number"
          step="1"
          min="1"
          disabled={hasRoster}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("lessonTypes.studentCountHint")}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("lessonTypes.roster")}
        </label>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{t("lessonTypes.rosterHint")}</p>
        {(allStudents?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("lessonTypes.noStudentsToSelect")}</p>
        ) : (
          <div className={`max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 p-2 ${hasCount ? "opacity-50 pointer-events-none" : ""}`}>
            {allStudents?.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.has(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  disabled={hasCount}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500/30"
                />
                <span>{s.name}</span>
                {!s.active && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    ({t("lessonTypes.inactiveBadge")})
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-coral-500 dark:text-coral-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          data-testid={submitTestId}
          disabled={isPending}
          className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {isPending ? t("common.saving") : submitLabel}
        </button>
      </div>
    </form>
  );
}
