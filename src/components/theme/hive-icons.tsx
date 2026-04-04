import React from "react";

export function IconBee({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 10c1.5 0 3-1 4-1s2.5 1 4 1 2 2 2 3-1 3-2.5 3S12 16 10 16s-6 0-6-3 2-3 2-3z" fill="currentColor" />
      <path d="M9 6c.9-.5 2-.6 3 0" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHoneyJar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth={1.3} fill="none" />
      <path d="M9 6c0-1 0.5-2 3-2s3 1 3 2" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  );
}

export function IconHex({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2l7 4v8l-7 4-7-4V6l7-4z" stroke="currentColor" strokeWidth={1.2} fill="none" />
    </svg>
  );
}

export default {
  IconBee,
  IconHoneyJar,
  IconHex,
};
