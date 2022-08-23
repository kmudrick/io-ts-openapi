import $RefParser from "@apidevtools/json-schema-ref-parser";
import { formatValidationErrors } from "io-ts-reporters";
import * as E from "fp-ts/Either";
import { JSONSchema } from "../src/json-schema";

const ObjectWithMissingType = {
  properties: {
    someCount: {
      type: "integer",
    },
  },
};

describe("Support - Missing type, assume object", () => {
  test("Decoding", async () => {
    const dereferenced = await $RefParser.dereference(
      ObjectWithMissingType as $RefParser.JSONSchema
    );
    const result = JSONSchema.decode(dereferenced);
    if (E.isLeft(result)) {
      const errors = formatValidationErrors(result.left);
      expect(errors).toBe([]);
    }
  });
});
