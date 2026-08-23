'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { savePost, type PostActionState } from '@/app/admin/actions';
import { PostImporter } from '@/components/admin/post-importer';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import type { ImportedPost } from '@/lib/post-import';
import type { Post } from '@/types/post';

const initialState: PostActionState = { message: '' };

export function PostEditor({ post }: { post?: Post }) {
  const [state, formAction] = useActionState(savePost, initialState);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(
    post?.cover_image_url ?? '',
  );
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(
    post?.seo_description ?? '',
  );
  const [editorKey, setEditorKey] = useState(0);
  const [isEditorBusy, setIsEditorBusy] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [imageError, setImageError] = useState('');

  function importPost(importedPost: ImportedPost) {
    setTitle(importedPost.title);
    setSlug(importedPost.slug ?? toSlug(importedPost.title));
    setSlugEdited(Boolean(importedPost.slug));
    setExcerpt(importedPost.excerpt);
    setContent(importedPost.content);
    setCoverImageUrl(importedPost.coverImageUrl);
    setSeoTitle(importedPost.seoTitle);
    setSeoDescription(importedPost.seoDescription);
    setEditorKey((currentKey) => currentKey + 1);
    setImageError('');
  }

  function updateTitle(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={post?.id ?? ''} />

      {!post ? (
        <PostImporter
          onImport={importPost}
          onBusyChange={setIsImporting}
        />
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-7">
          <section className="admin-panel p-6 sm:p-8">
            <div className="space-y-6">
              <Field label="Title" error={state.errors?.title?.[0]}>
                <input
                  className="admin-input mt-2 text-lg font-semibold"
                  name="title"
                  value={title}
                  onChange={(event) => updateTitle(event.target.value)}
                  maxLength={160}
                  required
                  placeholder="A clear, useful title"
                />
              </Field>

              <Field
                label="URL slug"
                hint="Lowercase letters, numbers, and hyphens"
                error={state.errors?.slug?.[0]}
              >
                <div className="mt-2 flex rounded-lg border border-zinc-300 bg-white focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10">
                  <span className="flex items-center border-r border-zinc-200 px-3 text-sm text-zinc-400">
                    /posts/
                  </span>
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      setSlug(toSlug(event.target.value));
                    }}
                    required
                    placeholder="my-new-post"
                  />
                </div>
              </Field>

              <Field
                label="Excerpt"
                hint="A short description used on cards and search previews"
                error={state.errors?.excerpt?.[0]}
              >
                <textarea
                  className="admin-input mt-2 min-h-24 resize-y"
                  name="excerpt"
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  maxLength={360}
                  required
                  placeholder="What will readers take away from this post?"
                />
              </Field>
            </div>
          </section>

          <section className="admin-panel overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-3">
              <p className="admin-label">Post content</p>
            </div>
            <RichTextEditor
              key={editorKey}
              initialContent={content}
              onChange={setContent}
              onBusyChange={setIsEditorBusy}
              onError={setImageError}
            />
            <input name="content" type="hidden" value={content} />
            {imageError ? (
              <p
                className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700"
                role="alert"
              >
                {imageError}
              </p>
            ) : null}
            {state.errors?.content?.[0] ? (
              <p className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
                {state.errors.content[0]}
              </p>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="admin-panel p-6">
            <h2 className="text-sm font-semibold text-zinc-950">Publish</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Save a private draft or publish it immediately for readers.
            </p>
            {state.message ? (
              <p
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700"
                role="alert"
              >
                {state.message}
              </p>
            ) : null}
            <PublishButtons disabled={isEditorBusy || isImporting} />
          </section>

          <section className="admin-panel space-y-5 p-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">Cover image</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                JPG, PNG, WebP, or GIF. Maximum 5 MB.
              </p>
            </div>
            <input
              className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              name="cover_image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
            <Field label="Or image URL" error={state.errors?.cover_image_url?.[0]}>
              <input
                className="admin-input mt-2"
                name="cover_image_url"
                type="url"
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://…"
              />
            </Field>
          </section>

          <section className="admin-panel space-y-5 p-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Search and sharing
              </h2>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Optional overrides for search engines and social previews.
              </p>
            </div>
            <Field label="SEO title" error={state.errors?.seo_title?.[0]}>
              <input
                className="admin-input mt-2"
                name="seo_title"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                maxLength={70}
              />
            </Field>
            <Field
              label="SEO description"
              error={state.errors?.seo_description?.[0]}
            >
              <textarea
                className="admin-input mt-2 min-h-24 resize-y"
                name="seo_description"
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                maxLength={170}
              />
            </Field>
          </section>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      {hint ? <span className="ml-2 text-xs text-zinc-400">{hint}</span> : null}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function PublishButtons({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <div className="mt-5 grid gap-2">
      <button
        className="admin-button"
        type="submit"
        name="intent"
        value="publish"
        disabled={isDisabled}
      >
        {pending ? 'Saving…' : 'Publish now'}
      </button>
      <button
        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        type="submit"
        name="intent"
        value="draft"
        disabled={isDisabled}
      >
        Save draft
      </button>
    </div>
  );
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
