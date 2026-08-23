'use client';

import { useRef, useState } from 'react';
import {
  deletePostContentImage,
  uploadPostContentImage,
} from '@/app/admin/actions';
import {
  agentPostImportPrompt,
  getImportedImagePaths,
  parseImportedPost,
  resolveImportedImagePaths,
  type ImportedPost,
} from '@/lib/post-import';

export function PostImporter({
  onImport,
  onBusyChange,
}: {
  onImport: (post: ImportedPost) => void;
  onBusyChange: (isBusy: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function importSource(value: string) {
    const result = parseImportedPost(value);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error);
      return;
    }

    if (getImportedImagePaths(result.post).length) {
      setIsError(true);
      setMessage(
        'This post references local images. Put post.json and its images/ folder in a ZIP and import the ZIP.',
      );
      return;
    }

    onImport(result.post);
    setSource(value);
    setIsError(false);
    setMessage('Draft imported. Review it, then save or publish when ready.');
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.name.toLowerCase().endsWith('.zip')) {
      await importArchive(file);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError('The JSON import file must be smaller than 2 MB.');
      return;
    }

    const value = await file.text();
    setSource(value);
    importSource(value);
  }

  async function importArchive(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      showError('The ZIP import file must be smaller than 50 MB.');
      return;
    }

    const uploadedUrls: string[] = [];
    setBusy(true);
    setIsError(false);
    setMessage('Reading import archive…');

    try {
      const { default: JSZip } = await import('jszip');
      const archive = await JSZip.loadAsync(file);
      const manifest = archive.file('post.json');

      if (!manifest) {
        throw new Error('The ZIP must contain post.json at its top level.');
      }

      const manifestSource = await manifest.async('string');
      const parsed = parseImportedPost(manifestSource);

      if (!parsed.success) {
        throw new Error(parsed.error);
      }

      const imagePaths = getImportedImagePaths(parsed.post);

      if (imagePaths.length > 50) {
        throw new Error('An imported post can reference at most 50 images.');
      }

      const publicUrls = new Map<string, string>();

      for (const [index, imagePath] of imagePaths.entries()) {
        const imageEntry = archive.file(imagePath);
        const imageType = getImageType(imagePath);

        if (!imageEntry || !imageType) {
          throw new Error(
            `The archive is missing ${imagePath}, or its image format is unsupported.`,
          );
        }

        setMessage(`Uploading image ${index + 1} of ${imagePaths.length}…`);
        const imageBlob = await imageEntry.async('blob');

        if (imageBlob.size > 5 * 1024 * 1024) {
          throw new Error(`${imagePath} must be smaller than 5 MB.`);
        }

        const image = new File(
          [imageBlob],
          imagePath.split('/').at(-1) ?? 'image',
          { type: imageType },
        );
        const formData = new FormData();
        formData.set('image', image);
        const result = await uploadPostContentImage(formData);

        if (!result.success) {
          throw new Error(`${imagePath}: ${result.error}`);
        }

        publicUrls.set(imagePath, result.url);
        uploadedUrls.push(result.url);
      }

      onImport(resolveImportedImagePaths(parsed.post, publicUrls));
      setSource(manifestSource);
      setIsError(false);
      setMessage(
        imagePaths.length
          ? `Draft imported and ${imagePaths.length} ${imagePaths.length === 1 ? 'image' : 'images'} uploaded. Review it before saving.`
          : 'Draft imported. Review it, then save or publish when ready.',
      );
    } catch (error) {
      await deleteUploadedImages(uploadedUrls);
      showError(
        error instanceof Error ? error.message : 'Unable to import this ZIP.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteUploadedImages(urls: string[]) {
    for (const url of urls) {
      const formData = new FormData();
      formData.set('url', url);
      await deletePostContentImage(formData);
    }
  }

  function setBusy(isBusy: boolean) {
    setIsImporting(isBusy);
    onBusyChange(isBusy);
  }

  function showError(error: string) {
    setIsError(true);
    setMessage(error);
  }

  async function copyAgentPrompt() {
    try {
      await navigator.clipboard.writeText(agentPostImportPrompt);
      setPromptCopied(true);
    } catch {
      setIsError(true);
      setMessage('Unable to copy the prompt. Paste the JSON here instead.');
    }
  }

  return (
    <section className="admin-panel mb-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">
            Have an agent-written draft?
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Import JSON, or a ZIP when the Markdown uses bundled images.
            Nothing is saved automatically.
          </p>
        </div>
        <button
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          {isOpen ? 'Close importer' : 'Import agent draft'}
        </button>
      </div>

      {isOpen ? (
        <div className="space-y-4 border-t border-zinc-200 bg-zinc-50/60 px-5 py-5 sm:px-6">
          <label className="block">
            <span className="admin-label">Paste agent JSON</span>
            <textarea
              className="admin-input mt-2 min-h-40 resize-y font-mono text-xs"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setMessage('');
              }}
              placeholder={'{\n  "version": 1,\n  "title": "…",\n  "excerpt": "…",\n  "content": "## Markdown content\\n\\n…"\n}'}
              spellCheck={false}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="admin-button w-auto"
              type="button"
              onClick={() => importSource(source)}
              disabled={!source.trim() || isImporting}
            >
              Import JSON
            </button>
            <span className="text-xs text-zinc-400">or</span>
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="application/json,application/zip,.json,.zip"
              onChange={(event) => void handleFile(event)}
              tabIndex={-1}
            />
            <button
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? 'Importing…' : 'Choose JSON or ZIP'}
            </button>
            <button
              className="px-2 py-2.5 text-sm font-semibold text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              type="button"
              onClick={() => void copyAgentPrompt()}
            >
              {promptCopied ? 'Prompt copied' : 'Copy agent prompt'}
            </button>
          </div>

          {message ? (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                isError
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
              role={isError ? 'alert' : 'status'}
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function getImageType(path: string) {
  const extension = path.split('.').at(-1)?.toLowerCase();
  const imageTypes: Record<string, string> = {
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  return extension ? imageTypes[extension] : undefined;
}
