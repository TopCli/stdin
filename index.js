// Import Node.js Dependencies
import { emitKeypressEvents } from "node:readline";

// Import Third-party Dependencies
import strLength from "string-length";

// Import Internal Dependencies
import { localMatchOf } from "./src/utils.js";
import { History } from "./src/history.js";

/**
 * @async
 * @function stdin
 * @param {!string} query
 * @param {object} [options]
 * @param {Array<string>} [options.history]
 * @param {Array<string>} [options.autocomplete]
 * @returns {Promise<string>}
 *
 * @throws {TypeError}
 * @throws {Error}
 */
export default async function stdin(query = "question", options = {}) {
  if (typeof query !== "string" && query !== null) {
    throw new TypeError("query must be a string or a null primitive value");
  }

  const { history = [], autocomplete = [] } = options;
  const histo = new History(history);

  emitKeypressEvents(process.stdin);
  if (!process.stdin.isTTY) {
    throw new Error("Current stdin must be a TTY");
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  if (query !== null) {
    process.stdout.write(query);
  }

  // Ensure we dont keep initial ref
  const noRefComplete = autocomplete.slice(0);

  return new Promise((resolve) => {
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
      if (noRefComplete.length === 0) {
        return true;
      }
      const localMatch = localMatchOf(noRefComplete, rawStr, forceNextMatch);

      clearAutoCompletion();
      if (localMatch !== null && localMatch !== "") {
        completionHintStripped = localMatch;
        completionHint = `\x1b[90m${localMatch}\x1b[39m`;
        process.stdout.write(typeof str === "undefined" ? completionHint : `${str}${completionHint}`);
        process.stdout.moveCursor(-strLength(completionHint), 0);

        return false;
      }

      return true;
    }

    // eslint-disable-next-line
    const listener = (str, key) => {
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
  });
}
