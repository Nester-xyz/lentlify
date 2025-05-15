import React, { useState, useRef, useEffect } from "react";

type Props = {
  name: string;
  label: string;
  onChange?: (values: string[]) => void;
  value?: string[];
  placeholder?: string;
};

const MultiSelectInput = ({
  name,
  label,
  onChange,
  value = [],
  placeholder = "Type and press Enter to add...",
}: Props) => {
  const [tags, setTags] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update internal state when external value changes
  useEffect(() => {
    setTags(value);
  }, [value]);

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") return;

    // Don't add duplicates
    if (!tags.includes(trimmedValue)) {
      const newTags = [...tags, trimmedValue];
      setTags(newTags);

      if (onChange) {
        onChange(newTags);
      }
    }

    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);

    if (onChange) {
      onChange(updatedTags);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleContainerClick = () => {
    // Focus the input when the container is clicked
    inputRef.current?.focus();
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <div
        ref={containerRef}
        className="flex flex-wrap items-center gap-2 w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-10 cursor-text"
        onClick={handleContainerClick}
      >
        {tags.map((tag, index) => (
          <div
            key={`${tag}-${index}`}
            className="bg-blue-100 text-blue-800 text-sm rounded px-2 py-1 flex items-center"
          >
            <span>{tag}</span>
            <button
              type="button"
              className="ml-1.5 text-blue-700 hover:text-blue-900"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}

        <input
          ref={inputRef}
          type="text"
          id={name}
          name={name}
          className="flex-grow outline-none min-w-20 bg-transparent"
          placeholder={tags.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Add button for convenience */}
      {inputValue.trim() !== "" && (
        <button
          type="button"
          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
          onClick={() => {
            addTag();
            inputRef.current?.focus();
          }}
        >
          Add "{inputValue}"
        </button>
      )}
    </div>
  );
};

// Example usage

export default MultiSelectInput;