'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  savePost,
  type PostActionState,
} from '@/app/admin/actions';
import { MarkdownContent } from '@/components/blog/markdown-content';
import type { Post } from '@/types/post';

const initialState: PostActionState = { message: '' };

export function PostEditor({ post }: { post?: Post }) {
  const [state, formAction] = useActionState(savePost, initialState);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [content, setContent] = useState(post?.content ?? '');
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  function updateTitle(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  return (
    <form action={formAction} encType="multipart/form-data">
      <input name="id" type="hidden" value={post?.id ?? ''} />

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
                  defaultValue={post?.excerpt ?? ''}
                  maxLength={360}
                  required
                  placeholder="What will readers take away from this post?"
                />
              </Field>
            </div>
          </section>

          <section className="admin-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <p className="admin-label">Post content</p>
              <div className="flex rounded-lg bg-zinc-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('write')}
                  className={`rounded-md px-3 py-1.5 ${mode === 'write' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={`rounded-md px-3 py-1.5 ${mode === 'preview' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
                >
                  Preview
                </button>
              </div>
            </div>
            {mode === 'write' ? (
              <textarea
                className="min-h-[560px] w-full resize-y bg-white p-6 font-mono text-sm leading-7 outline-none sm:p-8"
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={'Start writing in Markdown…\n\n## A useful heading\n\nYour story begins here.'}
              />
            ) : (
              <div className="min-h-[560px] bg-white p-6 sm:p-8">
                {content.trim() ? (
                  <MarkdownContent content={content} />
                ) : (
                  <p className="text-sm text-zinc-400">
                    Write something to see the preview.
                  </p>
                )}
                <input name="content" type="hidden" value={content} />
              </div>
            )}
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
            <PublishButtons />
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
                defaultValue={post?.cover_image_url ?? ''}
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
                defaultValue={post?.seo_title ?? ''}
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
                defaultValue={post?.seo_description ?? ''}
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

function PublishButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="mt-5 grid gap-2">
      <button
        className="admin-button"
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
      >
        {pending ? 'Saving…' : 'Publish now'}
      </button>
      <button
        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
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
