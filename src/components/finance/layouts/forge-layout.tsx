import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PlannedBillsPreview } from "@/components/finance/PlannedBillsPreview";
import { UrgentBillsCard } from "@/components/finance/UrgentBillsCard";
import { WalletHero } from "@/components/finance/WalletHero";
import { formatEuro } from "@/lib/finance";
import type { FinanceLayoutProps } from "./lucent-layout";

export function ForgeFinanceLayout({
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
    <div className="space-y-10 pt-4 pb-12">
      {/* SECTOR 01: FISCAL_CORE */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">
            Sektors 01
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">
            Fiskālais kodols
          </span>
        </div>

        <WalletHero
          title={locale === "lv" ? "Mūsu maciņš" : "Household wallet"}
          subtitle={
            locale === "lv"
              ? "Operatīvais naudas plūsmas monitorings"
              : "Operational cash flow monitoring"
          }
          total={formatEuro(summary.balance, locale)}
          incomeShare={incomeVsExpense.incomeShare}
          expenseShare={incomeVsExpense.expenseShare}
          initials={householdInitials}
        />

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
      </div>

      {/* SECTOR 02: OBLIGATIONS */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">
            Sektors 02
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">
            Maksājumu saistības
          </span>
        </div>

        <UrgentBillsCard
          title={locale === "lv" ? "Tuvākie maksājumi" : "Upcoming bills"}
          subtitle={
            locale === "lv" ? "STATUS: PENDING_EXECUTION" : "STATUS: PENDING_EXECUTION"
          }
          emptyLabel={locale === "lv" ? "VISAS SAISTĪBAS IZPILDĪTAS" : "ALL OBLIGATIONS MET"}
          items={urgentBills}
          onSwipePay={(billId) => {
            onMarkPaid(billId);
          }}
          payingBillId={payingBillId}
        />

        <PlannedBillsPreview
          title={locale === "lv" ? "Plānotās operācijas" : "Planned operations"}
          subtitle={locale === "lv" ? "Mēneša cikla prognoze" : "Monthly cycle forecast"}
          emptyLabel={
            locale === "lv"
              ? "NĀKOTNES OPERĀCIJAS NAV REĢISTRĒTAS"
              : "NO FUTURE OPERATIONS REGISTERED"
          }
          items={plannedBills}
        />
      </div>
    </div>
  );
}
