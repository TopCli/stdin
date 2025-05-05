export class History {
  #commands: string[] = [];
  #index = 0;
  #lastEnteredText: string = "";

  constructor(
    commands: string[] = []
  ) {
    this.#commands = commands;
    this.#index = this.#commands.length;
  }

  keep(
    command: string
  ) {
    const trimmedCommand = command.trim();
    if (trimmedCommand === "") {
      return false;
    }

    if (this.#index === this.#commands.length) {
      this.#lastEnteredText = trimmedCommand;

      return false;
    }

    if (this.#commands[this.#index] !== trimmedCommand) {
      this.#lastEnteredText = trimmedCommand;

      return true;
    }

    return false;
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
      return this.#lastEnteredText;
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
