// Import Node.js Dependencies
import * as TTY from "node:tty";

// Import Internal Dependencies
import { Hint } from "./Hint.class.js";
import {
  localMatchOf
} from "../utils/index.js";

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

  clear(
    force = false
  ) {
    if (this.hint.length > 0) {
      this.output.clearLine(1);
      this.hint.clear();
    }
    else if (force) {
      this.output.clearLine(1);
    }
  }

  lookFor(
    rawStr: string,
    str?: string,
    forceNextMatch = false
  ) {
    if (this.choices.length === 0) {
      return true;
    }
    const localMatch = localMatchOf(this.choices, rawStr, forceNextMatch);

    this.clear();
    if (localMatch !== null && localMatch !== "") {
      this.hint.setValue(localMatch);

      this.output.write(
        this.hint.prefix(str)
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
