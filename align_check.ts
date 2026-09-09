// npx ts-node align_check.ts — terminal-column checks for all shipped artwork.
import assert from 'node:assert/strict';
import { EXPRESSIONS } from './src/mascot/assets/mint';
import { getFrame, plainFrame } from './src/mascot/frames';
import { cellWidth } from './src/terminal';

for (const expression of EXPRESSIONS) {
  for (const size of ['full', 'compact', 'tiny'] as const) {
    for (const ascii of [false, true]) {
      const frame = getFrame({ expression: expression.key, size, ascii });
      const rows = plainFrame(frame).split('\n');
      assert.equal(rows.length, frame.height);
      rows.forEach((row) => assert.equal(cellWidth(row), frame.width));
      if (ascii) assert.match(plainFrame(frame), /^[\x20-\x7e\n]*$/);
    }
  }
  console.log(`OK ${expression.key}`);
}
