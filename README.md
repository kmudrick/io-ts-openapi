# io-ts-openapi

> Generates typescript io-ts codecs from the models of an OpenAPI Spec

## Background

[io-ts](https://github.com/gcanti/io-ts/blob/master/index.md) is a fantastic Typescript library that uses **_parser combinators_** for building static types and typed runtime codecs that can be used for validation (type guards), encoding, and decoding.

This project uses [io-ts-codegen](https://gcanti.github.io/io-ts-codegen/) to generate these types and codecs from the models of an openapi document.

Future enhancements will target support for refined types and alternate implementations (like Js-Joda for Date/Time types).

## Usage

```
npx @kmudrick/io-ts-openapi --help

Options:
  --help     Show help                                        [boolean]
  --version  Show version number                              [boolean]
  --input                                           [string] [required]
  --output                                          [string] [required]
```

For example, to read `specs/petstore.yaml` and write the types and codecs to `petstore.ts`:

```
npx @kmudrick/io-ts-openapi \
    --input specs/petstore.yaml \
    --output petstore.ts

Successfully wrote petstore.ts
```

The example output from the above spec would be:

```typescript
import * as t from "io-ts";
interface Pet {
  id?: number;
  name?: string;
  tag: string;
}
type Pets = Array<{
  id?: number;
  name?: string;
  tag: string;
}>;
interface Error {
  code?: number;
  message?: string;
}
const Pet = t.intersection([
  t.type({
    tag: t.string,
  }),
  t.partial({
    id: t.number,
    name: t.string,
  }),
]);
const Pets = t.array(
  t.intersection([
    t.type({
      tag: t.string,
    }),
    t.partial({
      id: t.number,
      name: t.string,
    }),
  ])
);
const Error = t.partial({
  code: t.number,
  message: t.string,
});
```
