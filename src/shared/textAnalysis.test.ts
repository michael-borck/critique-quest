import { describe, it, expect } from 'vitest';
import { countWords } from './textAnalysis';

describe('countWords', () => {
  it('counts words separated by arbitrary whitespace', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('one  two\tthree\nfour')).toBe(4);
  });

  it('does not over-count leading/trailing/repeated spaces', () => {
    expect(countWords('   hello   world   ')).toBe(2);
  });

  it('returns 0 for empty or whitespace-only strings', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t ')).toBe(0);
  });
});
