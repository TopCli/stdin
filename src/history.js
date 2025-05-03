
export class History {
  #commands = [];
  #index = 0;

  /**
   * @param {!string[]} commands
   */
  constructor(commands) {
    if (!Array.isArray(commands)) {
      throw new TypeError("commands must be an Array");
    }

    this.#commands = commands;
    this.#index = this.#commands.length;
  }

  push(command, noDuplicateCheck = false) {
    if (noDuplicateCheck || !this.#commands.includes(command)) {
      this.#commands.push(command);
    }
  }

  get current() {
    if (this.#index === this.#commands.length) {
      return "";
    }

    return this.#commands[this.#index];
  }

  get length() {
    return this.#commands.length;
  }

  down() {
    if (this.#index < this.#commands.length) {
      this.#index++;

      return true;
    }

    return false;
  }

  up() {
    if (this.#index > 0) {
      this.#index--;

      return true;
    }

    return false;
  }
}
