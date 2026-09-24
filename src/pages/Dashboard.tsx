import { useState } from "react";
import { useTranslation } from "react-i18next";
import LogLessonForm from "../components/LogLessonForm";
import BalanceList from "../components/BalanceList";
import AccordionCard from "../components/AccordionCard";

export default function Dashboard() {
  const { t } = useTranslation();
  const [logOpen, setLogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  function handleSaved() {
    setLogOpen(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {justSaved && (
        <p className="text-sm font-medium text-mint-500 dark:text-mint-400">{t("dashboard.lessonSaved")}</p>
      )}
      <AccordionCard label={t("dashboard.logLesson")} open={logOpen} onToggle={() => setLogOpen((o) => !o)}>
        <LogLessonForm onSaved={handleSaved} />
      </AccordionCard>
      <BalanceList />
    </div>
  );
}
