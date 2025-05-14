import React, { type ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  secondaryTitle?: string;
  children?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  fullScreen?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  maxWidth = "sm",
  secondaryTitle,
  title,
  fullScreen = false,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    // Prevent scrolling on body when modal is open
    if (open) {
      document.body.classList.add("overflow-hidden");
    }
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  // Don't render if not open
  if (!open) return null;

  // Map maxWidth prop to Tailwind classes
  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop - separate element for the semi-transparent background */}
      <div
        className="fixed inset-0 bg-black opacity-80"
        onClick={onClose}
      ></div>

      <div
        className={`relative bg-white rounded-md shadow-lg w-full ${
          maxWidthClasses[maxWidth]
        } ${fullScreen ? "h-full max-h-full" : "max-h-[90vh]"} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="modal-title"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 id="modal-title" className="text-xl font-medium text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              id="close-modal"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {secondaryTitle && (
            <p className="px-6 pb-4 text-sm text-gray-500">{secondaryTitle}</p>
          )}
        </div>
        <div className="overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
