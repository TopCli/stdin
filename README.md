# Stdin
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/TopCli/stdin/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/TopCli/stdin/commit-activity)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/master/processes/responsible_disclosure_template.md
)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/TopCli/stdin/blob/master/LICENSE)
![build](https://img.shields.io/github/workflow/status/TopCli/stdin/Node.js%20CI)

Node.js light and interactive standard input (stdin) crafted for REPL (like) experience (with auto-completion and history). Under the hood it use `process.stdin` and TTY Stream with the raw mode enabled to catch key by key.

<p align="center">Demo with the SlimIO CLI<p>
<p align="center">
<img src="https://i.imgur.com/t18LDhm.gif">
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v14 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @topcli/stdin
# or
$ yarn add @topcli/stdin
```

## Usage example
```js
import stdin from "@topcli/stdin";

const data = await stdin("Question title > ", {
  history: ["command in history 1", "command in history 2"],
  autocomplete: [
    "events",
    "events.get_info"
  ]
});
console.log(`input data: ${data}`);
```

> 👀 the reference to the history array is keeped. So if you want to achieve a while of input, think to declare a top array history that will be used by all inputs.

## API

### stdin(query: null | string, options?: StdinOptions): Promise< string >
Query paramaters can be set to `null` to disable the title. Options is described by the following TypeScript interface:

```ts
interface StdinOptions {
    history?: string[];
    autocomplete?: string[];
}
```

history and autocomplete are optional. There is no thing as a cache or limitation for history (you have to implement that kind of stuff yourself with [cacache](https://www.npmjs.com/package/cacache)).

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
