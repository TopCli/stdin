// Import Node.js Dependencies
import * as TTY from "node:tty";

export class Cursor {
  position = 0;
  offset = 0;

  private output: TTY.WriteStream;

  constructor(
    output: TTY.WriteStream
  ) {
    this.output = output;
  }

  left() {
    if (this.position > 0) {
      this.output.moveCursor(-1, 0);
      this.position--;

      return true;
    }

    return false;
  }

  right() {
    if (this.position < this.offset) {
      process.stdout.moveCursor(1, 0);
      this.position++;

      return true;
    }

    return false;
  }
}
