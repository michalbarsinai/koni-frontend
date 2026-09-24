import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import SelectField from "./SelectField";
import { useCreatePayment } from "../lib/queries/payments";
import { todayIsoDate } from "../lib/format";
import type { PaymentMethod } from "../lib/types";
import type { PayerWithBalance } from "../lib/types";

const METHODS: PaymentMethod[] = ["bit", "paybox", "cash", "bank_transfer", "other"];

export default function SettleBalanceModal({
  payer,
  onClose,
}: {
  payer: PayerWithBalance;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const createPayment = useCreatePayment();

  const owed = Math.max(0, -parseFloat(payer.balance));
  const [amount, setAmount] = useState(owed > 0 ? owed.toFixed(2) : "");
  const [date, setDate] = useState(todayIsoDate());
  const [method, setMethod] = useState<PaymentMethod>("bit");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPayment.mutateAsync({
        payer_id: payer.id,
        date,
        amount,
        method,
        notes: notes || undefined,
      });
      onClose();
    } catch {
      setError(t("common.error"));
    }
  }

  return (
    <Modal title={t("dashboard.recordPayment", { name: payer.name })} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("dashboard.amount")}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

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
            {t("dashboard.method")}
          </label>
          <SelectField
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {t(`dashboard.method_${m}`)}
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

        {error && <p className="text-sm text-coral-500 dark:text-coral-400">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            data-testid="settle-balance-submit"
            disabled={createPayment.isPending}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-base font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {createPayment.isPending ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
