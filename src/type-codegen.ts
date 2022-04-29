import * as t from "io-ts-codegen";
import {
  ArraySchema,
  JSONSchema,
  ObjectSchema,
  OneOfSchema,
} from "./json-schema";
import { LocalDateCombinator, LocalDateTimeCombinator } from "./types";

type ObjectCombinator = t.InterfaceCombinator | t.DictionaryCombinator;

function toObjectCombinator(
  schema: ObjectSchema,
  config: DeclarationConfig
): ObjectCombinator {
  const properties = schema.properties ?? {};
  if (schema.additionalProperties !== undefined) {
    return t.recordCombinator(
      t.stringType,
      toTypeReference(schema.additionalProperties, config)
    );
  } else {
    return t.typeCombinator(
      Object.keys(properties).map((key) => {
        const isOptional = !(schema.required?.includes(key) ?? false);
        const type = toTypeReference(properties[key], config);
        return t.property(key, type, isOptional);
      })
    );
  }
}

function toArrayCombinator(
  schema: ArraySchema,
  config: DeclarationConfig
): t.UnknownArrayType | t.ArrayCombinator {
  if (schema.items === undefined) {
    return t.unknownArrayType;
  } else {
    return t.arrayCombinator(toTypeReference(schema.items, config));
  }
}

export function toTypeReference(
  schema: JSONSchema,
  config: DeclarationConfig
): t.TypeReference {
  if (OneOfSchema.is(schema)) {
    const typeRefs = schema.oneOf.map((s) => toTypeReference(s, config));
    return t.unionCombinator(typeRefs);
  } else {
    switch (schema.type) {
      case "string":
        if (schema.enum !== undefined) {
          return t.keyofCombinator(schema.enum);
        } else if (schema.format === "date" && config.useJoda) {
          return LocalDateCombinator;
        } else if (schema.format === "date-time" && config.useJoda) {
          return LocalDateTimeCombinator;
        } else {
          return t.stringType;
        }
      case "number":
        return t.numberType;
      case "integer":
        return t.numberType;
      case "boolean":
        return t.booleanType;
      case "object":
        return toObjectCombinator(schema, config);
      case "null":
        return t.nullType;
      case "array":
        return toArrayCombinator(schema, config);
    }
  }
}

type Declarations = Array<t.TypeDeclaration | t.CustomTypeDeclaration>;

const isExported = true;
const isReadonly = true;

export interface DeclarationConfig {
  useJoda: boolean;
}

export function toDeclarations(
  references: Record<string, JSONSchema>,
  config: DeclarationConfig
): Declarations {
  const start: t.TypeDeclaration[] = [];
  const declarations: t.TypeDeclaration[] = Object.entries(references).reduce(
    (acc, entry) => {
      const [name, schema] = entry;
      const typeReference = toTypeReference(schema, config);
      if (typeReference === undefined) {
        // todo change signature to return Try<Declarations>
        throw new Error(
          `Type reference for ${JSON.stringify(
            schema,
            undefined,
            2
          )} is undefined`
        );
      }
      const declaration = t.typeDeclaration(
        name,
        typeReference,
        isExported,
        isReadonly
      );
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
