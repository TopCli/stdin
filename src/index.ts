// Import Node.js Dependencies
import { emitKeypressEvents } from "node:readline";

// Import Internal Dependencies
import {
  KeyListener,
  type KeyListenerOptions
} from "./class/KeyListener.class.js";

export type StdinOptions = KeyListenerOptions;

export default function stdin(
  title: string | null,
  options: StdinOptions = {}
): Promise<string> {
  emitKeypressEvents(process.stdin);
  if (!process.stdin.isTTY) {
    throw new Error("Current stdin must be a TTY");
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  if (typeof title === "string") {
    process.stdout.write(title);
  }

  const { resolve, promise } = Promise.withResolvers<string>();

  const listener = new KeyListener(options)
    .createListener((result) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      process.stdin.removeListener("keypress", listener);

      resolve(result);
    });
  process.stdin.on("keypress", listener);

  return promise;
}
