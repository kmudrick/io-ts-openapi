import * as E from "fp-ts/Either";
import { JSONSchema } from "../src/json-schema";
import { toDeclarations } from "../src/type-codegen";

const AmountValue: unknown = {
  required: ["value"],
  type: "object",
  properties: {
    description: {
      type: "string",
    },
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

test("Handle Mapping Required Fields mapping", () => {
  const result = JSONSchema.decode(AmountValue);
  if (E.isRight(result)) {
    const declarations = toDeclarations(
      { AmountValue: result.right },
      { useJoda: false }
    );
    const expectations = [
      {
        kind: "TypeDeclaration",
        name: "AmountValue",
        type: {
          kind: "InterfaceCombinator",
          properties: [
            {
              kind: "Property",
              key: "description",
              type: {
                kind: "StringType",
                name: "string",
              },
            },
            {
              kind: "Property",
              key: "value",
              type: {
                kind: "InterfaceCombinator",
                properties: [
                  {
                    kind: "Property",
                    key: "data",
                    type: {
                      kind: "NumberType",
                      name: "number",
                    },
                    isOptional: false,
                  },
                ],
              },
              isOptional: false,
            },
          ],
        },
        isExported: true,
        isReadonly: true,
      },
    ];
    expect(declarations).toMatchObject(expectations);
  } else {
    expect(result.left).toBe([]);
  }
});
