// Import Node.js Dependencies
import * as TTY from "node:tty";

// Import Internal Dependencies
import { Cursor } from "./Cursor.class.ts";
import { stringLength } from "../utils/index.ts";

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

  private clear() {
    this.output.moveCursor(this.cursor.offset - this.cursor.position, 0);
    this.output.moveCursor(-this.value.length, 0);
    this.output.clearLine(1);
  }

  private cursorIsAtEnd() {
    return this.cursor.position === this.value.length;
  }

  cursorIntermediatePosition() {
    return stringLength(this.value) - this.cursor.position;
  }

  append(
    input: string
  ): string {
    this.output.write(input);

    return this.appendValue(input);
  }

  private appendAtCursor(
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

  private appendValue(
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

  private replaceValue(
    input: string,
    cursorLength: number = input.length
  ): string {
    this.value = input;
    this.cursor.position = cursorLength;

    return this.value;
  }

  removeChar(): { autocomplete: boolean; } {
    if (this.cursorIsAtEnd()) {
      this.clear();
      this.replace(this.value.slice(0, -1));

      return { autocomplete: true };
    }
    else if (this.cursor.position > 0) {
      this.removeOneCharAtCursor();
    }

    return { autocomplete: false };
  }

  private removeOneCharAtCursor() {
    const position = this.cursorIntermediatePosition();
    const restStr = this.value.slice(this.cursor.position);

    this.cursor.left();
    this.output.clearLine(1);
    this.output.write(restStr);
    this.output.moveCursor(-position, 0);

    this.replaceValue(
      `${this.value.slice(0, this.cursor.position)}${restStr}`,
      this.cursor.position
    );
  }

  toString() {
    return this.value;
  }
}
