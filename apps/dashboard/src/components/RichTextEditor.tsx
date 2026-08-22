import { Color, TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { MediaPicker } from './MediaLibrary'

const COLORS = ['#e4e4e7', '#93c5fd', '#6ee7b7', '#fcd34d', '#fca5a5', '#c4b5fd']

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    },
  }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: false }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Image.configure({ inline: false, allowBase64: false }),
  TableKit.configure({ table: { resizable: false } }),
]

type Tool = {
  key: string
  label: ReactNode
  title: string
  run: (editor: Editor) => void
  active?: (editor: Editor) => boolean
  disabled?: (editor: Editor) => boolean
}

function ToolBtn({ editor, tool }: { editor: Editor; tool: Tool }) {
  const active = tool.active?.(editor) ?? false
  const disabled = tool.disabled?.(editor) ?? false
  return (
    <button
      type="button"
      title={tool.title}
      aria-label={tool.title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => tool.run(editor)}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-xs disabled:opacity-40 ${
        active ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
      }`}
    >
      {tool.label}
    </button>
  )
}

function setLink(editor: Editor) {
  const previous = String(editor.getAttributes('link').href || '')
  const url = window.prompt('Link URL', previous || 'https://')
  if (url === null) return
  if (url.trim() === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the article…',
  siteId,
  minHeight = 280,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  siteId?: string | number
  minHeight?: number
}) {
  const [pickingImage, setPickingImage] = useState(false)
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      ...extensions,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class: 'rich-text-editor__content max-w-none text-sm text-zinc-100 outline-none',
        style: `min-height:${minHeight}px`,
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
  }, [value, editor])

  if (!editor) {
    return <div className="min-h-[280px] animate-pulse rounded-lg border border-zinc-800 bg-zinc-950" />
  }

  const marks: Tool[] = [
    { key: 'undo', title: 'Undo', label: <Undo2 size={14} />, run: (ed) => ed.chain().focus().undo().run(), disabled: (ed) => !ed.can().undo() },
    { key: 'redo', title: 'Redo', label: <Redo2 size={14} />, run: (ed) => ed.chain().focus().redo().run(), disabled: (ed) => !ed.can().redo() },
  ]
  const headings: Tool[] = [
    { key: 'h1', title: 'Heading 1', label: <Heading1 size={14} />, run: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(), active: (ed) => ed.isActive('heading', { level: 1 }) },
    { key: 'h2', title: 'Heading 2', label: <Heading2 size={14} />, run: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(), active: (ed) => ed.isActive('heading', { level: 2 }) },
    { key: 'h3', title: 'Heading 3', label: <Heading3 size={14} />, run: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(), active: (ed) => ed.isActive('heading', { level: 3 }) },
  ]
  const inline: Tool[] = [
    { key: 'bold', title: 'Bold', label: <Bold size={14} />, run: (ed) => ed.chain().focus().toggleBold().run(), active: (ed) => ed.isActive('bold') },
    { key: 'italic', title: 'Italic', label: <Italic size={14} />, run: (ed) => ed.chain().focus().toggleItalic().run(), active: (ed) => ed.isActive('italic') },
    { key: 'underline', title: 'Underline', label: <Underline size={14} />, run: (ed) => ed.chain().focus().toggleUnderline().run(), active: (ed) => ed.isActive('underline') },
    { key: 'strike', title: 'Strikethrough', label: <Strikethrough size={14} />, run: (ed) => ed.chain().focus().toggleStrike().run(), active: (ed) => ed.isActive('strike') },
    { key: 'code', title: 'Inline code', label: <Code size={14} />, run: (ed) => ed.chain().focus().toggleCode().run(), active: (ed) => ed.isActive('code') },
    { key: 'highlight', title: 'Highlight', label: <Highlighter size={14} />, run: (ed) => ed.chain().focus().toggleHighlight().run(), active: (ed) => ed.isActive('highlight') },
    { key: 'link', title: 'Link', label: <Link2 size={14} />, run: setLink, active: (ed) => ed.isActive('link') },
    { key: 'unlink', title: 'Remove link', label: <Unlink size={14} />, run: (ed) => ed.chain().focus().unsetLink().run(), disabled: (ed) => !ed.isActive('link') },
  ]
  const blocks: Tool[] = [
    { key: 'left', title: 'Align left', label: <AlignLeft size={14} />, run: (ed) => ed.chain().focus().setTextAlign('left').run(), active: (ed) => ed.isActive({ textAlign: 'left' }) },
    { key: 'center', title: 'Align center', label: <AlignCenter size={14} />, run: (ed) => ed.chain().focus().setTextAlign('center').run(), active: (ed) => ed.isActive({ textAlign: 'center' }) },
    { key: 'right', title: 'Align right', label: <AlignRight size={14} />, run: (ed) => ed.chain().focus().setTextAlign('right').run(), active: (ed) => ed.isActive({ textAlign: 'right' }) },
    { key: 'ul', title: 'Bullet list', label: <List size={14} />, run: (ed) => ed.chain().focus().toggleBulletList().run(), active: (ed) => ed.isActive('bulletList') },
    { key: 'ol', title: 'Numbered list', label: <ListOrdered size={14} />, run: (ed) => ed.chain().focus().toggleOrderedList().run(), active: (ed) => ed.isActive('orderedList') },
    { key: 'quote', title: 'Quote', label: <Quote size={14} />, run: (ed) => ed.chain().focus().toggleBlockquote().run(), active: (ed) => ed.isActive('blockquote') },
    { key: 'pre', title: 'Code block', label: '{ }', run: (ed) => ed.chain().focus().toggleCodeBlock().run(), active: (ed) => ed.isActive('codeBlock') },
    { key: 'hr', title: 'Divider', label: <Minus size={14} />, run: (ed) => ed.chain().focus().setHorizontalRule().run() },
    {
      key: 'table',
      title: 'Insert table',
      label: <Table size={14} />,
      run: (ed) => ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      active: (ed) => ed.isActive('table'),
    },
  ]

  return (
    <div className="rich-text-editor overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-800 p-1.5">
        {marks.map((tool) => (
          <ToolBtn key={tool.key} editor={editor} tool={tool} />
        ))}
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {headings.map((tool) => (
          <ToolBtn key={tool.key} editor={editor} tool={tool} />
        ))}
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {inline.map((tool) => (
          <ToolBtn key={tool.key} editor={editor} tool={tool} />
        ))}
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {blocks.map((tool) => (
          <ToolBtn key={tool.key} editor={editor} tool={tool} />
        ))}
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setPickingImage(true)}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-zinc-300 hover:bg-zinc-800"
        >
          <ImageIcon size={14} />
        </button>
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title="Text color"
            aria-label={`Text color ${color}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().setColor(color).run()}
            className="h-4 w-4 rounded-full border border-zinc-700"
            style={{ background: color }}
          />
        ))}
        <button
          type="button"
          className="ml-1 text-[11px] text-zinc-500 hover:text-zinc-300"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().unsetColor().unsetAllMarks().run()}
        >
          Clear
        </button>
      </div>
      {editor.isActive('table') ? (
        <div className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-900/50 px-2 py-1 text-[11px] text-zinc-400">
          <button type="button" className="hover:text-white" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().addRowAfter().run()}>
            + Row
          </button>
          <button type="button" className="hover:text-white" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().addColumnAfter().run()}>
            + Column
          </button>
          <button type="button" className="hover:text-white" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteRow().run()}>
            Delete row
          </button>
          <button type="button" className="hover:text-white" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteColumn().run()}>
            Delete column
          </button>
          <button type="button" className="hover:text-red-400" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteTable().run()}>
            Delete table
          </button>
        </div>
      ) : null}
      <EditorContent editor={editor} />
      {pickingImage ? (
        <MediaPicker
          dialogOnly
          siteId={siteId}
          onChange={(url) => {
            if (url) editor.chain().focus().setImage({ src: url }).run()
            setPickingImage(false)
          }}
          onClose={() => setPickingImage(false)}
        />
      ) : null}
    </div>
  )
}
