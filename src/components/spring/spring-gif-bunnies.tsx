"use client";

import Image from "next/image";
import originalBunny from "./original-c5e2239ecc1cc216017604428eb0006f.gif";
import thumperBunny from "./thumper-faint.gif";

/**
 * Decorative Easter GIF bunnies from the spring asset folder.
 */
export function SpringGifBunnies() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+98px)] left-3 z-[44] opacity-90"
      >
        <Image
          src={originalBunny}
          alt=""
          unoptimized
          priority
          className="h-auto w-[88px] rounded-full bg-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.10)]"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+108px)] right-3 z-[44] opacity-80"
      >
        <Image
          src={thumperBunny}
          alt=""
          unoptimized
          className="h-auto w-[108px] rounded-2xl shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
        />
      </div>
    </>
  );
}