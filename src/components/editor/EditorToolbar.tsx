import { useEditorState, type Editor } from '@tiptap/react';

import { Icon, type IconName } from '../ui/Icon';

interface EditorToolbarProps {
  editor: Editor | null;
  isReadOnly?: boolean;
  wordCount?: number;
}

interface ToolbarButtonProps {
  label: string;
  icon?: IconName;
  text?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  label,
  icon,
  text,
  isActive = false,
  isDisabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`tool-btn ${isActive ? 'is-active' : ''}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {icon ? <Icon name={icon} size={16} strokeWidth={2} /> : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}

interface ToolbarContentProps {
  editor: Editor;
  isReadOnly?: boolean;
  wordCount?: number;
}

function ToolbarContent({ editor, isReadOnly, wordCount }: ToolbarContentProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      underline: current.isActive('underline'),
      strike: current.isActive('strike'),
      paragraph: current.isActive('paragraph'),
      heading1: current.isActive('heading', { level: 1 }),
      heading2: current.isActive('heading', { level: 2 }),
      heading3: current.isActive('heading', { level: 3 }),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      blockquote: current.isActive('blockquote'),
      codeBlock: current.isActive('codeBlock'),
      link: current.isActive('link'),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });

  function setLink() {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previousUrl ?? 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting options">
      <div className="toolbar__group">
        <ToolbarButton
          label="Undo"
          icon="undo"
          isDisabled={!state.canUndo || isReadOnly}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          icon="redo"
          isDisabled={!state.canRedo || isReadOnly}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <div className="toolbar__group">
        <ToolbarButton
          label="Paragraph"
          text="¶"
          isActive={state.paragraph}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          label="Heading 1"
          text="H1"
          isActive={state.heading1}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="Heading 2"
          text="H2"
          isActive={state.heading2}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Heading 3"
          text="H3"
          isActive={state.heading3}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
      </div>

      <div className="toolbar__group">
        <ToolbarButton
          label="Bold"
          icon="bold"
          isActive={state.bold}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon="italic"
          isActive={state.italic}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          icon="underline"
          isActive={state.underline}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Strikethrough"
          icon="strike"
          isActive={state.strike}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
      </div>

      <div className="toolbar__group">
        <ToolbarButton
          label="Bullet list"
          icon="bulletList"
          isActive={state.bulletList}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon="orderedList"
          isActive={state.orderedList}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Quote"
          icon="quote"
          isActive={state.blockquote}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Code block"
          icon="code"
          isActive={state.codeBlock}
          isDisabled={isReadOnly}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="Link"
          icon="link"
          isActive={state.link}
          isDisabled={isReadOnly}
          onClick={setLink}
        />
      </div>

      <div className="toolbar__spacer" />

      <span className="toolbar__count">
        {wordCount ?? 0} {wordCount === 1 ? 'word' : 'words'}
      </span>
    </div>
  );
}

export function EditorToolbar({ editor, isReadOnly = false, wordCount = 0 }: EditorToolbarProps) {
  if (!editor) {
    return <div className="toolbar" />;
  }

  return (
    <ToolbarContent
      editor={editor}
      isReadOnly={isReadOnly}
      wordCount={wordCount}
    />
  );
}

export default EditorToolbar;
