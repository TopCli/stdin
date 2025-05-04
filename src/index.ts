// Import Node.js Dependencies
import { emitKeypressEvents } from "node:readline";

// Import Internal Dependencies
import { History } from "./class/History.class.js";
import { InputBuffer } from "./class/InputBuffer.class.js";
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

export default function stdin(
  title: string | null,
  options: StdinOptions = {}
): Promise<string> {
  emitKeypressEvents(process.stdin);
  if (!process.stdin.isTTY) {
    throw new Error("Current stdin must be a TTY");
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  if (typeof title === "string") {
    process.stdout.write(title);
  }

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
  autocompletion: Completion,
  completeCallback: (result: string) => void
) {
  const ib = new InputBuffer(process.stdout);

  return (input: string, key: Key) => {
    ib.cursor.offset = ib.toString().length;

    switch (normalizeKey(key)) {
      case "ctrl+c":
      case "return":
      case "escape":
        completeCallback(
          history.push(ib.toString())
        );
        break;
      case "left": {
        ib.cursor.left();
        break;
      }
      case "right":
      case "tab": {
        if (
          (key.name !== "tab" && ib.cursor.right()) ||
          autocompletion.hint.length === 0
        ) {
          break;
        }

        ib.append(
          autocompletion.hint.strip()
        );
        autocompletion.findHint(ib.toString(), void 0, true);
        break;
      }
      case "up":
      case "down": {
        if (history.length === 0) {
          history.keep(ib.toString());
          break;
        }
        if (
          !history[key.name]()
        ) {
          break;
        }

        autocompletion.clearHint();
        history.keep(
          ib.replace(history.current, { clearOutput: true })
        );
        break;
      }
      case "backspace": {
        const currentText = ib.toString();
        if (ib.cursorIsAtEnd()) {
          autocompletion.clearHint();
          ib.clear();

          autocompletion.findHint(
            ib.replace(currentText.slice(0, -1))
          );
        }
        else if (ib.cursor.position > 0) {
          const intermediateCursorPos = stringLength(currentText) - ib.cursor.position;
          const restStr = currentText.slice(ib.cursor.position);

          ib.cursor.left();
          autocompletion.clearHint(true);

          process.stdout.write(restStr);
          process.stdout.moveCursor(-intermediateCursorPos, 0);

          ib.replaceValue(
            `${currentText.slice(0, ib.cursor.position)}${restStr}`,
            ib.cursor.position
          );
        }
        break;
      }
      default: {
        const { autocomplete } = ib.appendChar(input);

        if (
          autocomplete &&
          autocompletion.findHint(ib.toString(), input)
        ) {
          process.stdout.write(input);
        }
        break;
      }
    }
  };
}

function normalizeKey(
  key: Key
): string {
  if (key.ctrl && key.name === "c") {
    return "ctrl+c";
  }

  return key.name;
}
