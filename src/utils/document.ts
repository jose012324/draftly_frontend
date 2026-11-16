/**
 * Helpers that understand the TipTap JSON document format.
 * The same format is stored by Django in `Document.content`.
 */

import type { TiptapDocument, TiptapNode } from '../types';

/** Collects every text node of a TipTap document into a single string. */
export function extractPlainText(node: TiptapNode | TiptapDocument | null | undefined): string {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;

  const children = node.content ?? [];
  const parts = children.map((child) => extractPlainText(child));

  // Block level nodes should be separated by a line break.
  if (node.type === 'doc' || node.type === 'paragraph' || node.type === 'heading') {
    return parts.join('\n');
  }
  return parts.join('');
}

/** Short preview of a document, used on the document cards. */
export function buildSnippet(
  doc: TiptapDocument | null | undefined,
  maxLength = 140,
): string {
  const text = extractPlainText(doc).replace(/\s+/g, ' ').trim();
  if (!text) return 'No content yet — start writing to see a preview here.';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** Number of words in a document. */
export function countWords(doc: TiptapDocument | null | undefined): number {
  const text = extractPlainText(doc).trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** True when the document has no meaningful text. */
export function isDocumentEmpty(doc: TiptapDocument | null | undefined): boolean {
  return extractPlainText(doc).trim().length === 0;
}

/** Shortens a plain string, adding an ellipsis when it is cut. */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}
