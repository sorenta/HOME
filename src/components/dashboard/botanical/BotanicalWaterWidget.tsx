"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { StatusPill } from "@/components/ui/status-pill";
import { useState, useMemo, useCallback } from "react";
import { type HouseholdMember } from "@/lib/household";

export type BotanicalWaterWidgetProps = {
  members?: HouseholdMember[];
  currentUserId?: string | null;
  water: Record<string, number>;
  goal?: number;
  addForMember: (memberId: string, amount: number) => void;
};

// BotanicalWaterWidget: Organic, carved, animated progress bar
export function BotanicalWaterWidget({ members = [], currentUserId = null, water, goal = 2000, addForMember }: BotanicalWaterWidgetProps) {
	const { t } = useI18n();
	const effectiveMembers = useMemo(() => members.length ? members : [], [members]);
	const date = new Date().toISOString().slice(0, 10);

	if (!water || effectiveMembers.length === 0) return null;

	return (
		<section
			className="relative flex flex-col p-6 transition-all"
			style={{
				borderRadius: "60% 40% 65% 35% / 40% 50% 50% 60%", // Pebble/Stone shape
				background: "linear-gradient(135deg, #e6f4e0 0%, #f5f2eb 100%)",
				boxShadow: "inset 0 10px 30px rgba(62,107,50,0.13), inset 0 -4px 10px rgba(255,255,255,0.5)",
				border: "2px solid rgba(160,140,118,0.13)",
				minHeight: 220,
			}}
		>
			<div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply"
				style={{
					backgroundImage: "radial-gradient(ellipse at center, transparent 30%, rgba(62,107,50,0.18) 100%), repeating-radial-gradient(circle at 0 0, transparent 0, transparent 10px, rgba(62,107,50,0.09) 10px, rgba(62,107,50,0.09) 11px)",
					borderRadius: "60% 40% 65% 35% / 40% 50% 50% 60%",
				}}
			/>
			<div className="relative z-10">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-(--color-primary)">{t("water.widget.eyebrow")}</p>
				<h2 className="maj-theme-section-title mt-0.5">{t("water.widget.title")}</h2>
				<p className="maj-theme-subtitle mt-1 text-xs text-(--color-text-secondary)">{t("water.widget.hint")}</p>
				<ul className="mt-3 divide-y divide-[color-mix(in_srgb,var(--color-border)_65%,transparent)]">
					{effectiveMembers.map((m) => {
						const ml = water[m.id] || 0;
						const pct = Math.min(100, Math.round((ml / goal) * 100));
						const isMe = m.is_me || m.id === currentUserId;
						return (
							<li key={m.id} className="py-3 first:pt-0 last:pb-0">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div>
										<p className="font-(family-name:--font-theme-display) font-semibold text-(--color-text-primary)">{m.display_name || t("household.membersList.member")}</p>
										<p className="text-xs text-(--color-secondary)">{ml} / {goal} ml</p>
									</div>
									{isMe ? (
										<div className="flex flex-wrap gap-1.5">
											<button type="button" onClick={() => addForMember(m.id, 250)} className="rounded-full border border-(--color-surface-border) px-2.5 py-1 text-xs font-semibold text-(--color-text)">+250 ml</button>
											<button type="button" onClick={() => addForMember(m.id, 500)} className="rounded-full border border-(--color-surface-border) px-2.5 py-1 text-xs font-semibold text-(--color-text)">+500 ml</button>
										</div>
									) : null}
								</div>
								<div className="mt-2 h-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-lime-200 to-amber-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
									<div
										className="h-full rounded-full animate-pulse transition-[width] duration-700"
										style={{
											width: `${pct}%`,
											background: "linear-gradient(90deg, #7fc97f 0%, #b5e48c 60%, #f9f871 100%)",
											boxShadow: "0 1px 8px 0 rgba(62,107,50,0.13)",
										}}
									/>
								</div>
								<div className="mt-1.5">
									<StatusPill tone={pct >= 100 ? "good" : pct >= 50 ? "neutral" : "warn"}>
										{pct >= 100 ? t("water.widget.goalMet") : t("water.widget.goalOpen", { pct: String(pct) })}
									</StatusPill>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}