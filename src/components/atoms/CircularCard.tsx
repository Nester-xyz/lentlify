import React from "react";

type Props = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const CircularCard = ({ children, size = "md" }: Props) => {
  return (
    <div
      className={`border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 p-4 rounded-2xl overflow-hidden
        ${
          size === "sm"
            ? "rounded-md"
            : size === "md"
            ? "rounded-2xl"
            : "rounded-3xl"
        }
    `}
    >
      {children}
    </div>
  );
};

export default CircularCard;
