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

export function DefaultProfileLayout({
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
    <div className="space-y-4">
      <ProfileHero
        displayName={displayName}
        role={role}
        email={email}
        statusText={statusText}
        onEditProfile={onEditProfile}
      />

      <HouseholdCard
        household={household}
        roleLabel={role}
        members={householdMembers}
      />

      <ProfileSummary
        resetScore={resetScore}
        celebrationsCount={celebrationsCount}
        householdMemberCount={householdMemberCount}
        medals={medals}
      />
    </div>
  );
}
