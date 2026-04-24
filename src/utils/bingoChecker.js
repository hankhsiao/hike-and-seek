const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function checkBingo(grid) {
  return LINES.filter(line =>
    line.every(idx => grid[idx]?.status === 'approved')
  );
}

export function isNewBingoAtIndex(grid, gridIndex) {
  return LINES.some(line =>
    line.includes(gridIndex) &&
    line.every(idx => grid[idx]?.status === 'approved')
  );
}
