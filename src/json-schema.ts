import * as t from "io-ts";

// io-ts codecs that describe a JSONSchema Document

// todo there are more formats
export const StringSchema = t.intersection([
  t.type({
    type: t.literal("string"),
  }),
  t.partial({
    enum: t.array(t.string),
    minLength: t.number,
    maxLength: t.number,
    pattern: t.string,
    format: t.keyof({
      date: null,
      time: null,
      "date-time": null,
      duration: null,
      binary: null,
    }),
  }),
]);
export type StringSchema = t.TypeOf<typeof StringSchema>;

// todo exclusiveMinimum, exclusiveMaximum, multiples, range
const NumericKeywordsSchema = t.partial({
  minimum: t.number,
  maximum: t.number,
});

export const NumberSchema = t.intersection([
  t.type({
    type: t.literal("number"),
  }),
  NumericKeywordsSchema,
]);
export type NumberSchema = t.TypeOf<typeof NumberSchema>;

export const IntegerSchema = t.intersection([
  t.type({
    type: t.literal("integer"),
  }),
  NumericKeywordsSchema,
]);
export type IntegerSchema = t.TypeOf<typeof IntegerSchema>;

export const BooleanSchema = t.type({
  type: t.literal("boolean"),
});
export type BooleanSchema = t.TypeOf<typeof BooleanSchema>;

export const NullSchema = t.type({
  type: t.literal("null"),
});
export type NullSchema = t.TypeOf<typeof NullSchema>;

// todo patternProperties, unevaluatedProperties, propertyNames,
// minProperties, maxProperties
export interface ObjectSchema {
  type?: "object";
  properties?: { [key: string]: JSONSchema }; // fixme
  required?: Array<string>;
  additionalProperties?: JSONSchema;
}

export const ObjectSchema: t.Type<ObjectSchema> = t.recursion(
  "ObjectSchema",
  () =>
    t.partial({
      required: t.array(t.string),
      properties: t.record(t.string, JSONSchema),
      additionalProperties: JSONSchema,
    })
);

// todo prefixItems (which makes items be allowed to be a boolean),
// contains, minContains, maxContains, uniqueItems (set)
export interface ArraySchema {
  type: "array";
  items?: JSONSchema; // fixme
  minItems?: number;
  maxItems?: number;
}

export const ArraySchema: t.Type<ArraySchema> = t.recursion("ArraySchema", () =>
  t.intersection([
    t.type({
      type: t.literal("array"),
    }),
    t.partial({
      items: JSONSchema,
      minItems: t.number,
      maxItems: t.number,
    }),
  ])
);

// type AdditionalProperties = JSONSchema | boolean;

export interface OneOfSchema {
  // todo support type
  oneOf: Array<JSONSchema>;
}

export const OneOfSchema: t.Type<OneOfSchema> = t.recursion("OneOfSchema", () =>
  t.type({
    oneOf: t.array(JSONSchema),
  })
);

export type JSONSchema =
  | StringSchema
  | NumberSchema
  | IntegerSchema
  | BooleanSchema
  | NullSchema
  | ObjectSchema
  | ArraySchema
  | OneOfSchema;

export const JSONSchema: t.Type<JSONSchema> = t.recursion("JSONSchema", () =>
  t.union([
    StringSchema,
    NumberSchema,
    IntegerSchema,
    BooleanSchema,
    NullSchema,
    ObjectSchema,
    ArraySchema,
    OneOfSchema,
  ])
);
