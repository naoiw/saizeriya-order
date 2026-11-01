/**
 * Return distinct menu entries without mutating the original dataset.
 * A supplied random function allows deterministic tests.
 */
export function pickQuestions(items, count = 5, random = Math.random) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("Question count must be a positive integer");
  }
  const pool = [...new Map(items.map((item) => [item.code, item])).values()];
  if (pool.length < count) {
    throw new RangeError("At least " + count + " distinct dishes are required");
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("Random value must be in [0, 1)");
    }
    const j = Math.floor(value * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function appendDigit(current, digit) {
  if (!/^[0-9]$/.test(digit) || current.length >= 4) return current;
  return current + digit;
}

export function backspaceDigit(current) {
  return current.slice(0, -1);
}

export function scoreResults(results) {
  return results.filter((result) => result.isCorrect).length;
}
