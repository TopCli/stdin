export class History {
  #commands: string[] = [];
  #index = 0;

  constructor(
    commands: string[] = []
  ) {
    this.#commands = commands;
    this.#index = this.#commands.length;
  }

  push(
    command: string,
    noDuplicateCheck = false
  ): string {
    const trimmedCommand = command.trim();

    if (
      trimmedCommand !== "" &&
      (noDuplicateCheck || !this.#commands.includes(trimmedCommand))
    ) {
      this.#commands.push(trimmedCommand);
    }

    return trimmedCommand;
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
