"use strict";

// Require Node.js Dependencies
const { emitKeypressEvents } = require("readline");

// Require Third-party Dependencies
const flatstr = require("flatstr");
const levenshtein = require("fast-levenshtein");
const strLength = require("string-length");

/**
 * @async
 * @function stdin
 * @param {!string} query
 * @param {object} [options]
 * @param {Array<string>} [options.history]
 * @param {Array<string>} [options.autocomplete]
 * @returns {Promise<string>}
 *
 * @throws {TypeError}
 * @throws {Error}
 */
async function stdin(query = "question", options = {}) {
    if (typeof query !== "string" && query !== null) {
        throw new TypeError("query must be a string or a null primitive value");
    }

    const { history = [], autocomplete = [] } = options;
    if (!Array.isArray(history)) {
        throw new TypeError("history must be an Array Object");
    }
    if (!Array.isArray(autocomplete)) {
        throw new TypeError("autocomplete must be an Array Object");
    }

    emitKeypressEvents(process.stdin);
    if (!process.stdin.isTTY) {
        throw new Error("Current stdin must be a TTY");
    }
    process.stdin.setRawMode(true);
    if (query !== null) {
        process.stdout.write(`${query}: `);
    }

    // Ensure we dont keep initial ref
    const noRefHistory = history.slice(0);
    const noRefComplete = autocomplete.slice(0);

    return new Promise((resolve) => {
        let rawStr = "";
        let currentHistoryIndex = noRefHistory.length;
        let isOriginalStr = true;
        let autoCompletionActivated = false;
        /** @type {string} */
        let autoCompletionStr = null;
        let realCompletionStr = "";

        // eslint-disable-next-line
        function clearAutoCompletion() {
            if (autoCompletionActivated) {
                process.stdout.clearLine(1);

                autoCompletionActivated = false;
                autoCompletionStr = null;
            }
        }

        process.stdin.on("keypress", (str, key) => {
            if (str === "\u0003" || key.name === "return" || key.name === "escape") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdout.write("\n");

                flatstr(rawStr);
                resolve(rawStr);
            }
            else if (key.name === "right") {
                if (!autoCompletionActivated) {
                    return;
                }

                clearAutoCompletion();
                process.stdout.write(realCompletionStr);
                rawStr += realCompletionStr;
                realCompletionStr = "";
            }
            else if (key.name === "up" || key.name === "down") {
                const moveIndexValue = key.name === "up" ? -1 : 1;
                const nextIndex = currentHistoryIndex + moveIndexValue;
                if (noRefHistory.length === 0 || nextIndex < 0 || nextIndex >= noRefHistory.length) {
                    return;
                }

                clearAutoCompletion();
                const rawStrCopy = rawStr;
                rawStr = noRefHistory[nextIndex];
                process.stdout.moveCursor(-rawStrCopy.length, 0);
                process.stdout.clearLine(1);
                process.stdout.write(rawStr);

                currentHistoryIndex = nextIndex;
                if (isOriginalStr && rawStr.trim() !== "") {
                    noRefHistory.push(rawStrCopy);
                    isOriginalStr = false;
                }
            }
            else if (key.name === "backspace") {
                clearAutoCompletion();

                const rawStrCopy = rawStr;
                rawStr = rawStr.slice(0, rawStrCopy.length - 1);
                process.stdout.moveCursor(-rawStrCopy.length, 0);
                process.stdout.clearLine(1);
                process.stdout.write(rawStr);
            }
            else {
                flatstr(str);
                rawStr += str;
                autoComplete: if (noRefComplete.length > 0) {
                    let localMatch = null;
                    for (const value of noRefComplete) {
                        const eqCost = levenshtein.get(rawStr, value.slice(0, rawStr.length));
                        if (eqCost <= 2) {
                            realCompletionStr = value.slice(rawStr.length);
                            localMatch = `\x1b[90m${realCompletionStr}\x1b[39m`;
                            break;
                        }
                    }

                    clearAutoCompletion();
                    if (localMatch === null) {
                        break autoComplete;
                    }
                    autoCompletionStr = localMatch;
                    autoCompletionActivated = true;
                    process.stdout.write(`${str}${autoCompletionStr}`);
                    process.stdout.moveCursor(-strLength(autoCompletionStr), 0);

                    return;
                }

                process.stdout.write(str);
            }
        });
    });
}

module.exports = stdin;
