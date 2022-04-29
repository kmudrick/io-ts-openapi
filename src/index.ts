#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { runProgram } from "./program";

const parser = yargs(hideBin(process.argv))
  .options({
    input: { type: "string", demandOption: true },
    output: { type: "string", demandOption: true },
    useJoda: { type: "boolean" },
  })
  .default({
    useJoda: false,
  });

(async () => {
  const { input, output, useJoda } = await parser.argv;
  await runProgram(input, output, useJoda);
  return output;
})().then(
  // eslint-disable-next-line no-console
  (fileWritten) => console.log(`Successfully wrote ${fileWritten}`),
  // eslint-disable-next-line no-console
  (err) => console.error("Unsuccessful", err)
);
