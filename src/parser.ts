import YAML from "yaml";
import fs from "fs/promises";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import * as t from "io-ts";

type UnparsedSchemas = {
  name: string;
  content: unknown;
}[];

// from { components: { schemas: { Foo: {} } } }
// to   { definitions: { Foo: {} } }
// while replacing refs
function componentsToDefinitions(json: any): any {
  if (typeof json !== "object") {
    return json;
  } else {
    return Object.entries(json).reduce((acc, entry) => {
      const [originalName, originalValue] = entry;
      const name = originalName === "components" ? "definitions" : originalName;
      if (name === "$ref" && t.string.is(originalValue)) {
        const newValue = originalValue.replace(
          "#/components/schemas/",
          "#/definitions/"
        );
        return {
          ...acc,
          [name]: newValue,
        };
      } else if (t.UnknownRecord.is(originalValue)) {
        const newValue = componentsToDefinitions(originalValue);
        if (name === "schemas") {
          return { ...acc, ...newValue };
        } else {
          return {
            ...acc,
            [name]: newValue,
          };
        }
      } else if (t.UnknownArray.is(originalValue)) {
        const newValue = originalValue.map((_) => componentsToDefinitions(_));
        return {
          ...acc,
          [name]: newValue,
        };
      } else {
        return { ...acc, [name]: originalValue };
      }
    }, {});
  }
}

export async function parseFile(file: string): Promise<UnparsedSchemas> {
  const contents = await fs.readFile(file, "utf8");
  const yaml = YAML.parse(contents); // handles yaml or json
  const converted = componentsToDefinitions(yaml); // to deref we need Json Schema (not openapi)
  const dereferenced = await $RefParser.dereference(converted);
  const definitions = dereferenced.definitions ?? {}; // todo consider making no defs a failure
  return Object.entries(definitions).map(([name, content]) => ({
    name,
    content,
  }));
}
