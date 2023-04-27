# Stdin
![version](https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/TopCli/stdin/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/TopCli/stdin/commit-activity)
[![mit](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://github.com/TopCli/stdin/blob/master/LICENSE)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/TopCli/stdin/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/TopCli/stdin)
![build](https://img.shields.io/github/actions/workflow/status/TopCli/stdin/node.js.yml?style=for-the-badge)

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
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/TopCli/stdin/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/TopCli/stdin/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/TopCli/stdin/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/TopCli/stdin/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/AlexandreMalaj"><img src="https://avatars.githubusercontent.com/u/32218832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alexandre Malaj</b></sub></a><br /><a href="https://github.com/TopCli/stdin/commits?author=AlexandreMalaj" title="Code">💻</a> <a href="https://github.com/TopCli/stdin/commits?author=AlexandreMalaj" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
