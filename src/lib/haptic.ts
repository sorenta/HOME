/** Light tap feedback where the device supports `navigator.vibrate`. */
export function hapticTap() {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(12);
}
