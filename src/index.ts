import { parseFile } from "./parser";
import { JSONSchema } from "./json-schema";
import { isRight } from "fp-ts/lib/Either";
import { toDeclarations, getRuntime, getStatic } from "./type-codegen";
import fs from "fs/promises";
import path from "path";

export async function runProgram(
  inputFile: string,
  outputFile: string
): Promise<void> {
  const unparsedSchemas = await parseFile(inputFile);

  const parsed: Record<string, JSONSchema> = unparsedSchemas.reduce(
    (acc, entry) => {
      const { name, content } = entry;
      const decoded = JSONSchema.decode(content);
      if (isRight(decoded)) {
        const schema = decoded.right;
        return { ...acc, [name]: schema };
      } else {
        console.error(
          `Could not decode ${name}: ${JSON.stringify(decoded.left)}`
        );
        return acc;
      }
    },
    {}
  );
  const declarations = toDeclarations(parsed);
  const runtimeContents = getRuntime(declarations);
  const staticContents = getStatic(declarations);

  const contents = [staticContents, runtimeContents].join("\n");

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, contents, "utf8");
}
