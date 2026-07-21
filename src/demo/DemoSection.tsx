import type { ReactNode } from 'react';

interface DemoSectionProps {
  readonly children: ReactNode;
  readonly description: string;
  readonly eyebrow: string;
  readonly id: string;
  readonly title: string;
}

export function DemoSection({ children, description, eyebrow, id, title }: DemoSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="demo-section" id={id}>
      <header className="demo-section__intro">
        <p className="demo-section__eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="demo-stage">{children}</div>
    </section>
  );
}
