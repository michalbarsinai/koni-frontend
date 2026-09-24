import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { usePayers, useCreatePayer } from "../lib/queries/payers";
import SelectField from "./SelectField";
import { useCreateStudent, useCreateSoloStudent } from "../lib/queries/students";

type PayerMode = "self" | "existing" | "new";

export default function CreateClientForm({ onSaved }: { onSaved?: () => void }) {
  const { t } = useTranslation();
  const { data: payers } = usePayers();
  const createStudent = useCreateStudent();
  const createSoloStudent = useCreateSoloStudent();
  const createPayer = useCreatePayer();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payerMode, setPayerMode] = useState<PayerMode>("self");
  const [existingPayerId, setExistingPayerId] = useState("");
  const [newPayerName, setNewPayerName] = useState("");
  const [newPayerPhone, setNewPayerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isPending = createStudent.isPending || createSoloStudent.isPending || createPayer.isPending;

  function resetForm() {
    setName("");
    setPhone("");
    setNotes("");
    setPayerMode("self");
    setExistingPayerId("");
    setNewPayerName("");
    setNewPayerPhone("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (payerMode === "self") {
        await createSoloStudent.mutateAsync({ name, phone: phone || undefined, notes: notes || undefined });
      } else if (payerMode === "existing") {
        if (!existingPayerId) {
          setError(t("common.error"));
          return;
        }
        await createStudent.mutateAsync({
          name,
          payer_id: Number(existingPayerId),
          phone: phone || undefined,
          notes: notes || undefined,
        });
      } else {
        const payer = await createPayer.mutateAsync({
          name: newPayerName,
          phone: newPayerPhone || undefined,
        });
        await createStudent.mutateAsync({
          name,
          payer_id: payer.id,
          phone: phone || undefined,
          notes: notes || undefined,
        });
      }
      resetForm();
      onSaved?.();
    } catch {
      setError(t("common.error"));
    }
  }

  return (
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
          {t("clients.payerMode")}
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payerMode"
              checked={payerMode === "self"}
              onChange={() => setPayerMode("self")}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500/30"
            />
            {t("clients.payerSelf")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payerMode"
              checked={payerMode === "existing"}
              onChange={() => setPayerMode("existing")}
              disabled={(payers?.length ?? 0) === 0}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500/30 disabled:opacity-50"
            />
            {t("clients.payerExisting")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payerMode"
              checked={payerMode === "new"}
              onChange={() => setPayerMode("new")}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500/30"
            />
            {t("clients.payerNew")}
          </label>
        </div>
      </div>

      {payerMode === "existing" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("clients.payer")}
          </label>
          <SelectField
            required
            value={existingPayerId}
            onChange={(e) => setExistingPayerId(e.target.value)}
          >
            <option value="">{t("clients.selectPayer")}</option>
            {payers?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {payerMode === "new" && (
        <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("clients.payerName")}
            </label>
            <input
              type="text"
              required
              value={newPayerName}
              onChange={(e) => setNewPayerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("clients.payerPhone")} <span className="text-gray-400">({t("common.optional")})</span>
            </label>
            <input
              type="text"
              value={newPayerPhone}
              onChange={(e) => setNewPayerPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
      )}

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
        data-testid="create-client-submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {isPending ? t("common.saving") : t("clients.create")}
      </button>
    </form>
  );
}
