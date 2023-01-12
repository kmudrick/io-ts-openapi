# @kmudrick/io-ts-openapi

Generates typescript io-ts codecs from the models of an OpenAPI Spec

## Background

[io-ts](https://github.com/gcanti/io-ts/blob/master/index.md) is a fantastic Typescript library that uses **_parser combinators_** for building static types and typed runtime codecs that can be used for validation (type guards), encoding, and decoding.

This project uses [io-ts-codegen](https://gcanti.github.io/io-ts-codegen/) to generate these types and codecs from the models of an openapi document.

Future enhancements will target support for refined types and alternate implementations (like Js-Joda for Date/Time types).

## Usage

```
npx @kmudrick/io-ts-openapi --help

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --input                                                    [string] [required]
  --output                                                   [string] [required]
  --useJoda                                           [boolean] [default: false]
  --isModel                                           [boolean] [default: false]
```

## Example

For example, to read [`specs/petstore.yaml`](./specs/petstore.yaml) and write the types and codecs to `petstore.ts`:

```
npx @kmudrick/io-ts-openapi \
    --input specs/petstore.yaml \
    --output petstore.ts

Successfully wrote petstore.ts
```

For this given input

```yaml
openapi: "3.0.0"
info:
  version: 1.0.0
  title: Swagger Petstore
  license:
    name: MIT
servers:
  - url: http://petstore.swagger.io/v1
paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      tags:
        - pets
      parameters:
        - name: limit
          in: query
          description: How many items to return at one time (max 100)
          required: false
          schema:
            type: integer
            format: int32
      responses:
        "200":
          description: A paged array of pets
          headers:
            x-next:
              description: A link to the next page of responses
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pets"
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    post:
      summary: Create a pet
      operationId: createPets
      tags:
        - pets
      responses:
        "201":
          description: Null response
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /pets/{petId}:
    get:
      summary: Info for a specific pet
      operationId: showPetById
      tags:
        - pets
      parameters:
        - name: petId
          in: path
          required: true
          description: The id of the pet to retrieve
          schema:
            type: string
      responses:
        "200":
          description: Expected response to a valid request
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        tag:
          type: string
    Pets:
      type: array
      items:
        $ref: "#/components/schemas/Pet"
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
```

Will produce this typescript output
for the models `Pet`, `Pets`, and `Error`

```typescript
import * as t from "io-ts";
export type SampleUnion = Readonly<
  | {
      code: number;
      message: string;
    }
  | {
      id: number;
      name: string;
      tag?: string;
    }
>;
export type Pet = Readonly<{
  id: number;
  name: string;
  tag?: string;
}>;
export type Pets = Readonly<
  Array<{
    id: number;
    name: string;
    tag?: string;
  }>
>;
export type Error = Readonly<{
  code: number;
  message: string;
}>;
export const SampleUnion = t.readonly(
  t.union([
    t.type({
      code: t.number,
      message: t.string,
    }),
    t.intersection([
      t.type({
        id: t.number,
        name: t.string,
      }),
      t.partial({
        tag: t.string,
      }),
    ]),
  ]),
  "SampleUnion"
);
export const Pet = t.readonly(
  t.intersection([
    t.type({
      id: t.number,
      name: t.string,
    }),
    t.partial({
      tag: t.string,
    }),
  ]),
  "Pet"
);
export const Pets = t.readonly(
  t.array(
    t.intersection([
      t.type({
        id: t.number,
        name: t.string,
      }),
      t.partial({
        tag: t.string,
      }),
    ])
  ),
  "Pets"
);
export const Error = t.readonly(
  t.type({
    code: t.number,
    message: t.string,
  }),
  "Error"
);
```

## JSON Schema Model Fragment Support

Using the `--isModel` switch will cause the input to be parsed as a top level schema fragment.
See [pet.yaml](./specs/pet.yaml) for an example.

## JS Joda Support

[js-joda](https://js-joda.github.io/js-joda/) is an excellent immutable date/time library for JS.

To enable `date` strings to use `LocalDate` and `date-time` strings to use `LocalDateTime`,
simply use the ``--useJoda` switch.

A model that looks like:

```yaml
LocalDateValue:
  type: object
  required:
    - value
  properties:
    value:
      type: string
      format: date
```

Will produce:

```
import * as t from "io-ts";
import { LocalDate } from "@js-joda/core";
import { LocalDateFromISOString } from "@kmudrick/io-ts-openapi/dist/src/types";

export type LocalDateValue = Readonly<{
  value: LocalDate
}>
export const LocalDateValue = t.readonly(t.type({
  value: LocalDateFromISOString
}), 'LocalDateValue')
```

The source for `LocalDateFromISOString` can be found [here](./src/types.ts)
