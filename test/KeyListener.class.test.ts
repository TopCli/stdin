// Import Node.js Dependencies
import { describe, test, mock, beforeEach } from "node:test";
import assert from "node:assert";
import * as TTY from "node:tty";

// Import Internal Dependencies
import { KeyListener } from "../src/class/KeyListener.class.js";

type MockTTYWriteStream = {
  write: ReturnType<typeof mock.fn>;
  moveCursor: ReturnType<typeof mock.fn>;
  clearLine: ReturnType<typeof mock.fn>;
};

describe("KeyListener", () => {
  let mockOutput: MockTTYWriteStream;

  beforeEach(() => {
    mockOutput = {
      write: mock.fn(),
      moveCursor: mock.fn(),
      clearLine: mock.fn()
    };
  });

  test("should handle basic text input", () => {
    const keyListener = new KeyListener({}, mockOutput as unknown as TTY.WriteStream);
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    listener("a", { name: "a" });
    listener("b", { name: "b" });
    listener("c", { name: "c" });

    assert.equal(exitCallback.mock.calls.length, 0);
    assert.equal(mockOutput.write.mock.calls.length, 3);
  });

  test("should handle enter key to submit input", () => {
    const keyListener = new KeyListener({}, mockOutput as unknown as TTY.WriteStream);
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    listener("a", { name: "a" });
    listener("b", { name: "b" });
    listener("", { name: "return" });

    assert.equal(exitCallback.mock.calls.length, 1);
    assert.equal(exitCallback.mock.calls[0].arguments[0], "ab");
  });

  test("should handle escape key to submit input", () => {
    const keyListener = new KeyListener({}, mockOutput as unknown as TTY.WriteStream);
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    listener("test", { name: "t" });
    listener("", { name: "escape" });

    assert.equal(exitCallback.mock.calls.length, 1);
    assert.equal(exitCallback.mock.calls[0].arguments[0], "test");
  });

  test("should handle ctrl+c to submit input", () => {
    const keyListener = new KeyListener({}, mockOutput as unknown as TTY.WriteStream);
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    listener("test", { name: "t" });
    listener("", { name: "c", ctrl: true });

    assert.equal(exitCallback.mock.calls.length, 1);
    assert.equal(exitCallback.mock.calls[0].arguments[0], "test");
  });

  test("should handle history navigation", () => {
    const keyListener = new KeyListener(
      { history: ["command1", "command2"] },
      mockOutput as unknown as TTY.WriteStream
    );
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    // Navigate up
    listener("", { name: "up" });
    assert.equal(mockOutput.write.mock.calls.length, 1);
    assert.equal(mockOutput.clearLine.mock.calls.length, 1);

    // Navigate down
    listener("", { name: "down" });
    assert.equal(mockOutput.write.mock.calls.length, 2);
    assert.equal(mockOutput.clearLine.mock.calls.length, 2);
  });

  test("should handle autocomplete", () => {
    const keyListener = new KeyListener(
      { autocomplete: ["test1", "test2"] },
      mockOutput as unknown as TTY.WriteStream
    );
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    // Type 't' to trigger autocomplete
    listener("t", { name: "t" });
    assert.equal(mockOutput.write.mock.calls.length, 1);

    // Press tab to complete
    listener("", { name: "tab" });
    assert.equal(mockOutput.write.mock.calls.length, 2);
  });

  test("should handle backspace", () => {
    const keyListener = new KeyListener({}, mockOutput as unknown as TTY.WriteStream);
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    listener("a", { name: "a" });
    listener("b", { name: "b" });
    listener("", { name: "backspace" });

    assert.equal(mockOutput.write.mock.calls.length, 3);
    assert.equal(mockOutput.clearLine.mock.calls.length, 1);
  });

  test("should handle cursor movement", () => {
    const keyListener = new KeyListener({}, mockOutput as unknown as TTY.WriteStream);
    const exitCallback = mock.fn();
    const listener = keyListener.createListener(exitCallback);

    listener("a", { name: "a" });
    listener("b", { name: "b" });

    // Move left
    listener("", { name: "left" });
    assert.equal(mockOutput.moveCursor.mock.calls.length, 1);

    // Move right
    listener("", { name: "right" });
    assert.equal(mockOutput.moveCursor.mock.calls.length, 2);
  });
});
