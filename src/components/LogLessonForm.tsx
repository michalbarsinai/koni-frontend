import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLessonTypes } from "../lib/queries/lessonTypes";
import { useStudents } from "../lib/queries/students";
import { useCreateLesson, type LessonStudentInput } from "../lib/queries/lessons";
import { todayIsoDate, formatCurrency } from "../lib/format";
import { PlusIcon } from "./icons";
import SelectField from "./SelectField";

interface StudentRow {
  studentId: string;
  paid: string;
}

function emptyRow(): StudentRow {
  return { studentId: "", paid: "" };
}

export default function LogLessonForm({ onSaved }: { onSaved?: () => void }) {
  const { t } = useTranslation();
  const { data: lessonTypes, isLoading: typesLoading } = useLessonTypes();
  // Active students for manual selection, plus the full list so roster-bound
  // students who later went inactive still resolve to a name + warning.
  const { data: activeStudents, isLoading: studentsLoading } = useStudents(true);
  const { data: allStudents } = useStudents(false);
  const createLesson = useCreateLesson();

  const [date, setDate] = useState(todayIsoDate());
  const [lessonTypeId, setLessonTypeId] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<StudentRow[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);

  const selectedLessonType = lessonTypes?.find((l) => String(l.id) === lessonTypeId);
  const price = selectedLessonType?.default_price_per_student;

  function updateRow(index: number, patch: Partial<StudentRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleLessonTypeChange(value: string) {
    setLessonTypeId(value);
    const lt = lessonTypes?.find((l) => String(l.id) === value);
    // The price is whatever was actually paid by default — the common case is
    // paying in full. The instructor edits "Paid" per student when it differs.
    const defaultPaid = lt?.default_price_per_student ?? "";

    if (lt && lt.students.length > 0) {
      // This type has a fixed roster (e.g. "Cohen kids") — populate exactly those students.
      setRows(lt.students.map((s) => ({ studentId: String(s.id), paid: defaultPaid })));
      return;
    }

    // Generic type — just set up the right number of empty slots.
    const count = lt?.default_student_count ?? 1;
    setRows(Array.from({ length: count }, () => ({ studentId: "", paid: defaultPaid })));
  }

  function addRow() {
    setRows((prev) => [...prev, { studentId: "", paid: price ?? "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setDate(todayIsoDate());
    setLessonTypeId("");
    setNotes("");
    setRows([emptyRow()]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const studentsPayload: LessonStudentInput[] = rows
      .filter((r) => r.studentId && r.paid !== "")
      .map((r) => ({ student_id: Number(r.studentId), amount_paid: r.paid }));

    if (!lessonTypeId || studentsPayload.length === 0) {
      setError(t("common.error"));
      return;
    }

    try {
      await createLesson.mutateAsync({
        date,
        lesson_type_id: Number(lessonTypeId),
        notes: notes || undefined,
        students: studentsPayload,
      });
      resetForm();
      onSaved?.();
    } catch {
      setError(t("common.error"));
    }
  }

  const noLessonTypes = !typesLoading && (lessonTypes?.length ?? 0) === 0;
  const noStudents = !studentsLoading && (activeStudents?.length ?? 0) === 0;

  return (
    <>
      {noLessonTypes && (
        <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">{t("dashboard.noLessonTypes")}</p>
      )}
      {noStudents && (
        <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">{t("dashboard.noStudents")}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("common.date")}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("dashboard.lessonType")}
            </label>
            <SelectField
              required
              value={lessonTypeId}
              onChange={(e) => handleLessonTypeChange(e.target.value)}
              disabled={noLessonTypes}
              className="disabled:opacity-50"
            >
              <option value="">{t("dashboard.selectLessonType")}</option>
              {lessonTypes?.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        {price && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.priceLabel")}: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(price)}</span>{" "}
            {t("dashboard.perStudent")}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("dashboard.students")}
          </label>
          <div className="space-y-2">
            {rows.map((row, i) => {
              const selectedStudent = allStudents?.find((s) => String(s.id) === row.studentId);
              const isInactive = !!selectedStudent && !selectedStudent.active;
              // Keep the currently selected student visible in the dropdown even if
              // they've since gone inactive and dropped out of the active list.
              const options =
                isInactive && selectedStudent
                  ? [selectedStudent, ...(activeStudents ?? [])]
                  : activeStudents ?? [];

              return (
                <div key={i}>
                  <div className="flex gap-2">
                    <SelectField
                      required
                      value={row.studentId}
                      onChange={(e) => updateRow(i, { studentId: e.target.value })}
                      disabled={noStudents}
                      wrapperClassName="flex-1"
                      className="disabled:opacity-50"
                    >
                      <option value="">{t("dashboard.selectStudent")}</option>
                      {options.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                          {!s.active ? ` ${t("dashboard.inactiveSuffix")}` : ""}
                        </option>
                      ))}
                    </SelectField>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder={t("dashboard.paid")}
                      value={row.paid}
                      onChange={(e) => updateRow(i, { paid: e.target.value })}
                      className="w-24 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        aria-label={t("dashboard.removeStudent")}
                        className="px-2 text-gray-400 hover:text-coral-400"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {isInactive && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {t("dashboard.inactiveStudentWarning", { name: selectedStudent!.name })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addRow}
            disabled={noStudents}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {t("dashboard.addStudent")}
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("common.notes")} <span className="text-gray-400">({t("common.optional")})</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        {error && <p className="text-sm text-coral-500 dark:text-coral-400">{error}</p>}

        <button
          type="submit"
          data-testid="log-lesson-submit"
          disabled={createLesson.isPending || noLessonTypes || noStudents}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {createLesson.isPending ? t("common.saving") : t("dashboard.saveLesson")}
        </button>
      </form>
    </>
  );
}
