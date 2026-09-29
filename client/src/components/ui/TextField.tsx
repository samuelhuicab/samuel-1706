import type { ComponentProps } from "react";

interface TextFieldProps extends ComponentProps<'input'> {
  id: string;
  label: string;
  error?: string;
}


function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>

      <input
        id={id}
        className={`form-input ${error ? 'input-error' : ''}`}
        {...inputProps}
      />

      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}


export default TextField;