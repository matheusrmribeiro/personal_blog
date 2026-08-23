'use client';

import { useRef, useState } from 'react';
import {
  agentPostImportPrompt,
  parseImportedPost,
  type ImportedPost,
} from '@/lib/post-import';

export function PostImporter({
  onImport,
}: {
  onImport: (post: ImportedPost) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function importSource(value: string) {
    const result = parseImportedPost(value);

    if (!result.success) {
      setIsError(true);
      setMessage(result.error);
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

    if (file.size > 2 * 1024 * 1024) {
      setIsError(true);
      setMessage('The import file must be smaller than 2 MB.');
      return;
    }

    const value = await file.text();
    setSource(value);
    importSource(value);
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
            Import version 1 JSON with a Markdown body. Nothing is saved
            automatically.
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
              disabled={!source.trim()}
            >
              Import JSON
            </button>
            <span className="text-xs text-zinc-400">or</span>
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void handleFile(event)}
              tabIndex={-1}
            />
            <button
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose JSON file
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
