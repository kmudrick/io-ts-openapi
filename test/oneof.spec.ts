import $RefParser from "@apidevtools/json-schema-ref-parser";
import { formatValidationErrors } from "io-ts-reporters";
import * as E from "fp-ts/Either";
import { JSONSchema } from "../src/json-schema";

const StringValue = {
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

const BooleanValue = {
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

const AmountValue = {
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

const FieldValue = {
  oneOf: [StringValue, ByteArrayValue, BooleanValue, AmountValue],
};

const FieldValueMap = {
  type: "object",
  additionalProperties: FieldValue,
};

describe("oneOf Support - FieldValueMap", () => {
  test("Decoding", async () => {
    const dereferenced = await $RefParser.dereference(
      FieldValueMap as $RefParser.JSONSchema
    );
    const result = JSONSchema.decode(dereferenced);
    if (E.isLeft(result)) {
      const errors = formatValidationErrors(result.left);
      expect(errors).toBe([]);
    }
  });
});
