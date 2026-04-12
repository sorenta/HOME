import { ProfileHero } from "@/components/profile/profile-hero";
import { HouseholdCard } from "@/components/profile/household-card";
import { ProfileSummary } from "@/components/profile/profile-summary";
import type { Household, HouseholdMember } from "@/lib/household";

type Props = {
  displayName: string;
  role: string;
  email?: string;
  statusText: string;
  onEditProfile: () => void;
  household: Household | null;
  householdMembers: HouseholdMember[];
  resetScore: number;
  celebrationsCount: number;
  householdMemberCount: number;
  medals: any;
};

export function ForgeProfileLayout({
  displayName,
  role,
  email,
  statusText,
  onEditProfile,
  household,
  householdMembers,
  resetScore,
  celebrationsCount,
  householdMemberCount,
  medals,
}: Props) {
  return (
    <div className="space-y-10 pt-4 pb-12">
      {/* SECTOR 01: IDENTITY_PROFILE */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Identitātes profils</span>
        </div>
        <ProfileHero
          displayName={displayName}
          role={role}
          email={email}
          statusText={statusText}
          onEditProfile={onEditProfile}
        />
      </div>

      {/* SECTOR 02: HOUSEHOLD_UNIT */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Mājsaimniecības vienība</span>
        </div>
        <HouseholdCard
          household={household}
          roleLabel={role}
          members={householdMembers}
        />
      </div>

      {/* SECTOR 03: PERSONNEL_MANIFEST */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Personāla manifests</span>
        </div>
        <ProfileSummary
          resetScore={resetScore}
          celebrationsCount={celebrationsCount}
          householdMemberCount={householdMemberCount}
          medals={medals}
        />
      </div>
    </div>
  );
}
