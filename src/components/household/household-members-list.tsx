"use client";

import { useEffect, useState } from "react";
import {
  fetchMyHouseholdMembers,
  type HouseholdMember,
} from "@/lib/household";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";

export function HouseholdMembersList() {
  const { t } = useI18n();
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const nextMembers = await fetchMyHouseholdMembers();
      if (!alive) return;
      setMembers(nextMembers);
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <GlassPanel className="space-y-3">
      <SectionHeading title={t("household.membersList.title")} />
      {members.length === 0 ? (
        <p className="text-sm text-[color:var(--color-secondary)]">
          {t("household.membersList.empty")}
        </p>
      ) : (
        members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
          >
            <div>
              <p className="font-medium text-[color:var(--color-text)]">
                {member.display_name ?? t("household.membersList.unknown")}
              </p>
              <p className="text-xs text-[color:var(--color-secondary)]">
                {member.role_label ?? t("household.membersList.member")}
              </p>
            </div>
            {member.is_me ? (
              <StatusPill tone="good">{t("household.membersList.you")}</StatusPill>
            ) : (
              <StatusPill>{t("household.membersList.member")}</StatusPill>
            )}
          </div>
        ))
      )}
    </GlassPanel>
  );
}
