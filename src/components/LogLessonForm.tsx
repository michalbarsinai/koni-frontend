import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLessonTypes } from "../lib/queries/lessonTypes";
import { useStudents } from "../lib/queries/students";
import { useCreateLesson, useUpdateLesson, useDeleteLesson, type LessonStudentInput } from "../lib/queries/lessons";
import { todayIsoDate, formatCurrency } from "../lib/format";
import { PlusIcon } from "./icons";
import SelectField from "./SelectField";
import type { Lesson } from "../lib/types";

interface StudentRow {
  studentId: string;
  paid: string;
}

function emptyRow(): StudentRow {
  return { studentId: "", paid: "" };
}

interface Props {
  onSaved?: () => void;
  initialLesson?: Lesson;
}

export default function LogLessonForm({ onSaved, initialLesson }: Props) {
  const { t } = useTranslation();
  const isEdit = !!initialLesson;
  const { data: lessonTypes, isLoading: typesLoading } = useLessonTypes();
  const { data: activeStudents, isLoading: studentsLoading } = useStudents(true);
  const { data: allStudents } = useStudents(false);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [date, setDate] = useState(initialLesson?.date ?? todayIsoDate());
  const [lessonTypeId, setLessonTypeId] = useState(
    initialLesson ? String(initialLesson.lesson_type_id) : ""
  );
  const [notes, setNotes] = useState(initialLesson?.notes ?? "");
  const [rows, setRows] = useState<StudentRow[]>(
    initialLesson?.lesson_students.length
      ? initialLesson.lesson_students.map((ls) => ({
          studentId: String(ls.student_id),
          paid: ls.amount_paid,
        }))
      : [emptyRow()]
  );
  const [error, setError] = useState<string | null>(null);

  const selectedLessonType = lessonTypes?.find((l) => String(l.id) === lessonTypeId);
  const price = selectedLessonType?.default_price_per_student;

  function updateRow(index: number, patch: Partial<StudentRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleLessonTypeChange(value: string) {
    setLessonTypeId(value);
    const lt = lessonTypes?.find((l) => String(l.id) === value);
    const defaultPaid = lt?.default_price_per_student ?? "";

    if (lt && lt.students.length > 0) {
      setRows(lt.students.map((s) => ({ studentId: String(s.id), paid: defaultPaid })));
      return;
    }

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
      if (isEdit) {
        await updateLesson.mutateAsync({
          id: initialLesson.id,
          date,
          lesson_type_id: Number(lessonTypeId),
          notes: notes || undefined,
          students: studentsPayload,
        });
      } else {
        await createLesson.mutateAsync({
          date,
          lesson_type_id: Number(lessonTypeId),
          notes: notes || undefined,
          students: studentsPayload,
        });
        resetForm();
      }
      onSaved?.();
    } catch {
      setError(t("common.error"));
    }
  }

  async function handleDelete() {
    if (!initialLesson) return;
    if (!window.confirm(t("history.deleteLessonConfirm"))) return;
    try {
      await deleteLesson.mutateAsync(initialLesson.id);
      onSaved?.();
    } catch {
      setError(t("common.error"));
    }
  }

  const noLessonTypes = !typesLoading && (lessonTypes?.length ?? 0) === 0;
  const noStudents = !studentsLoading && (activeStudents?.length ?? 0) === 0;
  const isPending = createLesson.isPending || updateLesson.isPending;

  return (
    <>
      {!isEdit && noLessonTypes && (
        <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">{t("dashboard.noLessonTypes")}</p>
      )}
      {!isEdit && noStudents && (
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
              disabled={!isEdit && noLessonTypes}
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
            {t("dashboard.priceLabel")}:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(price)}</span>{" "}
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
                      disabled={!isEdit && noStudents}
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
            disabled={!isEdit && noStudents}
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

        <div className={isEdit ? "flex gap-2" : ""}>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLesson.isPending}
              className="rounded-lg border border-coral-300 dark:border-coral-700 px-4 py-2.5 text-sm font-medium text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-900/20 disabled:opacity-60"
            >
              {t("common.delete")}
            </button>
          )}
          <button
            type="submit"
            data-testid="log-lesson-submit"
            disabled={isPending || (!isEdit && (noLessonTypes || noStudents))}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {isPending
              ? t("common.saving")
              : isEdit
              ? t("common.save")
              : t("dashboard.saveLesson")}
          </button>
        </div>
      </form>
    </>
  );
}
