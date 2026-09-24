import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import {
  useLessonTypes,
  useCreateLessonType,
  useUpdateLessonType,
  useDeleteLessonType,
} from "../lib/queries/lessonTypes";
import LessonTypeForm, { type LessonTypeFormValues } from "../components/LessonTypeForm";
import AccordionCard from "../components/AccordionCard";
import Modal from "../components/Modal";
import { formatCurrency } from "../lib/format";
import type { LessonType } from "../lib/types";

export default function LessonTypes() {
  const { t } = useTranslation();
  const { data: lessonTypes, isLoading } = useLessonTypes();
  const createLessonType = useCreateLessonType();
  const updateLessonType = useUpdateLessonType();
  const deleteLessonType = useDeleteLessonType();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LessonType | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function errorMessage(err: unknown): string {
    if (isAxiosError(err)) {
      if (err.response?.status === 409) return t("lessonTypes.nameTaken");
    }
    return t("common.error");
  }

  async function handleCreate(values: LessonTypeFormValues) {
    setCreateError(null);
    try {
      await createLessonType.mutateAsync(values);
      setShowCreate(false);
    } catch (err) {
      setCreateError(errorMessage(err));
    }
  }

  async function handleUpdate(values: LessonTypeFormValues) {
    if (!editing) return;
    setEditError(null);
    try {
      await updateLessonType.mutateAsync({ id: editing.id, ...values });
      setEditing(null);
    } catch (err) {
      setEditError(errorMessage(err));
    }
  }

  async function handleDelete(lt: LessonType) {
    setDeleteError(null);
    if (!window.confirm(t("lessonTypes.deleteConfirm"))) return;
    try {
      await deleteLessonType.mutateAsync(lt.id);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setDeleteError(t("lessonTypes.deleteInUse"));
      } else {
        setDeleteError(t("common.error"));
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccordionCard
        label={t("lessonTypes.addNew")}
        open={showCreate}
        onToggle={() => {
          setShowCreate((o) => !o);
          setCreateError(null);
        }}
      >
        <LessonTypeForm
          onSubmit={handleCreate}
          onCancel={() => {
            setShowCreate(false);
            setCreateError(null);
          }}
          submitLabel={t("lessonTypes.create")}
          isPending={createLessonType.isPending}
          error={createError}
          submitTestId="lesson-type-create-submit"
        />
      </AccordionCard>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}
        {!isLoading && (lessonTypes?.length ?? 0) === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("lessonTypes.noLessonTypes")}</p>
        )}
        {deleteError && <p className="mb-3 text-sm text-coral-500 dark:text-coral-400">{deleteError}</p>}

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {lessonTypes?.map((lt) => (
            <li key={lt.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{lt.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lt.default_price_per_student && `${formatCurrency(lt.default_price_per_student)} / `}
                  {lt.students.length > 0
                    ? t("lessonTypes.rosterLabel", { count: lt.students.length })
                    : t("lessonTypes.genericLabel")}
                </p>
                {lt.students.length > 0 && (
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                    {lt.students
                      .map((s) => (s.active ? s.name : `${s.name} (${t("lessonTypes.inactiveBadge")})`))
                      .join(", ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(lt)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(lt)}
                  className="rounded-lg border border-coral-300 dark:border-coral-700 px-3 py-1.5 text-sm font-medium text-coral-500 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-900/20"
                >
                  {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <Modal title={t("common.edit")} onClose={() => setEditing(null)}>
          <LessonTypeForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel={t("common.save")}
            isPending={updateLessonType.isPending}
            error={editError}
            submitTestId="lesson-type-edit-submit"
          />
        </Modal>
      )}
    </div>
  );
}
