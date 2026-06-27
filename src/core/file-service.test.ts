import { describe, it, expect } from 'vitest';
import { mkdtempSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, relative, sep } from 'path';
import { FileService } from './file-service';
import type { CaseStudy, Collection } from '../shared/types';

const minimalCase = (id: number): CaseStudy => ({
  id,
  title: `Case ${id}`,
  domain: 'Business',
  complexity: 'Beginner',
  scenario_type: 'Problem-solving',
  content: 'Some case content.',
  questions: 'Q?',
  tags: ['t'],
  is_favorite: false,
  word_count: 3,
  usage_count: 0,
});

describe('FileService.exportBundle — filename sanitisation (path-traversal defence)', () => {
  it('collapses a traversal filename into a single safe segment inside exports/', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cq-h1-'));
    const files = new FileService({ dataDir: dir });
    const collections: Collection[] = [];
    const cases = [minimalCase(1)];

    const written = await files.exportBundle(
      collections as never,
      cases as never,
      '../../etc/pwned',
    );

    // Must resolve inside the exports directory.
    const exportsDir = resolve(dir, 'exports');
    const rel = relative(exportsDir, resolve(written));
    expect(rel.startsWith('..')).toBe(false);
    expect(resolve(written).startsWith(exportsDir)).toBe(true);

    // No path separators or parent traversal in the basename.
    const name = written.split(sep).pop()!;
    expect(name).not.toContain('/');
    expect(name).not.toContain('\\');
    expect(name).not.toContain('..');

    // The sanitized file exists and is valid bundle JSON.
    expect(existsSync(written)).toBe(true);
    const bundle = JSON.parse(readFileSync(written, 'utf8'));
    expect(bundle.bundle_info.total_cases).toBe(1);

    // The traversal target must NOT have been created.
    expect(existsSync(resolve(dir, '../../etc/pwned.json'))).toBe(false);
  });
});
