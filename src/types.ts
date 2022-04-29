import { LocalDate, LocalDateTime } from "@js-joda/core";
import * as t from "io-ts";
import * as gen from "io-ts-codegen";
import { pipe } from "fp-ts/lib/function";
import { chain, tryCatch, toError } from "fp-ts/lib/Either";

export function validateLocalDateTime(
  value: string,
  context: t.Context
): t.Validation<LocalDateTime> {
  return tryCatch(
    () => LocalDateTime.parse(value),
    (e) => {
      const { message } = toError(e);
      return [{ context, value, message }];
    }
  );
}

export function validateLocalDate(
  value: string,
  context: t.Context
): t.Validation<LocalDate> {
  return tryCatch(
    () => LocalDate.parse(value),
    (e) => {
      const { message } = toError(e);
      return [{ context, value, message }];
    }
  );
}

export interface LocalDateFromISOStringC
  extends t.Type<LocalDate, string, unknown> {}

export const LocalDateFromISOString: LocalDateFromISOStringC = new t.Type<
  LocalDate,
  string,
  unknown
>(
  "LocalDateFromISOString",
  (u): u is LocalDate => u instanceof LocalDate,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      chain((s) => validateLocalDate(s, c))
    ),
  (localDate) => localDate.toJSON()
);

export interface LocalDateTimeFromISOStringC
  extends t.Type<LocalDateTime, string, unknown> {}

export const LocalDateTimeFromISOString: LocalDateTimeFromISOStringC =
  new t.Type<LocalDateTime, string, unknown>(
    "LocalDateTimeFromISOString",
    (u): u is LocalDateTime => u instanceof LocalDateTime,
    (u, c) =>
      pipe(
        t.string.validate(u, c),
        chain((s) => validateLocalDateTime(s, c))
      ),
    (localDateTime) => localDateTime.toJSON()
  );

export const LocalDateCombinator = gen.customCombinator(
  "LocalDate",
  "LocalDateFromISOString",
  ["LocalDateFromISOString"]
);

export const LocalDateTimeCombinator = gen.customCombinator(
  "LocalDateTime",
  "LocalDateTimeFromISOString",
  ["LocalDateTimeFromISOString"]
);
