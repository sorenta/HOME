"use client";

export function PussyWillowFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="maj-pupoli-home-frame relative z-10 mb-4">
      <div className="maj-pupoli-home-frame__ring" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
