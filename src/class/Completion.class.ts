// Import Node.js Dependencies
import * as TTY from "node:tty";
import { stripVTControlCharacters } from "node:util";

// Import Internal Dependencies
import {
  localMatchOf,
  stringLength
} from "../utils/index.js";

export interface FindHintOptions {
  /**
   * @default false
   */
  forceNextMatch?: boolean;
  currentInput?: string;
}

export class Completion {
  public hint = new Hint();

  private choices: string[];
  private output: TTY.WriteStream;

  constructor(
    output: TTY.WriteStream,
    choices: string[]
  ) {
    this.output = output;
    this.choices = choices.slice(0);
  }

  clearHint() {
    if (this.hint.length > 0) {
      this.output.clearLine(1);
      this.hint.clear();
    }
  }

  findHint(
    rawInput: string,
    options: FindHintOptions = {}
  ) {
    const {
      forceNextMatch = false,
      currentInput
    } = options;

    if (this.choices.length === 0) {
      return true;
    }
    const localMatch = localMatchOf(this.choices, rawInput, forceNextMatch);

    this.clearHint();
    if (localMatch) {
      this.hint.setValue(localMatch);
      this.output.write(
        this.hint.prefix(currentInput)
      );
      this.output.moveCursor(
        -this.hint.length,
        0
      );

      return false;
    }

    return true;
  }
}

export class Hint {
  value: string = "";

  get length() {
    return stringLength(this.value);
  }

  prefix(
    prefixString: string | undefined
  ): string {
    return typeof prefixString === "undefined" ?
      this.value :
      `${prefixString}${this.value}`;
  }

  clear() {
    this.value = "";

    return this;
  }

  setValue(value: string) {
    this.value = `\x1b[90m${value}\x1b[39m`;

    return this;
  }

  strip(): string {
    return stripVTControlCharacters(this.value);
  }
}
