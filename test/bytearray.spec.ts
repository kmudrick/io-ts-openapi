import $RefParser from "@apidevtools/json-schema-ref-parser";
import { formatValidationErrors } from "io-ts-reporters";
import * as E from "fp-ts/Either";
import { JSONSchema } from "../src/json-schema";

const ByteArray = {
  required: ["data"],
  type: "object",
  properties: {
    data: {
      type: "string",
      format: "binary",
    },
  },
};

const ByteArrayValue = {
  required: ["value"],
  type: "object",
  properties: {
    value: {
      required: ["data"],
      type: "object",
      properties: {
        data: {
          type: "string",
          format: "binary",
        },
      },
    },
  },
};

describe("ByteArray", () => {
  test("Decoding", async () => {
    const dereferenced = await $RefParser.dereference(ByteArray);
    const result = JSONSchema.decode(dereferenced);
    if (E.isLeft(result)) {
      const errors = formatValidationErrors(result.left);
      expect(errors).toBe([]);
    }
  });
});

describe("ByteArrayValue", () => {
  test("Decoding", async () => {
    const dereferenced = await $RefParser.dereference(ByteArrayValue);
    const result = JSONSchema.decode(dereferenced);
    if (E.isLeft(result)) {
      const errors = formatValidationErrors(result.left);
      expect(errors).toBe([]);
    }
  });
});
