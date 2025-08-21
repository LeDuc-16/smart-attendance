import React from "react";

type MyInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
};

const MyInput = ({
  label,
  placeholder,
  type = "text",
  id,
  value,
  onChange,
  className = "",
  disabled = false,  // ✅ THÊM DISABLED VÀO DESTRUCTURING
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
        disabled={disabled}  // ✅ BÂY GIỜ SẼ HOẠT ĐỘNG
        className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
      />
    </div>
  );
};

export default MyInput;
