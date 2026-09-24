import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStudents, useUpdateStudent } from "../lib/queries/students";
import { usePayers } from "../lib/queries/payers";
import AccordionCard from "../components/AccordionCard";
import CreateClientForm from "../components/CreateClientForm";
import EditClientModal from "../components/EditClientModal";
import type { Student } from "../lib/types";

export default function Clients() {
  const { t } = useTranslation();
  const { data: students, isLoading } = useStudents(false);
  const { data: payers } = usePayers();
  const updateStudent = useUpdateStudent();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  const sorted = [...(students ?? [])].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  function payerName(payerId: number): string {
    return payers?.find((p) => p.id === payerId)?.name ?? "—";
  }

  function toggleActive(student: Student) {
    updateStudent.mutate({ id: student.id, active: !student.active });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <AccordionCard
        label={t("clients.addClient")}
        open={addOpen}
        onToggle={() => setAddOpen((o) => !o)}
      >
        <CreateClientForm onSaved={() => setAddOpen(false)} />
      </AccordionCard>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}
        {!isLoading && sorted.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("clients.noStudents")}</p>
        )}

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {sorted.map((student) => (
            <li key={student.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className={`truncate font-medium ${!student.active ? "text-gray-400 dark:text-gray-500" : ""}`}>
                  {student.name}
                  {!student.active && (
                    <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">
                      ({t("clients.inactiveBadge")})
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {t("clients.payer")}: {payerName(student.payer_id)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(student)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(student)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {student.active ? t("clients.deactivate") : t("clients.activate")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && <EditClientModal student={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
