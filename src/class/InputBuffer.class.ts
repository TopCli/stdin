// Import Node.js Dependencies
import * as TTY from "node:tty";

// Import Internal Dependencies
import { Cursor } from "./Cursor.class.js";

export interface ReplaceOptions {
  clearOutput?: boolean;
}

export class InputBuffer {
  cursor: Cursor;

  private output: TTY.WriteStream;
  private value: string = "";

  constructor(
    output: TTY.WriteStream
  ) {
    this.output = output;
    this.cursor = new Cursor(this.output);
  }

  clear() {
    this.output.moveCursor(this.cursor.offset - this.cursor.position, 0);
    this.output.moveCursor(-this.value.length, 0);
    this.output.clearLine(1);
  }

  cursorIsAtEnd() {
    return this.cursor.position === this.value.length;
  }

  append(
    input: string
  ): string {
    this.output.write(input);

    return this.appendValue(input);
  }

  appendAtCursor(
    input: string
  ): string {
    const rightSideOfValue = this.value.slice(
      this.cursor.position
    );

    this.replaceValue(
      `${this.value.slice(0, this.cursor.position)}${input}${rightSideOfValue}`,
      ++this.cursor.position
    );

    this.output.write(`${input}${rightSideOfValue}`);
    this.output.moveCursor(-rightSideOfValue.length, 0);

    return this.value;
  }

  appendValue(
    input: string,
    cursorLength: number = input.length
  ): string {
    this.value += input;
    this.cursor.position += cursorLength;

    return this.value;
  }

  appendChar(
    char: string
  ): { autocomplete: boolean; } {
    if (this.cursorIsAtEnd()) {
      this.appendValue(char);

      return { autocomplete: true };
    }

    this.appendAtCursor(char);

    return { autocomplete: false };
  }

  replace(
    input: string,
    options: ReplaceOptions = {}
  ): string {
    const { clearOutput = false } = options;

    if (clearOutput) {
      this.clear();
    }
    this.output.write(input);

    return this.replaceValue(input);
  }

  replaceValue(
    input: string,
    cursorLength: number = input.length
  ): string {
    this.value = input;
    this.cursor.position = cursorLength;

    return this.value;
  }

  toString() {
    return this.value;
  }
}
