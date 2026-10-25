import {
  FieldValues,
  UseFormGetValues,
  UseFormGetFieldState,
} from "react-hook-form";
import { isFieldRequired } from "./schema";
import { ObjectSchema } from "yup";

export const allFieldsReady = (
  rootName: string,
  getValues: UseFormGetValues<FieldValues>,
  getFieldState: UseFormGetFieldState<FieldValues>,
  schema: ObjectSchema<any>
): boolean => {
  const values = getValues(rootName);
  const fieldsReady = Object.keys(values).every((fieldName: string) => {
    const isRequired = isFieldRequired(`${rootName}.${fieldName}`, schema);
    if (isRequired && !values[fieldName]) {
      return false;
    }
    const { error, invalid } = getFieldState(`${rootName}.${fieldName}`);
    if (error || invalid) {
      return false;
    }
    return true;
  });
  return fieldsReady;
};
