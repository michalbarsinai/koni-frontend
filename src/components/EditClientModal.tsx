import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import SelectField from "./SelectField";
import { usePayers } from "../lib/queries/payers";
import { useUpdateStudent } from "../lib/queries/students";
import type { Student } from "../lib/types";

export default function EditClientModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const { t } = useTranslation();
  const { data: payers } = usePayers();
  const updateStudent = useUpdateStudent();

  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(student.phone ?? "");
  const [notes, setNotes] = useState(student.notes ?? "");
  const [payerId, setPayerId] = useState(String(student.payer_id));
  const [active, setActive] = useState(student.active);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateStudent.mutateAsync({
        id: student.id,
        name,
        phone: phone || null,
        notes: notes || null,
        payer_id: Number(payerId),
        active,
      });
      onClose();
    } catch {
      setError(t("common.error"));
    }
  }

  return (
    <Modal title={t("clients.editTitle")} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("clients.studentName")}
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
            {t("clients.phone")} <span className="text-gray-400">({t("common.optional")})</span>
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("clients.payer")}
          </label>
          <SelectField
            required
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
          >
            {payers?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500/30"
          />
          {t("clients.active")}
        </label>

        {error && <p className="text-sm text-coral-500 dark:text-coral-400">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            data-testid="edit-client-submit"
            disabled={updateStudent.isPending}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {updateStudent.isPending ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
