/**
 * Independent draws with replacement: a product may appear multiple times.
 * Input is already filtered to enabled order codes by the caller.
 */
export function drawGacha(items, count = 5, random = Math.random, previousCodes = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new RangeError("At least one available menu item is required");
  }
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new RangeError("Draw count must be a positive integer");
  }
  const pick = () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("Random value must be in [0, 1)");
    }
    return items[Math.floor(value * items.length)];
  };
  const draw = () => Array.from({ length: count }, pick);
  const sameAsLast = (selection) =>
    previousCodes.length === count &&
    selection.every((item, index) => item.code === previousCodes[index]);

  let chosen = draw();
  // Cryptographic randomness makes a repeat exceedingly unlikely. Nevertheless
  // never repeat the *entire ordered result* if a prior draw exists.
  if (sameAsLast(chosen) && items.length > 1) {
    for (let retry = 0; retry < 4 && sameAsLast(chosen); retry++) {
      chosen = draw();
    }
    if (sameAsLast(chosen)) {
      const alternate = items.find((item) => item.code !== chosen[0].code);
      if (alternate) chosen[0] = alternate;
    }
  }
  return chosen;
}
