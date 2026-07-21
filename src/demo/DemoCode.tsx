interface DemoCodeProps {
  readonly code: string;
  readonly label?: string;
}

// Demo 内的代码示例展示块：深底卡片 + mono 字体，与 stage 的深色视觉保持一致。
// code 为纯文本（不做语法高亮，避免引入依赖），原样保留换行与缩进。
export function DemoCode({ code, label = 'TSX' }: DemoCodeProps) {
  return (
    <figure className="demo-code">
      <figcaption className="demo-code__label">{label}</figcaption>
      <pre className="demo-code__body">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
