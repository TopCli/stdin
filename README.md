# Stdin
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/stdin/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/stdin/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/stdin)
![size](https://img.shields.io/github/languages/code-size/SlimIO/stdin)

Node.js light standard input (stdin) crafted for REPL experience

## Requirements
- [Node.js](https://nodejs.org/en/) v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/stdin
# or
$ yarn add @slimio/stdin
```

## Usage example
```js
const stdin = require("@slimio/stdin");

async function main() {
    const result = await stdin("Question title > ", {
        history: ["command in history 1", "command in history 2"],
        autocomplete: [
            "events",
            "events.get_info"
        ]
    });
    console.log(result);
}
main().catch(console.error);
```

## API

### stdin(query: null | string, options?: Options): Promise< string >
Query paramaters can be set to `null` to disable the title. Options is described by the following TypeScript interface:

```ts
interface Options {
    history?: string[];
    autocomplete?: string[];
}
```

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[fast-levenshtein](https://github.com/hiddentao/fast-levenshtein#readme)|Major|Low|Implementation of levenshtein algo to found similar strings for auto-completion|
|[string-length](https://github.com/sindresorhus/string-length#readme)|Major|Low|Get the real string length|

## License
MIT
