import * as Diff from 'diff';

export interface DiffStats {
  additions: number;
  deletions: number;
  reworded: number;
}

// Adjacent removed→added pairs read as one edited clause, not a delete plus
// an unrelated add — mirrors how a human reviewer would describe the same
// change ("2 clauses reworded" rather than "2 deletions, 2 additions").
export function computeDiffStats(parts: Diff.Change[]): DiffStats {
  let additions = 0;
  let deletions = 0;
  let reworded = 0;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].removed && parts[i + 1]?.added) {
      reworded++;
      i++;
    } else if (parts[i].added) {
      additions++;
    } else if (parts[i].removed) {
      deletions++;
    }
  }
  return { additions, deletions, reworded };
}

export function diffTexts(oldText: string, newText: string): Diff.Change[] {
  return Diff.diffWords(oldText, newText);
}
