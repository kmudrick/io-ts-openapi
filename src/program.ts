import fs from "fs/promises";
import path from "path";
import { pipe } from "fp-ts/lib/function";
import { fold as eFold } from "fp-ts/lib/Either";
import { formatValidationErrors } from "io-ts-reporters";
import { parseFile } from "./parser";
import { JSONSchema } from "./json-schema";
import { toDeclarations, getRuntime, getStatic } from "./type-codegen";

export async function runProgram(
  inputFile: string,
  outputFile: string
): Promise<void> {
  const unparsedSchemas = await parseFile(inputFile);
  const parsed: Record<string, JSONSchema> = unparsedSchemas.reduce(
    (acc, entry) => {
      const { name, content } = entry;
      const decoded = JSONSchema.decode(content);
      return pipe(
        decoded,
        eFold(
          (errors) => {
            const result = {
              name,
              errors: formatValidationErrors(errors),
            };
            const reason = JSON.stringify(result, undefined, 2);
            // todo change signature to carry the error in the return
            throw new Error(`Could not decode ${name}: ${reason}`);
          },
          (schema) => ({ ...acc, [name]: schema })
        )
      );
    },
    {}
  );

  const declarations = toDeclarations(parsed);

  const runtimeContents = getRuntime(declarations);
  const staticContents = getStatic(declarations);
  const ioTsImport = 'import * as t from "io-ts";';

  const contents = [ioTsImport, staticContents, runtimeContents].join("\n");

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, contents, "utf8");
}
