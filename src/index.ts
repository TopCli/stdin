// Import Node.js Dependencies
import { emitKeypressEvents } from "node:readline";

// Import Internal Dependencies
import { History } from "./history.js";
import {
  localMatchOf,
  strLength
} from "./utils/index.js";

type Key = {
  sequence?: string;
  name: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
};

export interface StdinOptions {
  history?: string[];
  autocomplete?: string[];
}

export default async function stdin(
  query: string | null,
  options: StdinOptions = {}
): Promise<string> {
  const autocomplete = (
    options?.autocomplete ?? []
  ).slice(0);
  const histo = new History(options.history);

  emitKeypressEvents(process.stdin);
  if (!process.stdin.isTTY) {
    throw new Error("Current stdin must be a TTY");
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  if (typeof query === "string") {
    process.stdout.write(query);
  }

  const { resolve, promise } = Promise.withResolvers<string>();

  let rawStr = "";
  let currentCursorPosition = 0;
  let isOriginalStr = true;
  let completionHint = "";
  let completionHintStripped = "";

  function clearAutoCompletion(forceClean = false) {
    if (completionHint.length > 0) {
      process.stdout.clearLine(1);

      completionHint = "";
    }
    else if (forceClean) {
      process.stdout.clearLine(1);
    }
  }

  function searchForCompletion(str, forceNextMatch = false) {
    if (autocomplete.length === 0) {
      return true;
    }
    const localMatch = localMatchOf(autocomplete, rawStr, forceNextMatch);

    clearAutoCompletion();
    if (localMatch !== null && localMatch !== "") {
      completionHintStripped = localMatch;
      completionHint = `\x1b[90m${localMatch}\x1b[39m`;
      process.stdout.write(
        typeof str === "undefined" ? completionHint : `${str}${completionHint}`
      );
      process.stdout.moveCursor(
        -strLength(completionHint),
        0
      );

      return false;
    }

    return true;
  }

  const listener = (str: string, key: Key) => {
    if (str === "\u0003" || key.name === "return" || key.name === "escape") {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      process.stdin.removeListener("keypress", listener);

      const trimedRawStr = rawStr.trim();
      if (trimedRawStr !== "") {
        histo.push(trimedRawStr);
      }
      resolve(trimedRawStr);
    }
    else if (key.name === "left") {
      if (currentCursorPosition <= 0) {
        return;
      }

      process.stdout.moveCursor(-1, 0);
      currentCursorPosition--;
    }
    else if (key.name === "right" || key.name === "tab") {
      if (currentCursorPosition < rawStr.length && key.name !== "tab") {
        process.stdout.moveCursor(1, 0);
        currentCursorPosition++;

        return;
      }

      if (completionHint.length === 0) {
        return;
      }

      clearAutoCompletion();
      process.stdout.write(completionHintStripped);
      rawStr += completionHintStripped;
      currentCursorPosition += completionHintStripped.length;
      completionHintStripped = "";
      searchForCompletion(void 0, true);
    }
    else if (key.name === "up" || key.name === "down") {
      const rawStrCopy = rawStr;

      if (histo.length === 0) {
        if (isOriginalStr && rawStrCopy.trim() !== "") {
          histo.push(rawStrCopy);

          isOriginalStr = false;
        }

        return;
      }

      const hasSwitchedHistory = key.name === "up" ? histo.up() : histo.down();
      if (!hasSwitchedHistory) {
        return;
      }

      clearAutoCompletion();
      rawStr = histo.current;
      process.stdout.moveCursor(-rawStrCopy.length, 0);
      process.stdout.clearLine(1);
      process.stdout.write(rawStr);

      currentCursorPosition = rawStr.length;

      if (isOriginalStr && rawStrCopy.trim() !== "") {
        histo.push(rawStrCopy);
        isOriginalStr = false;
      }
    }
    else if (key.name === "backspace") {
      const rawStrCopy = rawStr;
      if (currentCursorPosition === rawStr.length) {
        clearAutoCompletion();
        rawStr = rawStr.slice(0, rawStrCopy.length - 1);
        process.stdout.moveCursor(-rawStrCopy.length, 0);
        process.stdout.clearLine(1);
        process.stdout.write(rawStr);
        currentCursorPosition = rawStr.length;

        searchForCompletion(void 0);
      }
      else {
        const nLen = strLength(rawStrCopy) - currentCursorPosition;
        process.stdout.moveCursor(-1, 0);
        clearAutoCompletion(true);
        const restStr = rawStrCopy.slice(currentCursorPosition);
        process.stdout.write(restStr);
        process.stdout.moveCursor(-nLen, 0);

        currentCursorPosition--;
        rawStr = `${rawStrCopy.slice(0, currentCursorPosition)}${restStr}`;
      }
    }
    else {
      if (currentCursorPosition === rawStr.length) {
        rawStr += str;
        currentCursorPosition++;
      }
      else {
        const rawStrCopy = rawStr;
        rawStr = `${rawStr.slice(0, currentCursorPosition)}${str}${rawStr.slice(currentCursorPosition)}`;
        const restStr = rawStrCopy.slice(currentCursorPosition);

        process.stdout.write(`${str}${restStr}`);
        currentCursorPosition++;
        process.stdout.moveCursor(-restStr.length, 0);

        return;
      }

      const writeToStdout = searchForCompletion(str);
      if (writeToStdout) {
        process.stdout.write(str);
      }
    }
  };

  process.stdin.on("keypress", listener);

  return promise;
}
