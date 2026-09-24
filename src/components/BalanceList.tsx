import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePayers } from "../lib/queries/payers";
import { formatCurrency } from "../lib/format";
import SettleBalanceModal from "./SettleBalanceModal";
import type { PayerWithBalance } from "../lib/types";

export default function BalanceList() {
  const { t } = useTranslation();
  const { data: payers, isLoading } = usePayers();
  const [settlingPayer, setSettlingPayer] = useState<PayerWithBalance | null>(null);

  // Show anyone with a non-zero balance — both what they owe Itamar (debt)
  // and what Itamar owes them back (credit, e.g. from an overpayment).
  const nonZero = (payers ?? [])
    .filter((p) => parseFloat(p.balance) !== 0)
    .sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("dashboard.balances")}</h2>
        <Link to="/balances" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
          {t("dashboard.viewDetails")}
        </Link>
      </div>

      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.loading")}</p>}

      {!isLoading && nonZero.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("dashboard.noDebts")}</p>
      )}

      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {nonZero.map((payer) => {
          const balance = parseFloat(payer.balance);
          const owesUs = balance < 0;
          return (
            <li key={payer.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{payer.name}</p>
                <p className={`text-sm ${owesUs ? "text-coral-500 dark:text-coral-400" : "text-mint-500 dark:text-mint-400"}`}>
                  {formatCurrency(Math.abs(balance))} {owesUs ? t("dashboard.owes") : t("dashboard.weOwe")}
                </p>
              </div>
              {owesUs && (
                <button
                  type="button"
                  onClick={() => setSettlingPayer(payer)}
                  className="shrink-0 rounded-lg border border-brand-500 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                >
                  {t("dashboard.settleBalance")}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {settlingPayer && <SettleBalanceModal payer={settlingPayer} onClose={() => setSettlingPayer(null)} />}
    </div>
  );
}
