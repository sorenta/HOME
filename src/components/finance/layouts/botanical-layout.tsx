import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PlannedBillsPreview } from "@/components/finance/PlannedBillsPreview";
import { UrgentBillsCard } from "@/components/finance/UrgentBillsCard";
import { WalletHero } from "@/components/finance/WalletHero";
import { formatEuro } from "@/lib/finance";
import type { FinanceLayoutProps } from "./lucent-layout";

export function BotanicalFinanceLayout({
  summary,
  urgentBills,
  plannedBills,
  goals,
  householdInitials,
  incomeVsExpense,
  locale,
  primaryUrgentBill,
  payingBillId,
  onAddExpense,
  onAddPayment,
  onMarkPaid,
  onEdit,
}: FinanceLayoutProps) {
  return (
    <div className="space-y-8 pt-4 pb-12">
      <div className="botanical-leaf relative overflow-hidden rounded-[32px_8px_32px_8px]">
        <WalletHero
          title={locale === "lv" ? "Mājas uzkrājumi" : "Household funds"}
          subtitle={locale === "lv" ? "Naudas dabiskā plūsma" : "Natural money flow"}
          total={formatEuro(summary.balance, locale)}
          incomeShare={incomeVsExpense.incomeShare}
          expenseShare={incomeVsExpense.expenseShare}
          initials={householdInitials}
        />
      </div>

      <div className="space-y-6">
        <FinanceQuickActions
          onAddExpense={onAddExpense}
          onAddPayment={onAddPayment}
          onMarkPaid={() => {
            if (primaryUrgentBill) {
              onMarkPaid(primaryUrgentBill);
              return;
            }
            onMarkPaid();
          }}
          onEdit={onEdit}
        />

        <div className="maj-botanical-shelf">
          <UrgentBillsCard
            title={locale === "lv" ? "Tuvākie darbi" : "Upcoming tasks"}
            subtitle="Svarīgi maksājumi"
            emptyLabel={locale === "lv" ? "VISS IR SAKĀRTOTS" : "EVERYTHING IS ORGANIZED"}
            items={urgentBills}
            onSwipePay={(billId) => {
              onMarkPaid(billId);
            }}
            payingBillId={payingBillId}
          />
        </div>

        <div className="maj-botanical-shelf">
          <PlannedBillsPreview
            title={locale === "lv" ? "Nākotnes plāni" : "Future plans"}
            subtitle="Mēneša prognoze"
            emptyLabel={locale === "lv" ? "NAV PLĀNOTU NOTIKUMU" : "NO PLANNED EVENTS"}
            items={plannedBills}
          />
        </div>
      </div>
    </div>
  );
}
