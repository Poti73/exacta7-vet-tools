import type { SearchEntry, Group } from './index';
export const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[µμ]/g, 'u').replace(/[^a-z0-9]+/g, ' ').trim();
function distance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    matrix[i][j] = Math.min(matrix[i-1][j]+1, matrix[i][j-1]+1, matrix[i-1][j-1]+Number(a[i-1] !== b[j-1]));
    if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]) matrix[i][j] = Math.min(matrix[i][j], matrix[i-2][j-2]+1);
  }
  return matrix[a.length][b.length];
}
export type Hit = SearchEntry & { approximate: boolean; score: number };
export function createSearch(entries: SearchEntry[]) {
  const index = entries.map(entry => ({ entry, title: normalize(entry.title), words: normalize([entry.title, ...entry.terms, ...entry.species, ...entry.routes, ...entry.indications, ...entry.categories].join(' ')).split(' ') }));
  return (query: string, group?: Group): Hit[] => {
    const q = normalize(query.slice(0, 120));
    const tokens = q.split(' ').filter(Boolean).slice(0, 12);
    if (!tokens.length) return [];
    return index.flatMap(({ entry, title, words }) => {
      if (group && entry.group !== group) return [];
      let approximate = false; let score = title === q ? 100 : title.startsWith(q) ? 60 : 0;
      for (const token of tokens) {
        if (words.includes(token)) score += 10;
        else if (words.some(w => w.startsWith(token))) score += 5;
        else if (token.length >= 4 && words.some(w => Math.abs(w.length-token.length) <= 1 && distance(token, w) <= 1)) { approximate = true; score += 1; }
        else return [];
      }
      return [{ ...entry, approximate, score }];
    }).sort((a,b) => Number(a.approximate)-Number(b.approximate) || b.score-a.score || a.id.localeCompare(b.id, 'es')).slice(0, 60);
  };
}
