'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EditDoc } from '@/lib/edit-source';

const LAST_FILE_KEY = 'docscms:last';
const draftKey = (path: string) => `docscms:draft:${path}`;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function exportFile(pathname: string, content: string) {
  const blob = new Blob([content], {
    type: 'text/markdown;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = pathname.split('/').pop() || 'document.mdx';
  a.click();

  URL.revokeObjectURL(url);
}

export default function EditorShell({
  initialDocs,
}: {
  initialDocs: EditDoc[];
}) {
  const docsMap = useMemo(
    () => Object.fromEntries(initialDocs.map((d) => [d.path, d])),
    [initialDocs],
  );

  const [activePath, setActivePath] = useState(initialDocs[0]?.path ?? '');
  const [content, setContent] = useState(initialDocs[0]?.content ?? '');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [notice, setNotice] = useState('Ready');

  useEffect(() => {
    const last = localStorage.getItem(LAST_FILE_KEY);

    if (last && docsMap[last]) {
      setActivePath(last);
    }
  }, [docsMap]);

  useEffect(() => {
    if (!activePath) return;

    const source = docsMap[activePath];
    const saved = localStorage.getItem(draftKey(activePath));

    setContent(saved ?? source?.content ?? '');

    localStorage.setItem(LAST_FILE_KEY, activePath);
  }, [activePath, docsMap]);

  useEffect(() => {
    if (!activePath) return;

    const t = setTimeout(() => {
      localStorage.setItem(draftKey(activePath), content);
    }, 300);

    return () => clearTimeout(t);
  }, [activePath, content]);

  function createNewDoc() {
    const title = newDocTitle.trim();

    if (!title) {
      setNotice('Napiš název dokumentu');
      return;
    }

    const slug = slugify(title) || 'new-document';

    let finalPath = `drafts/${slug}.mdx`;
    let counter = 1;

    while (
      docsMap[finalPath] ||
      localStorage.getItem(draftKey(finalPath))
    ) {
      finalPath = `drafts/${slug}-${counter}.mdx`;
      counter++;
    }

    const template = `---
title: ${title}
description:
---

# ${title}

Start writing here.
`;

    setActivePath(finalPath);
    setContent(template);
    setNewDocTitle('');

    localStorage.setItem(draftKey(finalPath), template);
    localStorage.setItem(LAST_FILE_KEY, finalPath);

    setNotice(`Vytvořen: ${finalPath}`);
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-zinc-950 text-zinc-100">
      <aside className="border-r border-zinc-800 p-4">
        <h1 className="mb-4 text-xl font-bold">MDX Editor</h1>

        <div className="mb-4 space-y-2">
          <input
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                createNewDoc();
              }
            }}
            placeholder="Název nového dokumentu"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none"
          />

          <button
            onClick={createNewDoc}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-medium text-black"
          >
            Nový dokument
          </button>
        </div>

        <div className="space-y-2">
          {initialDocs.map((doc) => (
            <button
              key={doc.path}
              onClick={() => setActivePath(doc.path)}
              className={`block w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                activePath === doc.path
                  ? 'border-white bg-white text-black'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              <div className="font-medium">{doc.title}</div>
              <div className="mt-1 text-xs opacity-70">{doc.path}</div>
            </button>
          ))}
        </div>
      </aside>

      <main className="grid grid-cols-2">
        <section className="border-r border-zinc-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-zinc-400">{notice}</div>

            <button
              onClick={() => exportFile(activePath, content)}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm"
            >
              Export .mdx
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="min-h-[90vh] w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 font-mono text-sm outline-none"
          />
        </section>

        <section className="overflow-auto p-6">
          <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
            {content}
          </pre>
        </section>
      </main>
    </div>
  );
}
