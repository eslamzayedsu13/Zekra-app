import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="container-ed pb-10 pt-14 md:pb-16 md:pt-24">
      {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
      <h1 className="max-w-3xl text-5xl leading-[1.05] md:text-7xl">{title}</h1>
      {children ? <div className="mt-6 max-w-xl text-muted-foreground">{children}</div> : null}
    </div>
  );
}

/** Bilingual long-form page body: sections of title + paragraphs. */
export function Prose({ sections }: { sections: { title: string; body: string[] }[] }) {
  return (
    <div className="container-ed grid gap-x-16 gap-y-12 md:grid-cols-[1fr_2fr]">
      {sections.map((s) => (
        <section key={s.title} className="contents">
          <h2 className="border-t border-border pt-6 text-2xl md:text-3xl">{s.title}</h2>
          <div className="space-y-4 border-border pt-0 leading-relaxed text-muted-foreground md:border-t md:pt-6">
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
