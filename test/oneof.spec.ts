import $RefParser from "@apidevtools/json-schema-ref-parser";
import { formatValidationErrors } from "io-ts-reporters";
import * as E from "fp-ts/Either";
import { JSONSchema } from "../src/json-schema";

const StringValue: unknown = {
  required: ["value"],
  type: "object",
  properties: {
    value: {
      required: ["data"],
      type: "object",
      properties: {
        data: {
          type: "string",
        },
      },
    },
  },
};

const BooleanValue: unknown = {
  required: ["value"],
  type: "object",
  properties: {
    value: {
      required: ["data"],
      type: "object",
      properties: {
        data: {
          type: "boolean",
        },
      },
    },
  },
};

const ByteArrayValue: unknown = {
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

const AmountValue: unknown = {
  required: ["value"],
  type: "object",
  properties: {
    value: {
      required: ["data"],
      type: "object",
      properties: {
        data: {
          type: "number",
        },
      },
    },
  },
};

const FieldValue: unknown = {
  oneOf: [StringValue, ByteArrayValue, BooleanValue, AmountValue],
};

const FieldValueMap: unknown = {
  type: "object",
  additionalProperties: FieldValue,
};

describe("oneOf Support - FieldValueMap", () => {
  test("Decoding", async () => {
    const dereferenced = await $RefParser.dereference(FieldValueMap);
    const result = JSONSchema.decode(dereferenced);
    if (E.isLeft(result)) {
      const errors = formatValidationErrors(result.left);
      expect(errors).toBe([]);
    }
  });
});
