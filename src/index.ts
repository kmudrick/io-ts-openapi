#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { runProgram } from "./program";

const parser = yargs(hideBin(process.argv)).options({
  input: { type: "string", demandOption: true },
  output: { type: "string", demandOption: true },
});

(async () => {
  const { input, output } = await parser.argv;
  await runProgram(input, output);
  return output;
})().then(
  (fileWritten) => console.log(`Successfully wrote ${fileWritten}`),
  (err) => console.error("Unsuccessful", err)
);
