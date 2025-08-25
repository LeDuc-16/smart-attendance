

type MyButtonProps = {
  title: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
};

const MyButton = ({
  title,
  onClick,
  type = "button",
  className = "",
  isLoading = false,
  disabled = false,
}: MyButtonProps) => {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`w-full py-2 px-4 flex items-center justify-center rounded transition duration-200 text-white font-semibold ${isLoading || disabled
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-blue-900 hover:bg-blue-800"
        } ${className}`}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 text-white mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          />
        </svg>
      )}
      {isLoading ? "Đang xử lý..." : title}
    </button>
  );
};

export default MyButton;
