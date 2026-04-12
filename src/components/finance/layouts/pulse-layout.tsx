import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PlannedBillsPreview } from "@/components/finance/PlannedBillsPreview";
import { UrgentBillsCard } from "@/components/finance/UrgentBillsCard";
import { WalletHero } from "@/components/finance/WalletHero";
import { formatEuro } from "@/lib/finance";
import type { FinanceLayoutProps } from "./lucent-layout";

export function PulseFinanceLayout({
  summary,
  urgentBills,
  plannedBills,
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
    <div className="space-y-12 pt-4 pb-12">
      <div className="pulse-pop relative">
        <WalletHero
          title={locale === "lv" ? "Mūsu maciņš" : "Household wallet"}
          subtitle={locale === "lv" ? "Naudas plūsma" : "Cash flow"}
          total={formatEuro(summary.balance, locale)}
          incomeShare={incomeVsExpense.incomeShare}
          expenseShare={incomeVsExpense.expenseShare}
          initials={householdInitials}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
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

        <UrgentBillsCard
          title={locale === "lv" ? "Tuvākie rēķini" : "Upcoming bills"}
          subtitle="BUM! Laiks maksāt"
          emptyLabel={locale === "lv" ? "VISS SAMAKSĀTS!" : "ALL CLEAR!"}
          items={urgentBills}
          onSwipePay={(billId) => {
            onMarkPaid(billId);
          }}
          payingBillId={payingBillId}
        />

        <PlannedBillsPreview
          title={locale === "lv" ? "Plānotie rēķini" : "Planned bills"}
          subtitle="Gatavojies!"
          emptyLabel={locale === "lv" ? "NAV PLĀNOTU MAKSĀJUMU" : "NO PLANNED PAYMENTS"}
          items={plannedBills}
        />
      </div>
    </div>
  );
}
