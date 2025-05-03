// Import Third-party Dependencies
import levenshtein from "fast-levenshtein";

export function localMatchOf(
  arr: string[],
  str: string,
  forceNextMatch = false
): string | null {
  let isFirstMatch = true;

  for (const value of arr) {
    const currCost = levenshtein.get(str, value.slice(0, str.length));
    if (currCost === 0) {
      if (forceNextMatch && isFirstMatch) {
        isFirstMatch = false;
        continue;
      }

      return value.slice(str.length);
    }
  }

  return null;
}
