import React from 'react';

interface LoaderProps {
  progressMessage: string;
}

const Loader: React.FC<LoaderProps> = ({ progressMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#161b22] border border-[#30363d] rounded-lg">
      <svg
        className="animate-spin h-8 w-8 text-[#58a6ff]"
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
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="mt-3 text-[#c9d1d9] font-medium">{progressMessage}</p>
    </div>
  );
};

export default Loader;