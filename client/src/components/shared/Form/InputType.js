import React from "react";

const InputType = ({
  labelText,
  labelFor,
  inputType,
  value,
  onChange,
  name,
  placeholder = "",
  required = false,
}) => {
  return (
    <div className="mb-2 text-start">
      <label
        htmlFor={labelFor || name}
        className="form-label mb-1 fw-semibold text-secondary"
        style={{ fontSize: "13px" }}
      >
        {labelText} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={inputType}
        className="form-control"
        id={labelFor || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default InputType;
