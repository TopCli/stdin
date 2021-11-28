// Import Node.js Dependencies
import { emitKeypressEvents } from "readline";

// Import Third-party Dependencies
import strLength from "string-length";

// Import Internal Dependencies
import { localMatchOf } from "./src/utils.js";

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
  if (!Array.isArray(history)) {
    throw new TypeError("history must be an Array Object");
  }

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
    let currentHistoryIndex = history.length;
    let isOriginalStr = true;
    let autoCompletionActivated = false;
    let autoCompletionStr = "";
    let realCompletionStr = "";

    // eslint-disable-next-line
    function clearAutoCompletion(forceClean = false) {
      if (autoCompletionActivated) {
        process.stdout.clearLine(1);

        autoCompletionActivated = false;
        autoCompletionStr = "";
      }
      else if (forceClean) {
        process.stdout.clearLine(1);
      }
    }

    // eslint-disable-next-line
    function searchForCompletion(str, forceNextMatch = false) {
      if (noRefComplete.length === 0) {
        return true;
      }
      const localMatch = localMatchOf(noRefComplete, rawStr, forceNextMatch);

      clearAutoCompletion();
      if (localMatch !== null && localMatch !== "") {
        realCompletionStr = localMatch;
        autoCompletionStr = `\x1b[90m${localMatch}\x1b[39m`;
        autoCompletionActivated = true;
        process.stdout.write(typeof str === "undefined" ? autoCompletionStr : `${str}${autoCompletionStr}`);
        process.stdout.moveCursor(-strLength(autoCompletionStr), 0);

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
        const uniqueHistorySet = new Set(history);

        const trimedRawStr = rawStr.trim();
        const result = trimedRawStr === "" ? null : trimedRawStr;

        if (result !== null) {
          uniqueHistorySet.add(rawStr);
        }
        history.splice(0, history.length);
        history.push(...uniqueHistorySet);

        resolve(result);
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

        if (!autoCompletionActivated) {
          return;
        }

        clearAutoCompletion();
        process.stdout.write(realCompletionStr);
        rawStr += realCompletionStr;
        currentCursorPosition += realCompletionStr.length;
        realCompletionStr = "";
        searchForCompletion(void 0, true);
      }
      else if (key.name === "up" || key.name === "down") {
        const moveIndexValue = key.name === "up" ? -1 : 1;
        const nextIndex = currentHistoryIndex + moveIndexValue;
        const rawStrCopy = rawStr;

        if (history.length === 0) {
          if (isOriginalStr && rawStrCopy.trim() !== "") {
            history.push(rawStrCopy);
            isOriginalStr = false;
          }

          return;
        }
        if (nextIndex < 0 || nextIndex >= history.length) {
          return;
        }

        clearAutoCompletion();
        rawStr = history[nextIndex];
        process.stdout.moveCursor(-rawStrCopy.length, 0);
        process.stdout.clearLine(1);
        process.stdout.write(rawStr);

        currentCursorPosition = rawStr.length;
        currentHistoryIndex = nextIndex;

        if (isOriginalStr && rawStrCopy.trim() !== "") {
          history.push(rawStrCopy);
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
