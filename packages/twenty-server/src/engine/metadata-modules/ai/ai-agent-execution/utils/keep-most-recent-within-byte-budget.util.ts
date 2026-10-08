import { utf8ByteLengthOf } from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const LINE_BREAK_BYTES = 1;

// the latest entries are the ones an answer is usually built on, so the oldest are dropped first;
// each entry also counts the line break it is joined with, so the joined text stays within the budget
export const keepMostRecentWithinByteBudget = ({
  entries,
  maxBytes,
}: {
  entries: string[];
  maxBytes: number;
}): { keptEntries: string[]; omittedCount: number } => {
  const keptEntries: string[] = [];
  let usedBytes = 0;

  for (let index = entries.length - 1; index >= 0; index--) {
    const entryBytes = utf8ByteLengthOf(entries[index]) + LINE_BREAK_BYTES;

    if (usedBytes + entryBytes > maxBytes) {
      break;
    }

    keptEntries.unshift(entries[index]);
    usedBytes += entryBytes;
  }

  return { keptEntries, omittedCount: entries.length - keptEntries.length };
};
