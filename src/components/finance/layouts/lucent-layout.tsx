import { FinanceQuickActions } from "@/components/finance/FinanceQuickActions";
import { PlannedBillsPreview } from "@/components/finance/PlannedBillsPreview";
import { UrgentBillsCard } from "@/components/finance/UrgentBillsCard";
import { WalletHero } from "@/components/finance/WalletHero";
import { FinanceSavingsGoals, type SavingsGoal } from "@/components/finance/FinanceSavingsGoals";
import { formatEuro } from "@/lib/finance";

// MÄ“s definÄ“jam interfeisu, ko pieÅ†ems visi izkÄrtojumi
export interface FinanceLayoutProps {
  summary: { balance: number; income: number; expense: number };
  urgentBills: any[];
  plannedBills: any[];
  goals: SavingsGoal[];
  householdInitials: string[];
  incomeVsExpense: { incomeShare: number; expenseShare: number };
  locale: "lv" | "en";
  primaryUrgentBill: string | null;
  payingBillId: string | null;
  onAddExpense: () => void;
  onAddPayment: () => void;
  onMarkPaid: (billId?: string) => void;
  onEdit: () => void;
}

export function LucentFinanceLayout({
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
  const isSolo = householdInitials.length <= 1;

  return (
    <div className="space-y-12 pt-8 pb-20 px-2 sm:px-4">
      {/* 1. Mūsu maciņš - Galvenais pārskats */}
      <section className="space-y-6">
        <WalletHero
          title={locale === "lv" ? "Mūsu maciņš" : "Our Wallet"}
          subtitle={locale === "lv" ? "Mierīga naudas plūsma" : "Calm cash flow"}
          total={formatEuro(summary.balance, locale)}
          incomeShare={incomeVsExpense.incomeShare}
          expenseShare={incomeVsExpense.expenseShare}
          initials={householdInitials}
        />

        {/* 2. Ātrās darbības */}
        <div className="pt-2">
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
      </section>

      {/* 3. Drīzumā jāparūpējas (Tuvākie rēķini) */}
      <section className="space-y-6">
        <div className="px-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {locale === "lv" ? "Drīzumā jāparūpējas" : "Needs attention soon"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {locale === "lv" ? "Lietas, kas jāapmaksā tuvākajās dienās" : "Bills due in the next few days"}
          </p>
        </div>

        <UrgentBillsCard
          title={locale === "lv" ? "Tuvākie rēķini" : "Upcoming bills"}
          subtitle="" // Noņemam kiberpanka "STATUS: PENDING"
          emptyLabel={locale === "lv" ? "Viss ir nokārtots, paldies!" : "Everything is settled, thanks!"}
          items={urgentBills}
          onSwipePay={(billId) => {
            onMarkPaid(billId);
          }}
          payingBillId={payingBillId}
        />
      </section>

      {/* 4. Kas gaidāms tālāk? (Plānotās operācijas) */}
      <section className="space-y-6">
        <div className="px-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {locale === "lv" ? "Kas gaidāms tālāk?" : "What's coming up?"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {locale === "lv" ? "Mēneša turpinājums" : "The rest of the month"}
          </p>
        </div>

        <PlannedBillsPreview
          title={locale === "lv" ? "Plānotie rēķini" : "Planned bills"}
          subtitle=""
          emptyLabel={locale === "lv" ? "Vairāk rēķinu šomēnes nav plānots." : "No more bills planned for this month."}
          items={plannedBills}
        />
      </section>

      {/* 5. Mūsu sapņi (Krāšanas mērķi) */}
      <section className="space-y-6 pt-6 border-t border-slate-100/50">
        <div className="px-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {isSolo ? (locale === "lv" ? "Mani sapņi" : "My dreams") : (locale === "lv" ? "Mūsu sapņi" : "Our dreams")}
          </h3>
        </div>
        <FinanceSavingsGoals isSolo={isSolo} goals={goals} />
      </section>
    </div>
  );
}
