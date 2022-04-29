import { LocalDate, Month } from "@js-joda/core";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { JSONSchema } from "../src/json-schema";
import { toDeclarations } from "../src/type-codegen";
import { LocalDateFromISOString } from "../src/types";

const DateWrapper: JSONSchema = {
  type: "object",
  properties: {
    value: {
      type: "string",
      format: "date",
    },
  },
};

describe("JS Joda Support", () => {
  describe("LocalDate", () => {
    describe("Decoding", () => {
      test("Handles valid input", () => {
        const input = "2010-01-22";
        const decoded = LocalDateFromISOString.decode(input);
        return pipe(
          decoded,
          fold(
            (errors) => expect(errors).toBe([]),
            (localDate) => {
              expect(localDate.year()).toBe(2010);
              expect(localDate.monthValue()).toBe(1);
              expect(localDate.dayOfMonth()).toBe(22);
            }
          )
        );
      });
      test("Handles invalid input", () => {
        const input = "2010-01";
        const decoded = LocalDateFromISOString.decode(input);
        return pipe(
          decoded,
          fold(
            (errors) => expect(errors).toHaveLength(1),
            () => {
              fail("Expected to fail");
            }
          )
        );
      });
    });
    test("Encoding", () => {
      const input = LocalDate.of(2020, Month.JANUARY, 1);
      const encoded = LocalDateFromISOString.encode(input);
      expect(encoded).toBe("2020-01-01");
    });
    test("Supports Declaration", () => {
      const useJoda = true;
      const expectations = [
        {
          kind: "TypeDeclaration",
          name: "DateWrapper",
          type: {
            kind: "InterfaceCombinator",
            properties: [
              {
                kind: "Property",
                key: "value",
                type: {
                  kind: "CustomCombinator",
                },
                isOptional: true,
              },
            ],
          },
          isExported: true,
          isReadonly: true,
        },
      ];
      const declarations = toDeclarations({ DateWrapper }, { useJoda });
      expect(declarations).toMatchObject(expectations);
    });
  });
});
