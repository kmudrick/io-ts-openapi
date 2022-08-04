import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { stringWithMaxLength, stringWithMinLength } from "../src/refinements";

// todo convert to table based tests

describe("Refinement Support", () => {
  describe("stringWithMinLength", () => {
    describe("Decoding", () => {
      test("Handles valid input", () => {
        const input = "foo";
        const decoded = stringWithMinLength(1).decode(input);
        return pipe(
          decoded,
          fold(
            (errors) => expect(errors).toBe([]),
            (s) => {
              expect(s).toBe("foo");
            }
          )
        );
      });
      test("Handles invalid input", () => {
        const input = "foo";
        const decoded = stringWithMinLength(4).decode(input);
        return pipe(
          decoded,
          // fixme Does not satisfy minLength 4
          fold(
            (errors) => expect(errors).toHaveLength(1),
            () => {
              fail("Expected to fail");
            }
          )
        );
      });
    });
  });
  describe("stringWithMaxLength", () => {
    describe("Decoding", () => {
      test("Handles valid input", () => {
        const input = "foo";
        const decoded = stringWithMaxLength(3).decode(input);
        return pipe(
          decoded,
          fold(
            (errors) => expect(errors).toBe([]),
            (s) => {
              expect(s).toBe("foo");
            }
          )
        );
      });
      test("Handles invalid input", () => {
        const input = "foo";
        const decoded = stringWithMaxLength(2).decode(input);
        return pipe(
          decoded,
          // fixme Does not satisfy maxLength 2
          fold(
            (errors) => expect(errors).toHaveLength(1),
            () => {
              fail("Expected to fail");
            }
          )
        );
      });
    });
  });
});
