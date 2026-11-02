import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const { t } = useI18n();
  const active = has(productId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(productId);
      }}
      aria-pressed={active}
      aria-label={active ? t("wishlist_remove") : t("wishlist_add")}
      className={cn("grid size-9 place-items-center transition-colors", className)}
    >
      <Heart
        className={cn("size-[18px] stroke-[1.25]", active && "fill-rose-deep stroke-rose-deep")}
      />
    </button>
  );
}
