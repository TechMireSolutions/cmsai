import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const offToneKey = new PluginKey('offTone');

/**
 * TipTap extension that renders red wavy underlines on off-tone text segments.
 * Controlled externally via editor.view.dispatch(tr.setMeta(offToneKey, decorationSet)).
 */
export const OffToneHighlight = Extension.create({
  name: 'offToneHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: offToneKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            // Map stale decorations through document changes
            const mapped = oldSet.map(tr.mapping, tr.doc);
            // Accept externally-set decoration sets
            const meta = tr.getMeta(offToneKey);
            if (meta !== undefined) return meta;
            return mapped;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

/**
 * Builds a DecorationSet that underlines every occurrence of each sentence
 * in `offToneSentences` with a red wavy underline.
 */
export function buildOffToneDecorations(doc, offToneSentences) {
  if (!offToneSentences || offToneSentences.length === 0) {
    return DecorationSet.empty;
  }

  const decorations = [];

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const nodeText = node.text;

    offToneSentences.forEach((item) => {
      const sentenceText = item.original || item.text;
      if (!sentenceText) return;
      
      const needle = sentenceText.trim();
      if (!needle || needle.length === 0) return; // Safety check

      let searchFrom = 0;
      while (searchFrom < nodeText.length) {
        const idx = nodeText.indexOf(needle, searchFrom);
        if (idx === -1) break;
        decorations.push(
          Decoration.inline(pos + idx, pos + idx + needle.length, {
            class: 'off-tone-underline',
          })
        );
        searchFrom = idx + Math.max(1, needle.length); // Safety increment
      }
    });
  });

  return DecorationSet.create(doc, decorations);
}
