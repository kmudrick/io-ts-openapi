import * as t from "io-ts-codegen";
import {
  ArraySchema,
  JSONSchema,
  ObjectSchema,
  OneOfSchema,
} from "./json-schema";

function toInterfaceCombinator(schema: ObjectSchema): t.InterfaceCombinator {
  const combinator = t.typeCombinator(
    Object.keys(schema.properties).map((key) =>
      t.property(
        key,
        toTypeReference(schema.properties[key]),
        schema.required?.includes(key) ?? false
      )
    )
  );
  return combinator;
}

function toArrayCombinator(
  schema: ArraySchema
): t.UnknownArrayType | t.ArrayCombinator {
  if (schema.items === undefined) {
    return t.unknownArrayType;
  } else {
    return t.arrayCombinator(toTypeReference(schema.items));
  }
}

export function toTypeReference(schema: JSONSchema): t.TypeReference {
  if (OneOfSchema.is(schema)) {
    const typeRefs = schema.oneOf.map(toTypeReference);
    return t.unionCombinator(typeRefs);
  } else {
    switch (schema.type) {
      case "string":
        return schema.enum ? t.keyofCombinator(schema.enum) : t.stringType;
      case "number":
        return t.numberType;
      case "integer":
        return t.numberType;
      case "boolean":
        return t.booleanType;
      case "object":
        return toInterfaceCombinator(schema);
      case "null":
        return t.nullType;
      case "array":
        return toArrayCombinator(schema);
    }
  }
}

type Declarations = Array<t.TypeDeclaration | t.CustomTypeDeclaration>;

const isExported = true;

export function toDeclarations(
  references: Record<string, JSONSchema>
): Declarations {
  const start: t.TypeDeclaration[] = [];
  const declarations: t.TypeDeclaration[] = Object.entries(references).reduce(
    (acc, entry) => {
      const [name, schema] = entry;
      const typeReference = toTypeReference(schema);
      if (typeReference === undefined) {
        // todo change signature to return Try<Declarations>
        throw new Error(
          `Type reference for ${JSON.stringify(schema)} is undefined`
        );
      }
      const declaration = t.typeDeclaration(name, typeReference, isExported);
      return [...acc, declaration];
    },
    start
  );
  return t.sort(declarations);
}

export function getRuntime(declarations: Declarations): string {
  return declarations.map((d) => t.printRuntime(d)).join("\n");
}

export function getStatic(declarations: Declarations): string {
  return declarations.map((d) => t.printStatic(d)).join("\n");
}
