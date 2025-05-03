// CONSTANTS
const kLenSegmenter = new Intl.Segmenter();

export function strLength(
  value: string
): number {
  if (value === "") {
    return 0;
  }

  let length = 0;
  for (const _ of kLenSegmenter.segment(value)) {
    length++;
  }

  return length;
}
