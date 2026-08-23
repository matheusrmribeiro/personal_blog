'use client';

import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import {
  EditorContent,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  useEditorState,
  type ReactNodeViewProps,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deletePostContentImage,
  uploadPostContentImage,
} from '@/app/admin/actions';

type ImageSize = 'small' | 'medium' | 'large';
type CodeLanguage = 'javascript' | 'typescript' | null;
type DeleteImageRequest = (src: string, remove: () => void) => Promise<void>;

type RichTextEditorProps = {
  initialContent: string;
  onBusyChange: (isBusy: boolean) => void;
  onChange: (markdown: string) => void;
  onError: (message: string) => void;
};

export function RichTextEditor({
  initialContent,
  onBusyChange,
  onChange,
  onError,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isBusy = isUploading || isDeleting;
  const handleDeleteImage = useCallback<DeleteImageRequest>(
    async (src, remove) => {
      setIsDeleting(true);
      onError('');

      try {
        if (isManagedPostImage(src)) {
          const formData = new FormData();
          formData.set('url', src);
          const result = await deletePostContentImage(formData);

          if (!result.success) {
            onError(result.error);
            return;
          }
        }

        remove();
      } finally {
        setIsDeleting(false);
      }
    },
    [onError],
  );
  const imageExtension = useMemo(
    () => createPostImageExtension(handleDeleteImage),
    [handleDeleteImage],
  );
  const codeBlockExtension = useMemo(() => createCodeBlockExtension(), []);

  const editor = useEditor({
    immediatelyRender: false,
    content: initialContent,
    contentType: 'markdown',
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        },
      }),
      codeBlockExtension,
      imageExtension,
      Placeholder.configure({
        placeholder: 'Start writing your story…',
      }),
      Markdown.configure({
        markedOptions: { gfm: true },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose-blog rich-text-editor',
        'aria-label': 'Post content',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getMarkdown());
    },
  });
  const activeFormats = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      paragraph: currentEditor?.isActive('paragraph') ?? false,
      heading2:
        currentEditor?.isActive('heading', { level: 2 }) ?? false,
      heading3:
        currentEditor?.isActive('heading', { level: 3 }) ?? false,
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false,
      blockquote: currentEditor?.isActive('blockquote') ?? false,
      link: currentEditor?.isActive('link') ?? false,
      codeBlock: currentEditor?.isActive('codeBlock') ?? false,
    }),
  });

  useEffect(() => {
    onBusyChange(isBusy);
    editor?.setEditable(!isBusy);
  }, [editor, isBusy, onBusyChange]);

  async function uploadImages(files: File[]) {
    const images = files.filter((file) => file.type.startsWith('image/'));

    if (!editor || !images.length || isBusy) {
      return;
    }

    setIsUploading(true);
    onError('');

    try {
      for (const image of images) {
        const formData = new FormData();
        formData.set('image', image);
        const result = await uploadPostContentImage(formData);

        if (!result.success) {
          onError(result.error);
          continue;
        }

        editor
          .chain()
          .focus()
          .setImage({
            src: setImageSize(result.url, 'large'),
            alt: getImageAlt(image.name),
          })
          .run();
      }
    } finally {
      setIsUploading(false);
    }
  }

  function handleImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    void uploadImages(files);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const images = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith('image/'),
    );

    if (!images.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void uploadImages(images);
  }

  function editLink() {
    if (!editor) {
      return;
    }

    const currentUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', currentUrl ?? 'https://');

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run();
  }

  return (
    <div onPasteCapture={handlePaste}>
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 py-3">
        <p className="text-xs text-zinc-500">
          Select text or an image to format it.
        </p>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleImageSelection}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={isBusy}
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : 'Add image'}
        </button>
      </div>

      {editor ? (
        <>
          <BubbleMenu
            editor={editor}
            pluginKey="text-format-menu"
            appendTo={() => document.body}
            shouldShow={({ editor: currentEditor, state }) =>
              !state.selection.empty &&
              !currentEditor.isActive('image') &&
              !currentEditor.isActive('codeBlock')
            }
            options={{ placement: 'top', offset: 8 }}
          >
            <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 p-1 text-xs text-white shadow-xl">
              <FormatButton
                label="Text"
                active={activeFormats?.paragraph ?? false}
                onClick={() => editor.chain().focus().setParagraph().run()}
              />
              <FormatButton
                label="H2"
                active={activeFormats?.heading2 ?? false}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              />
              <FormatButton
                label="H3"
                active={activeFormats?.heading3 ?? false}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              />
              <span className="mx-0.5 h-5 w-px bg-white/20" />
              <FormatButton
                label="B"
                active={activeFormats?.bold ?? false}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="font-bold"
              />
              <FormatButton
                label="I"
                active={activeFormats?.italic ?? false}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="italic"
              />
              <FormatButton
                label="List"
                active={activeFormats?.bulletList ?? false}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
              <FormatButton
                label="1."
                active={activeFormats?.orderedList ?? false}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
              <FormatButton
                label="Quote"
                active={activeFormats?.blockquote ?? false}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              />
              <FormatButton
                label="Link"
                active={activeFormats?.link ?? false}
                onClick={editLink}
              />
              <FormatButton
                label="Code"
                active={activeFormats?.codeBlock ?? false}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              />
            </div>
          </BubbleMenu>

        </>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}

function createCodeBlockExtension() {
  return CodeBlock.extend({
    addNodeView() {
      return ReactNodeViewRenderer(EditorCodeBlockNodeView);
    },
  }).configure({
    enableTabIndentation: true,
    tabSize: 2,
  });
}

function EditorCodeBlockNodeView({
  node,
  selected,
  updateAttributes,
}: ReactNodeViewProps) {
  const language = getCodeLanguage(node.attrs.language);

  return (
    <NodeViewWrapper
      className={`relative ${
        selected ? 'outline-3 outline-offset-4 outline-zinc-900' : ''
      }`}
    >
      <label
        contentEditable={false}
        className="absolute top-3 right-3 z-10"
      >
        <span className="sr-only">Code language</span>
        <select
          aria-label="Code language"
          value={language ?? ''}
          onChange={(event) =>
            updateAttributes({ language: event.target.value || null })
          }
          className="rounded-md border border-white/20 bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-100 shadow-sm outline-none hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="">Plain Text</option>
        </select>
      </label>
      <pre className="!m-0 !pt-14">
        <NodeViewContent<'code'>
          as="code"
          className={language ? `language-${language}` : undefined}
        />
      </pre>
    </NodeViewWrapper>
  );
}

function createPostImageExtension(onDeleteImage: DeleteImageRequest) {
  return Image.extend({
    addNodeView() {
      return ReactNodeViewRenderer((props) => (
        <EditorImageNodeView
          {...props}
          onDeleteImage={onDeleteImage}
        />
      ));
    },
  }).configure({
    allowBase64: false,
  });
}

function EditorImageNodeView({
  node,
  deleteNode,
  selected,
  updateAttributes,
  onDeleteImage,
}: ReactNodeViewProps & {
  onDeleteImage: DeleteImageRequest;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { src, alt, title } = node.attrs as {
    src: string;
    alt?: string | null;
    title?: string | null;
  };
  const size = getImageSize(src);
  const widthClass = {
    small: 'w-[40%]',
    medium: 'w-[70%]',
    large: 'w-full',
  }[size];

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await onDeleteImage(src, deleteNode);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <NodeViewWrapper
      className={`group/editor-image relative mx-auto my-8 max-w-full ${widthClass} ${
        selected ? 'outline-3 outline-offset-4 outline-zinc-900' : ''
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Tiptap image nodes use their stored public URL directly. */}
      <img
        src={src}
        alt={alt ?? ''}
        title={title ?? undefined}
        className="!m-0 !w-full"
      />
      <div
        contentEditable={false}
        className="absolute top-2 right-2 flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 p-1 text-xs text-white opacity-0 shadow-xl transition focus-within:opacity-100 group-hover/editor-image:opacity-100"
      >
        {(['small', 'medium', 'large'] as const).map((imageSize) => (
          <button
            key={imageSize}
            type="button"
            aria-label={`Set image size to ${imageSize}`}
            aria-pressed={size === imageSize}
            title={capitalize(imageSize)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              updateAttributes({ src: setImageSize(src, imageSize) })
            }
            className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
              size === imageSize
                ? 'bg-white text-zinc-950'
                : 'hover:bg-white/15'
            }`}
          >
            {imageSize.charAt(0).toUpperCase()}
          </button>
        ))}
        <span className="mx-0.5 h-5 w-px bg-white/20" />
        <button
          type="button"
          aria-label="Delete image"
          title="Delete image"
          disabled={isDeleting}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => void handleDelete()}
          className="grid size-8 place-items-center rounded-md text-red-300 transition hover:bg-red-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait"
        >
          {isDeleting ? (
            <span className="text-[10px] font-semibold">…</span>
          ) : (
            <TrashIcon />
          )}
        </button>
      </div>
    </NodeViewWrapper>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function FormatButton({
  label,
  active,
  onClick,
  className = '',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
        active ? 'bg-white text-zinc-950' : 'hover:bg-white/15'
      } ${className}`}
    >
      {label}
    </button>
  );
}

function getImageAlt(filename: string) {
  return (
    filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/[\[\]()]/g, '')
      .trim() || 'Post image'
  );
}

function getImageSize(src?: string) {
  const match = src?.match(/#size=(small|medium|large)$/);

  return (match?.[1] as ImageSize | undefined) ?? 'large';
}

function getCodeLanguage(value: unknown): CodeLanguage {
  if (value === 'javascript' || value === 'js') {
    return 'javascript';
  }

  if (value === 'typescript' || value === 'ts') {
    return 'typescript';
  }

  return null;
}

function setImageSize(url: string, size: ImageSize) {
  return `${url.replace(/#size=(?:small|medium|large)$/, '')}#size=${size}`;
}

function isManagedPostImage(url: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return Boolean(
    supabaseUrl &&
      url.startsWith(`${supabaseUrl}/storage/v1/object/public/post-images/`),
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
