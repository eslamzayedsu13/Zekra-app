import ringdish from "@/assets/hero.jpg";
import journal from "@/assets/p-journal.jpg";
import necklace from "@/assets/p-necklace.jpg";
import candle from "@/assets/p-candle.jpg";
import starmap from "@/assets/p-starmap.jpg";
import box from "@/assets/p-box.jpg";
import frame from "@/assets/p-frame.jpg";
import silk from "@/assets/p-silk.jpg";
import giftbox from "@/assets/p-giftbox.jpg";

/** Built-in photo library. Product rows store either a key from here or a full https URL. */
export const IMAGE_LIBRARY: Record<string, string> = {
  ringdish,
  journal,
  necklace,
  candle,
  starmap,
  box,
  frame,
  silk,
  giftbox,
};

export function resolveImage(key: string | null | undefined): string {
  if (!key) return giftbox;
  if (/^https:\/\//.test(key)) return key;
  return IMAGE_LIBRARY[key] ?? giftbox;
}
