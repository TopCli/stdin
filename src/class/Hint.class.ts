// Import Node.js Dependencies
import { stripVTControlCharacters } from "node:util";

// Import Internal Dependencies
import { stringLength } from "../utils/index.js";

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
