import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PlannedBillsPreview } from "@/components/finance/PlannedBillsPreview";
import { UrgentBillsCard } from "@/components/finance/UrgentBillsCard";
import { WalletHero } from "@/components/finance/WalletHero";
import { formatEuro } from "@/lib/finance";
import type { FinanceLayoutProps } from "./lucent-layout";

export function HiveFinanceLayout({
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
    <div className="space-y-6 pt-4 pb-12">
      <div className="hive-amber relative overflow-hidden rounded-[24px]">
        <WalletHero
          title={locale === "lv" ? "Kopējā krātuve" : "Shared vault"}
          subtitle={locale === "lv" ? "Resursu bilance" : "Resource balance"}
          total={formatEuro(summary.balance, locale)}
          incomeShare={incomeVsExpense.incomeShare}
          expenseShare={incomeVsExpense.expenseShare}
          initials={householdInitials}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
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

        <div className="maj-hive-metrics-honey">
          <UrgentBillsCard
            title={locale === "lv" ? "Aktuālās šūnas" : "Active cells"}
            subtitle="Maksājumu koordinācija"
            emptyLabel={locale === "lv" ? "STROPS IR SAKĀRTOTS" : "HIVE IS ORGANIZED"}
            items={urgentBills}
            onSwipePay={(billId) => {
              onMarkPaid(billId);
            }}
            payingBillId={payingBillId}
          />
        </div>

        <PlannedBillsPreview
          title={locale === "lv" ? "Nākotnes krājumi" : "Future stores"}
          subtitle="Gaidāmās plūsmas"
          emptyLabel={locale === "lv" ? "NAV GAIDĀMU IERAKSTU" : "NO UPCOMING ENTRIES"}
          items={plannedBills}
        />
      </div>
    </div>
  );
}
