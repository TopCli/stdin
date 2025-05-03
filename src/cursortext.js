export class CursorText {
  #cursor = 0;
  #str = "";

  add(char) {
    this.#str += char;

    return this;
  }

  remove() {
    if (this.#str.length > 0) {
      this.#str = this.#str.slice(0, this.#str.length - 1);
    }

    return this;
  }

  synchronize() {
    this.#cursor = this.#str.length;

    return this;
  }

  left() {
    this.#cursor--;
  }

  right() {
    this.#cursor++;
  }

  get cursor() {
    return this.#cursor;
  }

  toString() {
    return this.#str.trim();
  }
}
