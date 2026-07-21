import type { HTMLAttributes, ReactNode } from 'react';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  readonly children?: ReactNode;
  readonly keys?: readonly string[];
}

function renderKeySequence(keys: readonly string[]): ReactNode[] {
  const seen = new Map<string, number>();
  const nodes: ReactNode[] = [];
  keys.forEach((key) => {
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (nodes.length > 0) {
      const plusIndex = nodes.length.toString();
      nodes.push(
        <span aria-hidden="true" className="hn-kbd__plus" key={`plus-${plusIndex}`}>
          +
        </span>,
      );
    }
    const occurrence = count.toString();
    nodes.push(
      <kbd className="hn-kbd__key" key={`${key}-${occurrence}`}>
        {key}
      </kbd>,
    );
  });
  return nodes;
}

export function Kbd({ children, className, keys, ...props }: KbdProps) {
  const classes = ['hn-kbd', className].filter(Boolean).join(' ');

  if (keys !== undefined && keys.length > 0) {
    return (
      <kbd className={classes} {...props}>
        {renderKeySequence(keys)}
      </kbd>
    );
  }

  return (
    <kbd className={classes} {...props}>
      <kbd className="hn-kbd__key">{children}</kbd>
    </kbd>
  );
}
