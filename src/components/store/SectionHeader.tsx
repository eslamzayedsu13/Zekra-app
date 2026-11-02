import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

export function SectionHeader({
  index,
  label,
  title,
  action,
}: {
  index: number;
  label: string;
  title?: string;
  action?: ReactNode;
}) {
  const { lang } = useI18n();
  const num = formatNumber(index, lang).padStart(2, lang === "ar" ? "٠" : "0");
  return (
    <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">
          {num} <span className="mx-2 text-border">/</span> {label}
        </p>
        {title ? (
          <h2 className="mt-4 max-w-xl text-4xl leading-[1.1] md:text-5xl">{title}</h2>
        ) : null}
      </div>
      {action}
    </div>
  );
}
