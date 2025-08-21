import React from "react";

type MyInputProps = {
<<<<<<< HEAD
    label: string;
    placeholder: string;
    type?: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
};

const MyInput = ({
    label,
    placeholder,
    type = "text",
    id,
    value,
    onChange,
    className = "",
}: MyInputProps) => {
    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
            />
        </div>
    );
=======
  label: string;
  placeholder: string;
  type?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const MyInput = ({
  label,
  placeholder,
  type = "text",
  id,
  value,
  onChange,
  className = "",
}: MyInputProps) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
      />
    </div>
  );
>>>>>>> 0613f4f1dda44d5ae357617c15b1bee095de8123
};

export default MyInput;
