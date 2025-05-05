// Import Node.js Dependencies
import { emitKeypressEvents } from "node:readline";

// Import Internal Dependencies
import { History } from "./class/History.class.js";
import { InputBuffer } from "./class/InputBuffer.class.js";
import { Completion } from "./class/Completion.class.js";

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
  const inputBuffer = new InputBuffer(process.stdout);

  return (input: string, key: Key) => {
    inputBuffer.cursor.offset = inputBuffer.toString().length;

    switch (normalizeKey(key)) {
      case "ctrl+c":
      case "return":
      case "escape":
        completeCallback(
          history.push(inputBuffer.toString())
        );
        break;
      case "left": {
        inputBuffer.cursor.left();
        break;
      }
      case "right":
      case "tab": {
        if (
          (key.name !== "tab" && inputBuffer.cursor.right()) ||
          autocompletion.hint.length === 0
        ) {
          break;
        }

        inputBuffer.append(
          autocompletion.hint.strip()
        );
        autocompletion.findHint(
          inputBuffer.toString(),
          { forceNextMatch: true }
        );
        break;
      }
      case "up":
      case "down": {
        if (history.length === 0) {
          history.keep(inputBuffer.toString());
          break;
        }
        if (
          !history[key.name]()
        ) {
          break;
        }

        autocompletion.clearHint();
        history.keep(
          inputBuffer.replace(history.current, { clearOutput: true })
        );
        break;
      }
      case "backspace": {
        autocompletion.clearHint();
        const { autocomplete } = inputBuffer.removeChar();

        if (autocomplete) {
          autocompletion.findHint(inputBuffer.toString());
        }
        break;
      }
      default: {
        const { autocomplete } = inputBuffer.appendChar(input);

        if (
          autocomplete &&
          autocompletion.findHint(inputBuffer.toString(), { currentInput: input })
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
