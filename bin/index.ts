#!/usr/bin/env ts-node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { runProgram } from "../src";

const parser = yargs(hideBin(process.argv)).options({
  input: { type: "string", demandOption: true },
  output: { type: "string", demandOption: true },
});

(async () => {
  const { input, output } = await parser.argv;
  await runProgram(input, output);
  return input;
})().then(
  (fileWritten) => console.log(`Successfully wrote ${fileWritten}`),
  (err) => console.error("Unsuccessful", err)
);
