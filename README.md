# Stdin
![version](https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/TopCli/stdin/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/TopCli/stdin/commit-activity)
[![mit](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://github.com/TopCli/stdin/blob/master/LICENSE)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/TopCli/stdin/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/TopCli/stdin)
![build](https://img.shields.io/github/actions/workflow/status/TopCli/stdin/node.js.yml?style=for-the-badge)

A lightweight and interactive standard input (stdin) utility for Node.js, designed for REPL-like experiences with support for auto-completion and history.

Internally, it leverages `process.stdin` in raw mode to capture key-by-key input directly from the TTY stream.

<p align="center">Demo with the SlimIO CLI<p>
<p align="center">
<img src="https://i.imgur.com/t18LDhm.gif">
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v22 or higher

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

> [!TIP]
> 💡 The history array is passed by reference. If you plan to run multiple prompts in a loop, define a shared history array outside the loop to persist input history across calls.

## API

### stdin(title: null | string, options?: StdinOptions): Promise< string >

Prompts the user for input with an optional title and options. If **title** is `null`, the prompt will be displayed without a prefix.

`StdinOptions` interface

```ts
interface StdinOptions {
  /**
   * An array of previous commands or inputs to enable navigation with arrow keys.
   */
  history?: string[];
  /**
   * A list of strings used to suggest autocompletion while typing.
   */
  autocomplete?: string[];
}
```

> [!CAUTION]
> This module does not implement history persistence or caching. If you want to persist history across sessions, consider using a package like [cacache](https://github.com/npm/cacache#readme).

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/TopCli/stdin/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/TopCli/stdin/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/TopCli/stdin/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/TopCli/stdin/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AlexandreMalaj"><img src="https://avatars.githubusercontent.com/u/32218832?v=4?s=100" width="100px;" alt="Alexandre Malaj"/><br /><sub><b>Alexandre Malaj</b></sub></a><br /><a href="https://github.com/TopCli/stdin/commits?author=AlexandreMalaj" title="Code">💻</a> <a href="https://github.com/TopCli/stdin/commits?author=AlexandreMalaj" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreDemailly"/><br /><sub><b>PierreDemailly</b></sub></a><br /><a href="https://github.com/TopCli/stdin/commits?author=PierreDemailly" title="Code">💻</a> <a href="https://github.com/TopCli/stdin/commits?author=PierreDemailly" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
