import { useI18n } from "@/lib/i18n";
import { pages } from "@/lib/content";
import { PageIntro, Prose } from "./PageIntro";

export function ContentPage({ page }: { page: keyof typeof pages }) {
  const { lang } = useI18n();
  const c = pages[page]![lang];
  return (
    <>
      <PageIntro title={c.title}>{c.intro}</PageIntro>
      <Prose sections={c.sections} />
    </>
  );
}
