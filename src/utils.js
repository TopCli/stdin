// Import Third-party Dependencies
import levenshtein from "fast-levenshtein";

/**
 * @function localMatchOf
 * @param {!Array<string>} arr
 * @param {!string} str
 * @param {boolean} [forceNextMatch=false]
 * @returns {string | null}
 */
export function localMatchOf(arr, str, forceNextMatch = false) {
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
