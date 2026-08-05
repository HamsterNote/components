import { NoteContent, type NoteBlock } from '@hamster-note/notes';
import { useEffect, useId, useMemo, useRef, useState, type SyntheticEvent } from 'react';

export interface CommentNoteEditorProps {
  readonly autoFocus?: boolean;
  readonly labelId: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly value: string;
}

export function CommentNoteEditor({
  autoFocus = false,
  labelId,
  onChange,
  placeholder,
  value,
}: CommentNoteEditorProps) {
  const paragraphId = useId();
  const didAutoFocusRef = useRef(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const emittedValueRef = useRef(value);
  const [blocks, setBlocks] = useState<readonly NoteBlock[]>(() => [
    { id: paragraphId, kind: 'paragraph', text: value },
  ]);

  useEffect(() => {
    if (value === emittedValueRef.current) {
      return;
    }

    emittedValueRef.current = value;
    setBlocks([{ id: paragraphId, kind: 'paragraph', text: value }]);
    const editable = editorRef.current?.querySelector<HTMLElement>(
      '.hn-note-body [role="textbox"]',
    );
    if (editable !== undefined && editable !== null) {
      editable.textContent = value;
    }
  }, [paragraphId, value]);

  useEffect(() => {
    const titleEditor = editorRef.current?.querySelector<HTMLElement>(
      '.hn-note-hero [contenteditable]',
    );
    titleEditor?.setAttribute('aria-hidden', 'true');
    titleEditor?.setAttribute('contenteditable', 'false');
    titleEditor?.setAttribute('tabindex', '-1');

    const editableBlocks = editorRef.current?.querySelectorAll<HTMLElement>(
      '.hn-note-body [role="textbox"]',
    );
    if (editableBlocks === undefined || editableBlocks.length === 0) {
      return;
    }

    for (const editable of editableBlocks) {
      editable.setAttribute('aria-labelledby', labelId);
      editable.setAttribute('aria-placeholder', placeholder);
    }
    if (autoFocus && !didAutoFocusRef.current) {
      didAutoFocusRef.current = true;
      editableBlocks[0]?.focus();
    }
  }, [autoFocus, blocks, labelId, placeholder]);

  useEffect(() => {
    const editableBlocks = editorRef.current?.querySelectorAll<HTMLElement>(
      '.hn-note-body [role="textbox"]',
    );
    const nextValue = Array.from(editableBlocks ?? [], (editable) => editable.textContent).join(
      '\n',
    );
    if (nextValue === emittedValueRef.current) {
      return;
    }

    // Enter 等结构化操作由 Notes 通过 onBlocksChange 提交；等新 blocks 渲染完成后，
    // 再从真实编辑 DOM 汇总纯文本，确保评论值保留段落间的换行。
    emittedValueRef.current = nextValue;
    onChange(nextValue);
  }, [blocks, onChange]);

  function readEditorValue() {
    const editableBlocks = editorRef.current?.querySelectorAll<HTMLElement>(
      '.hn-note-body [role="textbox"]',
    );
    return Array.from(editableBlocks ?? [], (editable) => editable.textContent).join('\n');
  }

  function emitEditorValue(nextValue: string) {
    emittedValueRef.current = nextValue;
    onChange(nextValue);
  }

  function handleInput(event: SyntheticEvent<HTMLDivElement, InputEvent>) {
    if (event.target instanceof HTMLElement && event.target.matches('[role="textbox"]')) {
      const nextValue = readEditorValue();
      emitEditorValue(nextValue);
    }
  }

  const editor = useMemo(
    () => <NoteContent blocks={blocks} editable onBlocksChange={setBlocks} title="" />,
    [blocks],
  );

  return (
    <div className="hn-comment-note-editor" onInputCapture={handleInput} ref={editorRef}>
      {editor}
    </div>
  );
}
