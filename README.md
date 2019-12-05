# Stdin
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/stdin/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/stdin/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/stdin)
![size](https://img.shields.io/github/languages/code-size/SlimIO/stdin)
![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@slimio/stdin)
[![Build Status](https://travis-ci.com/SlimIO/stdin.svg?branch=master)](https://travis-ci.com/SlimIO/stdin)
[![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/stdin.svg)](https://greenkeeper.io/)

Node.js light and interactive standard input (stdin) crafted for REPL (like) experience (with auto-completion and history). Under the hood it use `process.stdin` and TTY Stream with the raw mode enabled to catch key by key.

<p align="center">Demo with the SlimIO CLI<p>
<p align="center">
<img src="https://i.imgur.com/t18LDhm.gif">
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher

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

stdin("Question title > ", {
    history: ["command in history 1", "command in history 2"],
    autocomplete: [
        "events",
        "events.get_info"
    ]
})
.then((data) => console.log(`input data: ${data}`))
.catch(console.error);
```

> 👀 the reference to the history array is keeped. So if you want to achieve a while of input, think to declare a top array history that will be used by all inputs.

## API

### stdin(query: null | string, options?: Options): Promise< string >
Query paramaters can be set to `null` to disable the title. Options is described by the following TypeScript interface:

```ts
interface Options {
    history?: string[];
    autocomplete?: string[];
}
```

history and autocomplete are optional. There is no thing as a cache or limitation for history (you have to implement that kind of stuff yourself with [cacache](https://www.npmjs.com/package/cacache)).

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[fast-levenshtein](https://github.com/hiddentao/fast-levenshtein#readme)|Major|Low|Implementation of levenshtein algo to found similar strings for auto-completion|
|[string-length](https://github.com/sindresorhus/string-length#readme)|Major|Low|Get the real string length|

## License
MIT
