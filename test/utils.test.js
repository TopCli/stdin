// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { localMatchOf } from "../src/utils.js";

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
