import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

import Icon from "../Icon";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  help?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "email" | "numeric" | "text";
}

/** Label + input + help + error text, as the design's field() helper. */
const FormField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error = "",
  help,
  type = "text",
  required = false,
  autoComplete,
  inputMode,
}: FormFieldProps) => (
  <div className="field">
    <label htmlFor={id}>
      {label}
      {required && (
        <span className="req" aria-hidden="true">
          *
        </span>
      )}
    </label>
    <input
      className="input"
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-required={required || undefined}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={`${help ? `${id}-help ` : ""}${id}-err`}
      autoComplete={autoComplete}
      inputMode={inputMode}
    />
    {help && (
      <p className="help" id={`${id}-help`}>
        {help}
      </p>
    )}
    <p className="error-text" id={`${id}-err`} hidden={!error}>
      {error && (
        <>
          <Icon name="alert" />
          <span>{error}</span>
        </>
      )}
    </p>
  </div>
);

export default FormField;
