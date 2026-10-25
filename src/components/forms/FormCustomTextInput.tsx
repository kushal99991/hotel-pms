import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomTextInput, {
  CustomTextInputProps,
} from "components/widgets/CustomTextInput/CustomTextInput";

type FormCustomTextInputProps = CustomTextInputProps & {
  name: string;
};

const FormCustomTextInput: React.FC<FormCustomTextInputProps> = ({
  name,
  ...rest
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { invalid, isDirty, error },
      }) => {
        return (
          <CustomTextInput
            {...rest}
            name={name}
            onChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => onChange(event.target.value)}
            value={value ?? null}
            isInvalid={invalid || !isDirty}
            helperText={error?.message ?? ""}
          />
        );
      }}
    />
  );
};

export default FormCustomTextInput;
