// Import Node.js Dependencies
import * as TTY from "node:tty";

// Import Internal Dependencies
import { History } from "./History.class.js";
import { Completion } from "./Completion.class.js";
import { InputBuffer } from "./InputBuffer.class.js";

type Key = {
  sequence?: string;
  name: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
};

export interface KeyListenerOptions {
  history?: string[];
  autocomplete?: string[];
}

export class KeyListener {
  private history: History;
  private autocomplete: Completion;
  private inputBuffer: InputBuffer;
  private output: TTY.WriteStream;

  constructor(
    options: KeyListenerOptions = {},
    output: TTY.WriteStream = process.stdout
  ) {
    const {
      autocomplete = [],
      history
    } = options;

    this.output = output;
    this.history = new History(history);
    this.autocomplete = new Completion(output, autocomplete);
    this.inputBuffer = new InputBuffer(output);
  }

  private complete() {
    if (this.autocomplete.hint.length === 0) {
      return;
    }

    this.inputBuffer.append(
      this.autocomplete.hint.strip()
    );
    this.autocomplete.findHint(
      this.inputBuffer.toString(),
      { forceNextMatch: true }
    );
  }

  private historize(
    direction: "up" | "down"
  ) {
    const currentText = this.inputBuffer.toString();
    this.history.keep(currentText);

    if (this.history.length === 0 || !this.history[direction]()) {
      return;
    }

    this.autocomplete.clearHint();
    this.inputBuffer.replace(this.history.current, { clearOutput: true });
  }

  private backspace() {
    this.autocomplete.clearHint();
    const { autocomplete } = this.inputBuffer.removeChar();

    if (autocomplete) {
      this.autocomplete.findHint(this.inputBuffer.toString());
    }
  }

  createListener(
    exitCallback: (result: string) => void
  ) {
    return (input: string, key: Key) => {
      const currentText = this.inputBuffer.toString();
      this.inputBuffer.cursor.offset = currentText.length;

      switch (normalizeKey(key)) {
        case "ctrl+c":
        case "return":
        case "escape":
          exitCallback(
            this.history.push(currentText)
          );
          break;
        case "left": {
          this.inputBuffer.cursor.left();
          break;
        }
        case "right":
        case "tab": {
          if (key.name !== "tab" && this.inputBuffer.cursor.right()) {
            return;
          }

          this.complete();
          break;
        }
        case "up":
        case "down": {
          this.historize(key.name as "up" | "down");
          break;
        }
        case "backspace": {
          this.backspace();
          break;
        }
        default: {
          const { autocomplete } = this.inputBuffer.appendChar(input);

          if (
            autocomplete &&
            this.autocomplete.findHint(this.inputBuffer.toString(), { currentInput: input })
          ) {
            this.output.write(input);
          }
          break;
        }
      }
    };
  }
}

function normalizeKey(
  key: Key
): string {
  if (key.ctrl && key.name === "c") {
    return "ctrl+c";
  }

  return key.name;
}
