// Import Node.js Dependencies
import { describe, test } from "node:test";
import { styleText } from "node:util";
import assert from "node:assert";

// Import Internal Dependencies
import {
  localMatchOf,
  stringLength
} from "../src/utils/index.js";

describe("localMatchOf", () => {
  const arr = ["hello world", "hello everyone", "foo bar", "baz qux", "hello", "foobar"];

  test("returns correct match when there is a perfect match", () => {
    assert.equal(localMatchOf(arr, "foo"), " bar");
  });

  test("returns correct match when there is a partial match", () => {
    assert.equal(localMatchOf(arr, "fo"), "o bar");
  });

  test("returns null when there is no match", () => {
    assert.equal(localMatchOf(arr, "qwerty"), null);
  });

  test("returns first match when forceNextMatch is false", () => {
    assert.equal(localMatchOf(arr, "hello"), " world");
  });

  test("returns second match when forceNextMatch is true", () => {
    assert.equal(localMatchOf(arr, "hello", true), " everyone");
  });
});

describe("stringLength", () => {
  test("should detect length of emojis", () => {
    assert.equal(
      stringLength("😍😁"),
      2
    );
  });

  test("should detect length with ANSI codes", () => {
    assert.equal(
      stringLength(styleText("blue", "hello")),
      5
    );
  });
});
