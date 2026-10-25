import {
  ObjectSchema,
  SchemaDescription,
  SchemaFieldDescription,
  SchemaInnerTypeDescription,
  SchemaObjectDescription,
} from "yup";

function cleanFormKey(formKey: string) {
  // remove integers from keys like root.array.0.subArray.4
  const parts = formKey.split(".");
  return parts.filter((s) => Number.isNaN(+s));
}

function getSubfields(currentField: SchemaFieldDescription) {
  if (currentField.type === "array") {
    const innerDefinition = (currentField as SchemaInnerTypeDescription)
      .innerType;
    const nextFields = (innerDefinition as SchemaObjectDescription).fields;
    return nextFields;
  }
  return (currentField as SchemaObjectDescription).fields;
}

export function isFieldRequired(
  formNameKey: string,
  formSchema: ObjectSchema<any>
): boolean {
  if (!formNameKey) {
    return false;
  }
  const pathKeys = cleanFormKey(formNameKey);
  const currentLevelFields = formSchema.describe().fields;
  let schemaField = currentLevelFields[pathKeys[0]];
  if (pathKeys.length > 1) {
    let nextPathIndex = 1;
    while (nextPathIndex < pathKeys.length) {
      const fields = getSubfields(schemaField);
      schemaField = fields[pathKeys[nextPathIndex]];
      if (schemaField) {
        ++nextPathIndex;
      } else {
        break;
      }
    }
  }
  return !(schemaField as SchemaDescription)?.optional;
}
