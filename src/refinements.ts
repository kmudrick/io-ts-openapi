import * as t from "io-ts";
import { withValidate } from "io-ts-types";
import { Either, chain, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

export const stringWithMinLength = (minLength: number) =>
  withValidate(t.string, (value, context) =>
    pipe(
      t.string.validate(value, context),
      chain((s: string): Either<t.Errors, string> => {
        if (s.length >= minLength) {
          return right(s);
        } else {
          return left([
            {
              value,
              context,
              message: `Does not satisfy minLength ${minLength}`,
            },
          ]);
        }
      })
    )
  );

export const stringWithMaxLength = (maxLength: number) =>
  withValidate(t.string, (value, context) =>
    pipe(
      t.string.validate(value, context),
      chain((s: string): Either<t.Errors, string> => {
        if (s.length <= maxLength) {
          return right(s);
        } else {
          return left([
            {
              value,
              context,
              message: `Does not satisfy maxLength ${maxLength}`,
            },
          ]);
        }
      })
    )
  );

// todo implement pattern=regexp
// todo implement format=date
// todo implement format=time
// todo implement format=date-time
// todo implement format=duration
// todo implement format=binary ???
