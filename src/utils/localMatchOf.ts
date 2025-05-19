// Import Third-party Dependencies
import { distance } from "fastest-levenshtein";

export function localMatchOf(
  choices: string[],
  input: string,
  forceNextMatch = false
): string | null {
  let isFirstMatch = true;

  for (const value of choices) {
    const currCost = distance(input, value.slice(0, input.length));
    if (currCost === 0) {
      if (forceNextMatch && isFirstMatch) {
        isFirstMatch = false;
        continue;
      }

      const match = value.slice(input.length);

      return match === "" ? null : match;
    }
  }

  return null;
}
