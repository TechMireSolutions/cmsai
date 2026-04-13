import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Heading2, Heading3 } from 'lucide-react';
import { OffToneHighlight, offToneKey, buildOffToneDecorations } from '../extensions/OffToneHighlight';
import { DecorationSet } from '@tiptap/pm/view';

export default function Editor({ onUpdate, resetRef, editorActionsRef, initialContent }) {
  const getDefaultContent = () => {
    if (initialContent === null) {
      return `<p>Welcome to <strong>SentiWrite AI</strong> — your intelligent brand voice companion. Start writing here and watch the real-time analysis light up on the right.</p>`;
    }
    if (initialContent === '') return '';
    if (initialContent.includes('<p>')) return initialContent;
    return initialContent.split('\n').map(p => `<p>${p || '<br/>'}</p>`).join('');
  };

  const editor = useEditor({
    extensions: [StarterKit, OffToneHighlight],
    content: getDefaultContent(),
    onUpdate({ editor }) {
      onUpdate(editor.getText(), editor.getHTML());
    },
    editorProps: {
      attributes: {
        'data-placeholder': 'Start crafting your brand-aware content…',
      },
    },
  });

  /* ── Expose actions to App.jsx via ref ── */
  useEffect(() => {
    if (!editorActionsRef || !editor) return;

    /**
     * Apply red wavy underlines to off-tone sentences.
     * @param {Array<{text: string}>} offToneSentences
     */
    editorActionsRef.current.highlightOffTone = (offToneSentences) => {
      if (editor.isDestroyed) return;
      const { state, view } = editor;
      const decoSet = buildOffToneDecorations(state.doc, offToneSentences);
      view.dispatch(state.tr.setMeta(offToneKey, decoSet));
    };

    /**
     * Clear all off-tone highlights.
     */
    editorActionsRef.current.clearHighlights = () => {
      if (editor.isDestroyed) return;
      const { state, view } = editor;
      view.dispatch(state.tr.setMeta(offToneKey, DecorationSet.empty));
    };

    /**
     * Find `searchText` in the doc and replace the first occurrence with `replacement`.
     * Returns true if a replacement was made.
     */
    editorActionsRef.current.replaceText = (searchText, replacement) => {
      if (!searchText || !replacement || editor.isDestroyed) return false;
      const needle = searchText.trim();
      let replaced = false;

      editor.commands.command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (replaced || !node.isText) return;
          const idx = node.text.indexOf(needle);
          if (idx === -1) return;
          const from = pos + idx;
          const to   = from + needle.length;
          tr.replaceWith(from, to, state.schema.text(replacement));
          replaced = true;
        });
        return replaced;
      });

      return replaced;
    };

    /**
     * Set entirely new content (for Templates / History restore).
     */
    editorActionsRef.current.setContent = (newContent) => {
      if (!editor || editor.isDestroyed) return;
      const html = newContent
        ? newContent.split('\n').map(p => `<p>${p || '<br/>'}</p>`).join('')
        : '';
      editor.commands.setContent(html);
    };
  }, [editor, editorActionsRef]);

  /* ── Also expose content setter via resetRef (legacy) ── */
  useEffect(() => {
    if (resetRef && editor) {
      resetRef.current = (newContent) => {
        const html = newContent
          ? newContent.split('\n').map(p => `<p>${p || '<br/>'}</p>`).join('')
          : '';
        editor.commands.setContent(html);
      };
    }
  }, [editor, resetRef]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }) => (
    <button title={title} onClick={onClick} className={`tb-btn ${active ? 'on' : ''}`}>
      {children}
    </button>
  );

  return (
    <div className="editor-area">
      <div className="toolbar">
        <ToolBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={15} strokeWidth={2.5} />
        </ToolBtn>
        <ToolBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={15} strokeWidth={2.5} />
        </ToolBtn>

        <div className="tb-sep" />

        <ToolBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 size={15} strokeWidth={2.5} />
        </ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 size={15} strokeWidth={2.5} />
        </ToolBtn>

        <div className="tb-sep" />

        <ToolBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={15} strokeWidth={2.5} />
        </ToolBtn>
        <ToolBtn title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={15} strokeWidth={2.5} />
        </ToolBtn>
        <ToolBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote size={15} strokeWidth={2.5} />
        </ToolBtn>

        <div className="tb-spacer" />

        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={15} strokeWidth={2.5} />
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={15} strokeWidth={2.5} />
        </ToolBtn>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
