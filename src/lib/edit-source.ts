import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

export type EditDoc = {
  path: string;
  title: string;
  description: string;
  content: string;
};

const DOCS_ROOT = path.join(process.cwd(), 'content/docs');

function toPosix(value: string) {
  return value.split(path.sep).join('/');
}

function readField(source: string, key: string) {
  const fm = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!fm) return '';

  const line = fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'mi'));
  return line?.[1]?.replace(/^['"]|['"]$/g, '').trim() ?? '';
}

async function walk(dir: string, rel = ''): Promise<EditDoc[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const docs: EditDoc[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const abs = path.join(dir, entry.name);
    const nextRel = rel ? path.join(rel, entry.name) : entry.name;

    if (entry.isDirectory()) {
      docs.push(...(await walk(abs, nextRel)));
      continue;
    }

    if (!/\.mdx?$/i.test(entry.name)) continue;

    const content = await fs.readFile(abs, 'utf8');

    docs.push({
      path: toPosix(nextRel),
      title: readField(content, 'title') || entry.name,
      description: readField(content, 'description'),
      content,
    });
  }

  return docs.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getEditDocs() {
  return walk(DOCS_ROOT);
}
