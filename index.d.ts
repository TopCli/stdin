interface Options {
    history?: string[];
    autocomplete?: string[];
}

declare function stdin(query: null | string, options?: Options): Promise<string>;

export = stdin;
