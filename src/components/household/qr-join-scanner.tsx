"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { parseInviteCodeFromQr } from "@/lib/household";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  onDetected: (code: string) => void;
};

export function QrJoinScanner({ onDetected }: Props) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;

    let cancelled = false;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const data =
          typeof result === "string" ? result : result.data;
        const code = parseInviteCodeFromQr(data);
        if (!code || cancelled) return;
        onDetected(code);
        setOpen(false);
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    );

    scannerRef.current = scanner;

    scanner
      .start()
      .catch(() =>
        setError(t("household.scan.error")),
      );

    return () => {
      cancelled = true;
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [onDetected, open, t]);

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="w-full rounded-xl border border-(--color-surface-border) px-4 py-3 text-sm font-medium text-(--color-text)"
        >
          {t("household.scan.open")}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-(--color-surface-border) p-3">
          <p className="text-xs text-(--color-secondary)">
            {t("household.scan.hint")}
          </p>
          <video
            ref={videoRef}
            className="aspect-square w-full rounded-2xl bg-black object-cover"
            muted
            playsInline
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-xl border border-(--color-surface-border) px-4 py-3 text-sm font-medium text-(--color-text)"
          >
            {t("household.scan.close")}
          </button>
        </div>
      )}
      {error ? (
        <p className="mt-2 text-sm text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
