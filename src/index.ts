// Import Node.js Dependencies
import { emitKeypressEvents } from "node:readline";

// Import Internal Dependencies
import { History } from "./class/History.class.js";
import { Completion } from "./class/Completion.class.js";
import {
  stringLength
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
  emitKeypressEvents(process.stdin);
  if (!process.stdin.isTTY) {
    throw new Error("Current stdin must be a TTY");
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  typeof query === "string" && process.stdout.write(query);

  const { resolve, promise } = Promise.withResolvers<string>();

  const listener = keyPressListener(
    new History(options.history),
    new Completion(
      process.stdout,
      options?.autocomplete ?? []
    ),
    (result) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      process.stdin.removeListener("keypress", listener);

      resolve(result);
    }
  );
  process.stdin.on("keypress", listener);

  return promise;
}

function keyPressListener(
  history: History,
  completion: Completion,
  completeCb: (result: string) => void
) {
  let rawStr = "";
  let cursorPos = 0;
  let isOriginalStr = true;

  return (str: string, key: Key) => {
    if (key.ctrl || key.name === "return" || key.name === "escape") {
      completeCb(history.push(rawStr));
    }
    else if (key.name === "left") {
      if (cursorPos > 0) {
        process.stdout.moveCursor(-1, 0);
        cursorPos--;
      }
    }
    else if (key.name === "right" || key.name === "tab") {
      if (cursorPos < rawStr.length && key.name !== "tab") {
        process.stdout.moveCursor(1, 0);
        cursorPos++;

        return;
      }

      if (completion.hint.length === 0) {
        return;
      }

      const completionHintStripped = completion.hint.strip();

      process.stdout.write(completionHintStripped);
      rawStr += completionHintStripped;
      cursorPos += completionHintStripped.length;
      completion.lookFor(rawStr, void 0, true);
    }
    else if (key.name === "up" || key.name === "down") {
      const rawStrCopy = rawStr;

      if (history.length === 0) {
        if (isOriginalStr && rawStrCopy.trim() !== "") {
          history.push(rawStrCopy);

          isOriginalStr = false;
        }

        return;
      }

      const hasSwitchedHistory = key.name === "up" ? history.up() : history.down();
      if (!hasSwitchedHistory) {
        return;
      }

      completion.clear();
      rawStr = history.current;
      process.stdout.moveCursor(-rawStrCopy.length, 0);
      process.stdout.clearLine(1);
      process.stdout.write(rawStr);

      cursorPos = rawStr.length;

      if (isOriginalStr && rawStrCopy.trim() !== "") {
        history.push(rawStrCopy);
        isOriginalStr = false;
      }
    }
    else if (key.name === "backspace") {
      if (cursorPos === rawStr.length) {
        const rawStrCopy = rawStr;
        completion.clear();

        rawStr = rawStr.slice(0, rawStrCopy.length - 1);
        process.stdout.moveCursor(-rawStrCopy.length, 0);
        process.stdout.clearLine(1);
        process.stdout.write(rawStr);
        cursorPos = rawStr.length;

        completion.lookFor(rawStr);
      }
      else {
        const nLen = stringLength(rawStr) - cursorPos;
        process.stdout.moveCursor(-1, 0);
        completion.clear(true);
        const restStr = rawStr.slice(cursorPos);
        process.stdout.write(restStr);
        process.stdout.moveCursor(-nLen, 0);

        cursorPos--;
        rawStr = `${rawStr.slice(0, cursorPos)}${restStr}`;
      }
    }
    else {
      if (cursorPos === rawStr.length) {
        rawStr += str;
        cursorPos++;
      }
      else {
        const rawStrCopy = rawStr;
        rawStr = `${rawStr.slice(0, cursorPos)}${str}${rawStr.slice(cursorPos)}`;
        const restStr = rawStrCopy.slice(cursorPos);

        process.stdout.write(`${str}${restStr}`);
        cursorPos++;
        process.stdout.moveCursor(-restStr.length, 0);

        return;
      }

      if (completion.lookFor(rawStr, str)) {
        process.stdout.write(str);
      }
    }
  }
}
