interface StdinOptions {
  history?: string[];
  autocomplete?: string[];
}

declare function stdin(query: null | string, options?: StdinOptions): Promise<string>;

export = stdin;
